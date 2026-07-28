# AC UP – Component Library

Version: 1.0

---

# Layout

## Page

Utilizzato per tutte le schermate.

Props

- title
- subtitle
- children

---

## Section

Raggruppa blocchi omogenei.

Props

- title
- action
- children

---

# Buttons

## PrimaryButton

Uso

Azione principale.

Height

48px

Radius

16px

---

## SecondaryButton

Sfondo bianco.

Bordo 1px.

---

## GhostButton

Solo testo.

---

## IconButton

Solo icona.

40x40

---

# Cards

## Card

Componente base.

Padding

24px

Radius

24px

Shadow MD

---

## MealCard

Visualizza un pasto.

Props

- meal
- calories
- proteins
- carbs
- fats
- completed

Clickable

Sì

---

## RecipeCard

Props

- image
- title
- prepTime
- calories
- difficulty

---

## StatCard

Props

- icon
- title
- value
- trend

---

## GoalCard

Mostra il progresso verso un obiettivo.

---

## WaterCard

Visualizza i bicchieri giornalieri.

---

## WeightCard

Visualizza peso e andamento.

---

# Inputs

## TextField

Varianti

- Default
- Error
- Disabled

---

## SearchField

Con icona sinistra.

---

## Select

Menu a tendina.

---

## Toggle

On / Off

---

## Checkbox

Con label.

---

# Navigation

## BottomNavigation

5 voci

- Home
- Piano
- Ricette
- Spesa
- Profilo

---

## TopBar

Contiene

- Titolo
- Avatar
- Notifiche

---

# Feedback

## Toast

Varianti

- Success
- Error
- Warning
- Info

Durata

3000 ms

---

## Modal

Dimensione

Small

Medium

Large

---

# Progress

## ProgressBar

Valore

0-100%

---

## CircularProgress

Per calorie e acqua.

---

# Charts

## WeightChart

Linea.

7 / 30 / 90 giorni.

---

## CaloriesChart

Barre.

---

# Empty State

Sempre composto da

- Illustrazione
- Titolo
- Descrizione
- CTA

---

# Skeleton

Ogni pagina deve avere uno Skeleton dedicato.

Mai spinner centrali.

---

# Loading

Preferire Skeleton.

Evitare loader a schermo intero.

---

# Regole

✓ Tutti i componenti sono riutilizzabili.

✓ Nessuna logica di business all'interno dei componenti UI.

✓ Componenti piccoli e composti.

✓ Nessun colore hardcoded.

✓ Nessuna dimensione hardcoded.

✓ Tutti i valori provengono dai Design Tokens.