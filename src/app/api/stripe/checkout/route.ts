import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, TRIAL_PRICE_ID } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { plan } = await request.json();

  if (!["essentiel", "pro", "pro_direct"].includes(plan)) {
    return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
  }

  if (!TRIAL_PRICE_ID && plan !== "pro_direct") {
    return NextResponse.json({ error: "Configuration Stripe incomplète" }, { status: 500 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
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

  const proPriceId = process.env.STRIPE_PRICE_PRO!;

  let session;

  if (plan === "pro_direct") {
    // Abonnement direct sans essai
    session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: proPriceId, quantity: 1 }],
      success_url: absoluteUrl("/dashboard?checkout=success&plan=pro"),
      cancel_url: absoluteUrl("/abonnement?checkout=canceled"),
      metadata: { supabase_user_id: user.id, plan: "pro" },
      locale: "fr",
      billing_address_collection: "auto",
      allow_promotion_codes: true,
    });
  } else {
    // Essai 7 jours à 1€
    session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: TRIAL_PRICE_ID!, quantity: 1 }],
      payment_intent_data: {
        setup_future_usage: "off_session",
        metadata: { supabase_user_id: user.id, plan: "pro" },
      },
      success_url: absoluteUrl("/dashboard?checkout=success&plan=pro"),
      cancel_url: absoluteUrl("/abonnement?checkout=canceled"),
      metadata: { supabase_user_id: user.id, plan: "pro" },
      locale: "fr",
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      custom_text: {
        submit: {
          message: "Après votre période d'essai de 7 jours, votre abonnement sera automatiquement renouvelé à 19€/mois. Résiliable à tout moment avant la fin de l'essai depuis votre espace client.",
        },
      },
    });
  }

  return NextResponse.json({ url: session.url });
}
