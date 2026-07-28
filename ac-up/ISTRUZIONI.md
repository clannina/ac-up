# AC UP — Istruzioni per mettere online l'app (nessun comando da scrivere)

Segui questi passaggi in ordine. Non serve installare nulla sul computer.

## 1. Crea il database su Supabase

1. Vai su supabase.com e accedi con il tuo account.
2. Crea un nuovo progetto (New project). Scegli un nome, es. "ac-up", e una password per il database (salvala da parte).
3. Aspetta che il progetto finisca di crearsi (1-2 minuti).
4. Nel menu a sinistra vai su **SQL Editor** → **New query**.
5. Apri il file `supabase/schema.sql` che trovi in questo pacchetto, copia **tutto** il contenuto e incollalo nell'editor SQL di Supabase.
6. Premi **Run**. Dovrebbe dirti che le tabelle sono state create senza errori.
7. Vai su **Project Settings** (icona ingranaggio) → **API**. Qui trovi due valori che ti serviranno tra poco:
   - **Project URL**
   - **anon public key**

## 2. Carica il codice su GitHub (senza terminale)

1. Vai su github.com e accedi.
2. Clicca **New repository** (pulsante verde in alto a destra).
3. Dai un nome, es. `ac-up`, lascialo **Public** o **Private** come preferisci, poi **Create repository**.
4. Nella pagina del repository appena creato, clicca **uploading an existing file** (o "Add file" → "Upload files").
5. Trascina **tutti i file e le cartelle** di questo pacchetto dentro l'area di upload (puoi trascinare l'intera cartella estratta dallo zip).
6. Scorri in basso e clicca **Commit changes**.

## 3. Collega il progetto a Vercel

1. Vai su vercel.com e accedi con il tuo account (puoi accedere direttamente con GitHub).
2. Clicca **Add New...** → **Project**.
3. Seleziona il repository `ac-up` che hai appena caricato e clicca **Import**.
4. Vercel riconosce automaticamente che è un progetto Vite: lascia le impostazioni di build come sono.
5. Prima di premere Deploy, apri la sezione **Environment Variables** e aggiungi:
   - `VITE_SUPABASE_URL` → incolla il Project URL copiato da Supabase
   - `VITE_SUPABASE_ANON_KEY` → incolla la anon public key copiata da Supabase
6. Clicca **Deploy**. In circa un minuto l'app sarà online con un indirizzo tipo `ac-up.vercel.app`.

## 4. Installa l'app come PWA

1. Apri l'indirizzo `ac-up.vercel.app` (o quello che ti ha dato Vercel) dal telefono.
2. **Android (Chrome)**: apparirà un banner "Aggiungi a schermata Home", oppure menu ⋮ → "Installa app".
3. **iPhone (Safari)**: tocca l'icona di condivisione (quadrato con freccia) → "Aggiungi a Home".
4. **Desktop (Chrome/Edge)**: icona di installazione nella barra degli indirizzi.

## Cosa fare quando aggiorniamo il codice insieme

Ogni volta che ti preparo dei file nuovi o modificati, ti basta:
1. Andare sul repository GitHub → "Add file" → "Upload files"
2. Caricare i file nuovi (sovrascrivono quelli vecchi con lo stesso nome/percorso)
3. Commit changes

Vercel rileva automaticamente il cambiamento e ripubblica l'app da sola in 1-2 minuti — non devi fare nient'altro.

---

**Stato attuale (primo incremento):**
- ✅ Home (segnaposto per acqua/peso/pressione)
- ✅ Menu con generatore automatico (25 ricette di esempio, regole rispettate)
- ✅ Database Supabase pronto con tutte le tabelle
- ⏳ Ricette, Lista spesa, Salute, Profilo: struttura pronta, da collegare a Supabase nei prossimi passaggi
- ⏳ Login utente: da aggiungere
- ⏳ Ricettario completo (130 ricette): da costruire
