# AC UP – Design System

**Versione:** 1.0  
**Stato:** Ufficiale  
**Ultimo aggiornamento:** Luglio 2026

---

# Scopo

Il Design System definisce tutte le regole visive e comportamentali dell'interfaccia di AC UP.

Ogni nuova schermata, componente o funzionalità deve rispettare questo documento.

Non è consentito introdurre nuovi stili, colori o componenti senza una revisione del Design System.

---

# Filosofia

L'interfaccia deve trasmettere:

- semplicità;
- ordine;
- fiducia;
- leggerezza;
- eleganza.

Il design non deve stupire.

Deve aiutare l'utente.

---

# Ispirazione

Il linguaggio visivo prende ispirazione da:

- Apple Health
- Headspace
- Notion
- Linear

Non deve copiarne lo stile, ma condividerne i principi:

- interfaccia pulita;
- gerarchia visiva chiara;
- tipografia leggibile;
- pochi colori;
- tanto spazio bianco.

---

# Principi

## White Space

Lo spazio vuoto è un elemento dell'interfaccia.

Mai riempire una schermata solo perché c'è spazio disponibile.

---

## Una sola azione principale

Ogni schermata deve avere una CTA principale.

Le azioni secondarie devono essere meno evidenti.

---

## Coerenza

Lo stesso elemento deve avere sempre lo stesso aspetto.

Mai utilizzare due componenti differenti per svolgere la stessa funzione.

---

## Gerarchia

L'utente deve capire in pochi secondi:

- dove si trova;
- cosa sta guardando;
- cosa può fare.

---

# Palette Ufficiale

## Primary

Verde

HEX

#5E8C61

---

## Primary Dark

#45684A

---

## Background

#F7F8F4

---

## Surface

#FFFFFF

---

## Border

#E4E7E4

---

## Text Primary

#1E2B22

---

## Text Secondary

#6B746D

---

## Success

#62C370

---

## Warning

#F2C14E

---

## Error

#E76F51

---

# Tipografia

Font ufficiale

Inter

Fallback

system-ui

---

Display

40

700

---

H1

32

700

---

H2

24

600

---

H3

20

600

---

Body

16

400

---

Caption

13

500

---

Mai utilizzare font differenti.

---

# Spaziature

Sistema a 8 punti.

Valori consentiti

4

8

16

24

32

40

48

64

Mai utilizzare valori casuali.

---

# Border Radius

Small

12

Medium

16

Large

24

Full

999

---

# Ombre

Utilizzare una sola ombra.

```css
box-shadow:
0 8px 30px rgba(0,0,0,.06);
```

Mai ombre pesanti.

---

# Layout

Mobile First.

Utilizzare sempre CSS Grid o Flex.

Evitare layout assoluti.

---

# Card

Le card rappresentano l'elemento principale dell'interfaccia.

Ogni card deve avere:

- background bianco;
- radius 24px;
- padding 24px;
- shadow leggera.

---

# Bottoni

## Primary

Sfondo verde.

Testo bianco.

Altezza

56px

---

## Secondary

Sfondo trasparente.

Bordo verde.

---

## Ghost

Solo testo.

---

Mai creare varianti aggiuntive senza approvazione.

---

# Input

Altezza

56px

Radius

16px

Focus

Primary Green

Label sempre visibile.

---

# Chip

Utilizzati per:

- categorie;
- filtri;
- tag;
- stato.

Forma completamente arrotondata.

---

# Badge

Colori consentiti

Success

Warning

Error

Neutral

Mai utilizzare badge decorativi.

---

# Progress Bar

Sempre animata.

Radius pieno.

Altezza

10px

---

# Circular Progress

Utilizzare solo per:

- peso;
- calorie;
- acqua;
- macro.

---

# Icone

Libreria ufficiale

Lucide React

Mai mescolare librerie differenti.

---

# Dashboard

La Home deve essere composta esclusivamente da card.

Ordine consigliato:

1. Obiettivo

2. Pasti di oggi

3. Calorie

4. Acqua

5. Peso

6. Lista della spesa

7. Progressi

---

# Pasti di oggi

La sezione deve utilizzare una griglia.

Mai utilizzare slider.

Mai utilizzare scroll orizzontale.

Layout

┌──────────────┬──────────────┐
│Colazione     │Spuntino AM   │
└──────────────┴──────────────┘

┌──────────────┬──────────────┐
│Pranzo        │Spuntino PM   │
└──────────────┴──────────────┘

┌─────────────────────────────┐
│Cena                         │
└─────────────────────────────┘

Ogni card deve mostrare:

- icona;
- nome pasto;
- ricetta;
- calorie;
- stato.

---

# Animazioni

Durata

250ms

Timing

ease-out

Le animazioni devono essere discrete.

Mai utilizzare effetti di rimbalzo.

---

# Stati

Ogni componente deve prevedere:

Loading

Empty

Success

Error

Disabled

---

# Responsive

Breakpoint

sm

640

md

768

lg

1024

xl

1280

Approccio Mobile First.

---

# Accessibilità

Contrasto minimo WCAG AA.

Touch target minimo

44x44

Focus visibile.

Navigazione tastiera.

Supporto Screen Reader.

---

# Regole di sviluppo

Non duplicare componenti.

Creare sempre componenti riutilizzabili.

Ogni componente deve essere documentato.

---

# Definition of Done

Un componente è completo solo se:

- rispetta il Design System;
- è responsive;
- è accessibile;
- è testato;
- è documentato;
- utilizza i Design Token.

---

# Regola finale

Quando esiste un dubbio progettuale, scegliere sempre la soluzione:

- più semplice;
- più leggibile;
- più coerente;
- più facile da mantenere.

La coerenza ha sempre la priorità sull'originalità.