import { salvaPushSubscription } from "./acHome";

// Chiave pubblica VAPID (non e' un segreto, puo' stare nel codice frontend)
const VAPID_PUBLIC_KEY = "BNok0ouMPlhFlAd6PfCC9Xg773oB7tAC-dpYN0eWcm-_cW_zSF6qLRmslQOd6oocYVrq4G6-mkBOxyBGtQ21wr0";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

// Richiede il permesso e attiva le notifiche push su questo dispositivo/browser.
// Ritorna true se attivate con successo, false altrimenti.
export async function attivaNotifichePush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Questo browser non supporta le notifiche push.");
  }

  const permesso = await Notification.requestPermission();
  if (permesso !== "granted") {
    throw new Error("Permesso per le notifiche non concesso.");
  }

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  await salvaPushSubscription(subscription);
  return true;
}

export async function notifichePushAttive() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return !!subscription;
}
