const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const NOTIFY_EMAIL = "annesophieassalit@gmail.com";

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const userId = payload.record?.id;
    if (!userId) return new Response("No ID", { status: 400 });

    // Récupère l'email depuis auth.users via l'API admin
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    const userData = await userRes.json();
    const email = userData.email ?? "inconnu";
    const date = new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Visible & Conforme <onboarding@resend.dev>",
        to: [NOTIFY_EMAIL],
        subject: `Nouvelle inscription — ${email}`,
        html: `
          <h2 style="font-family:sans-serif;">Nouveau compte créé</h2>
          <p style="font-family:sans-serif;"><strong>Email :</strong> ${email}</p>
          <p style="font-family:sans-serif;"><strong>Date :</strong> ${date}</p>
          <p style="font-family:sans-serif;font-size:12px;color:#888;">
            Visible &amp; Conforme · notification automatique
          </p>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return new Response("Email error", { status: 500 });
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Server error", { status: 500 });
  }
});
