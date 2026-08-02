import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

// Variabili d'ambiente da impostare su Vercel (Project Settings -> Environment Variables):
// SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY
export default async function handler(req, res) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  webpush.setVapidDetails(
    "mailto:noreply@ac-up.app",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);

  const { data: scadenze, error } = await supabase.from("ac_home_scadenze").select("*");
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const GIORNI_PREAVVISO = [1, 2, 5];
  let notificheInviate = 0;

  for (const scadenza of scadenze) {
    const dataScadenza = new Date(scadenza.data_scadenza);
    dataScadenza.setHours(0, 0, 0, 0);
    const giorniMancanti = Math.round((dataScadenza - oggi) / (1000 * 60 * 60 * 24));

    if (!GIORNI_PREAVVISO.includes(giorniMancanti)) continue;

    const colonnaNotifica = `notificato_${giorniMancanti}`;
    if (scadenza[colonnaNotifica]) continue; // gia' notificata per questa soglia

    const { data: subscriptions } = await supabase
      .from("ac_home_push_subscriptions")
      .select("*")
      .eq("user_id", scadenza.user_id);

    const payload = JSON.stringify({
      title: "AC Home · Scadenza in arrivo",
      body: `${scadenza.titolo}: tra ${giorniMancanti} giorno${giorniMancanti > 1 ? "i" : ""}`,
      url: "/ac-home",
    });

    for (const sub of subscriptions || []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        notificheInviate++;
      } catch (err) {
        // Se la subscription non e' piu' valida (endpoint scaduto/revocato), la rimuoviamo
        if (err.statusCode === 404 || err.statusCode === 410) {
          await supabase.from("ac_home_push_subscriptions").delete().eq("id", sub.id);
        }
      }
    }

    await supabase.from("ac_home_scadenze").update({ [colonnaNotifica]: true }).eq("id", scadenza.id);
  }

  res.status(200).json({ ok: true, notificheInviate });
}
