import { precacheAndRoute } from "workbox-precaching";

// Precache standard generato da vite-plugin-pwa (necessario per il funzionamento offline)
precacheAndRoute(self.__WB_MANIFEST);

// Ricezione di una notifica push, anche ad app completamente chiusa
self.addEventListener("push", (event) => {
  let payload = { title: "AC Home", body: "Hai una scadenza in arrivo." };
  try {
    if (event.data) payload = event.data.json();
  } catch (e) {
    // se il payload non e' JSON valido, usiamo il messaggio di default sopra
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: payload.url || "/ac-home" },
    })
  );
});

// Tap sulla notifica: apre (o porta in primo piano) l'app su AC Home
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/ac-home";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientsArr) => {
      const client = clientsArr.find((c) => c.url.includes(url));
      if (client) return client.focus();
      return self.clients.openWindow(url);
    })
  );
});
