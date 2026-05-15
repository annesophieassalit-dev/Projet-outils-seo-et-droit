import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, PLANS, TRIAL_PRICE_ID } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { plan } = await request.json();

  if (!["essentiel", "pro"].includes(plan)) {
    return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
  }

  const planConfig = PLANS[plan as keyof typeof PLANS];

  // Récupérer ou créer le customer Stripe
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, email")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  // Essai 7 jours à 1€ : trial_period_days démarre l'abonnement après 7 jours.
  // Le 1€ est facturé immédiatement via add_invoice_items sur la première facture.
  const trialInvoiceItems = TRIAL_PRICE_ID
    ? [{ price: TRIAL_PRICE_ID, quantity: 1 }]
    : undefined;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    payment_method_collection: "always",
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    ...(trialInvoiceItems ? { add_invoice_items: trialInvoiceItems } : {}),
    subscription_data: {
      trial_period_days: 7,
      trial_settings: { end_behavior: { missing_payment_method: "cancel" } },
      metadata: { supabase_user_id: user.id, plan },
    },
    success_url: absoluteUrl(`/dashboard?checkout=success&plan=${plan}`),
    cancel_url: absoluteUrl("/abonnement?checkout=canceled"),
    metadata: { supabase_user_id: user.id, plan },
    locale: "fr",
    billing_address_collection: "auto",
    allow_promotion_codes: true,
    custom_text: {
      submit: {
        message: "7 jours d'essai pour 1€, puis 19€/mois. Résiliable à tout moment. Un email vous sera envoyé avant le renouvellement.",
      },
    },
  });

  return NextResponse.json({ url: session.url });
}
