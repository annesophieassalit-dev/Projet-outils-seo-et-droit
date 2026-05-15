import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  const getPlanFromPriceId = (priceId: string): string => {
    if (priceId === process.env.STRIPE_PRICE_ESSENTIEL) return "essentiel";
    if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
    return "gratuit";
  };

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      const plan = session.metadata?.plan || "pro";

      if (!userId) break;

      if (session.mode === "payment") {
        // Paiement 1€ : récupérer la carte et créer l'abonnement avec 7 jours d'essai
        const paymentIntent = await stripe.paymentIntents.retrieve(
          session.payment_intent as string
        );
        const paymentMethodId = typeof paymentIntent.payment_method === "string"
          ? paymentIntent.payment_method
          : paymentIntent.payment_method?.id;

        if (paymentMethodId && session.customer) {
          await stripe.customers.update(session.customer as string, {
            invoice_settings: { default_payment_method: paymentMethodId },
          });

          const trialEnd = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
          const priceId = process.env.STRIPE_PRICE_PRO!;

          const subscription = await stripe.subscriptions.create({
            customer: session.customer as string,
            items: [{ price: priceId }],
            trial_end: trialEnd,
            default_payment_method: paymentMethodId,
            metadata: { supabase_user_id: userId, plan },
          });

          await supabaseAdmin.from("profiles").update({
            trial_ends_at: new Date(trialEnd * 1000).toISOString(),
            stripe_subscription_id: subscription.id,
            subscription_status: "trialing",
          }).eq("id", userId);
        }
      } else {
        // Abonnement direct (sans essai)
        await supabaseAdmin.from("profiles").update({
          plan,
          stripe_subscription_id: session.subscription as string,
          subscription_status: "active",
          subscription_current_period_end: null,
        }).eq("id", userId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;
      const priceId = subscription.items.data[0]?.price.id;
      const plan = getPlanFromPriceId(priceId);

      if (userId) {
        await supabaseAdmin.from("profiles").update({
          plan,
          subscription_status: subscription.status,
          stripe_subscription_id: subscription.id,
          subscription_current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
        }).eq("id", userId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;

      if (userId) {
        await supabaseAdmin.from("profiles").update({
          plan: "gratuit",
          subscription_status: "canceled",
          stripe_subscription_id: null,
        }).eq("id", userId);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId);

      if (profiles && profiles.length > 0) {
        await supabaseAdmin.from("profiles").update({
          subscription_status: "past_due",
        }).eq("stripe_customer_id", customerId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
