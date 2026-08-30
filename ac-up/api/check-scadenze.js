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
  const GIORNI_PREAVVISO = [1, 2, 5];
  let notificheInviate = 0;

  // Ora corrente in Italia, per confrontarla con l'orario scelto per ogni scadenza (es. "09:00").
  const oraItaliaCorrente = new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    hour: "2-digit",
    hourCycle: "h23",
  }).format(new Date());

  function eOraGiusta(oraNotifica) {
    if (!oraNotifica) return true; // se non impostata, non blocchiamo l'invio
    const oraImpostata = oraNotifica.split(":")[0].padStart(2, "0");
    return oraImpostata === oraItaliaCorrente;
  }

  async function invia(subscription, payload) {
    try {
      await webpush.sendNotification(
        { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
        payload
      );
      return true;
    } catch (err) {
      // Se la subscription non e' piu' valida (endpoint scaduto/revocato), la rimuoviamo
      if (err.statusCode === 404 || err.statusCode === 410) {
        await supabase.from("ac_home_push_subscriptions").delete().eq("id", subscription.id);
      }
      return false;
    }
  }

  // ============================================
  // AC HOME
  // ============================================
  const { data: scadenzeHome, error: errHome } = await supabase.from("ac_home_scadenze").select("*");
  if (errHome) {
    res.status(500).json({ error: errHome.message });
    return;
  }

  for (const scadenza of scadenzeHome) {
    const dataScadenza = new Date(scadenza.data_scadenza);
    dataScadenza.setHours(0, 0, 0, 0);
    const giorniMancanti = Math.round((dataScadenza - oggi) / (1000 * 60 * 60 * 24));

    if (!GIORNI_PREAVVISO.includes(giorniMancanti)) continue;
    if (!eOraGiusta(scadenza.ora_notifica)) continue;

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

    let inviataAlmenoUnaVolta = false;
    for (const sub of subscriptions || []) {
      const ok = await invia(sub, payload);
      if (ok) {
        notificheInviate++;
        inviataAlmenoUnaVolta = true;
      }
    }

    // IMPORTANTE: segniamo "notificata" solo se e' stata davvero recapitata a qualcuno.
    // Se non c'era ancora nessun dispositivo iscritto, ci riproviamo al prossimo giro.
    if (inviataAlmenoUnaVolta) {
      await supabase.from("ac_home_scadenze").update({ [colonnaNotifica]: true }).eq("id", scadenza.id);
    }
  }

  // Fa avanzare automaticamente le scadenze ricorrenti (annuale/biennale) gia' passate,
  // cosi' l'anno prossimo (o tra due anni) il ciclo di notifiche riparte da solo.
  const { data: scaduteRicorrentiHome } = await supabase
    .from("ac_home_scadenze")
    .select("*")
    .lt("data_scadenza", oggi.toISOString().slice(0, 10))
    .neq("ricorrenza", "una_tantum");

  for (const s of scaduteRicorrentiHome || []) {
    const prossima = new Date(s.data_scadenza);
    prossima.setFullYear(prossima.getFullYear() + (s.ricorrenza === "biennale" ? 2 : 1));
    await supabase
      .from("ac_home_scadenze")
      .update({
        data_scadenza: prossima.toISOString().slice(0, 10),
        notificato_1: false,
        notificato_2: false,
        notificato_5: false,
      })
      .eq("id", s.id);
  }

  // ============================================
  // ACPEPE (condivisa: notifica tutte le persone autorizzate, non solo chi ha creato la scadenza)
  // ============================================
  const { data: scadenzePepe, error: errPepe } = await supabase.from("ac_pepe_scadenze").select("*");
  if (!errPepe && scadenzePepe) {
    const { data: autorizzati } = await supabase.from("ac_pepe_utenti_autorizzati").select("user_id");
    const idAutorizzati = (autorizzati || []).map((a) => a.user_id);

    let subscriptionsPepe = [];
    if (idAutorizzati.length > 0) {
      const { data } = await supabase
        .from("ac_home_push_subscriptions")
        .select("*")
        .in("user_id", idAutorizzati);
      subscriptionsPepe = data || [];
    }

    for (const scadenza of scadenzePepe) {
      const dataScadenza = new Date(scadenza.data_scadenza);
      dataScadenza.setHours(0, 0, 0, 0);
      const giorniMancanti = Math.round((dataScadenza - oggi) / (1000 * 60 * 60 * 24));

      if (!GIORNI_PREAVVISO.includes(giorniMancanti)) continue;
      if (!eOraGiusta(scadenza.ora_notifica)) continue;

      const colonnaNotifica = `notificato_${giorniMancanti}`;
      if (scadenza[colonnaNotifica]) continue;

      const payload = JSON.stringify({
        title: "AcPepe · Scadenza in arrivo",
        body: `${scadenza.titolo}: tra ${giorniMancanti} giorno${giorniMancanti > 1 ? "i" : ""}`,
        url: "/ac-pepe/scadenze",
      });

      let inviataAlmenoUnaVolta = false;
      for (const sub of subscriptionsPepe) {
        const ok = await invia(sub, payload);
        if (ok) {
          notificheInviate++;
          inviataAlmenoUnaVolta = true;
        }
      }

      if (inviataAlmenoUnaVolta) {
        await supabase.from("ac_pepe_scadenze").update({ [colonnaNotifica]: true }).eq("id", scadenza.id);
      }
    }

    const { data: scaduteRicorrentiPepe } = await supabase
      .from("ac_pepe_scadenze")
      .select("*")
      .lt("data_scadenza", oggi.toISOString().slice(0, 10))
      .neq("ricorrenza", "una_tantum");

    for (const s of scaduteRicorrentiPepe || []) {
      const prossima = new Date(s.data_scadenza);
      prossima.setFullYear(prossima.getFullYear() + (s.ricorrenza === "biennale" ? 2 : 1));
      await supabase
        .from("ac_pepe_scadenze")
        .update({
          data_scadenza: prossima.toISOString().slice(0, 10),
          notificato_1: false,
          notificato_2: false,
          notificato_5: false,
        })
        .eq("id", s.id);
    }
  }

  res.status(200).json({ ok: true, notificheInviate });
}
