# AC UP – Design Tokens

Version: 1.0

---

## Colors

```ts
export const colors = {
  primary: "#5E8C61",
  primaryDark: "#45684A",

  background: "#F7F8F4",
  surface: "#FFFFFF",

  border: "#E4E7E4",

  text: "#1E2B22",
  textSecondary: "#6B746D",

  success: "#62C370",
  warning: "#F2C14E",
  error: "#E76F51",

  protein: "#5B8DEF",
  carbs: "#F2994A",
  fat: "#62C370",
}
```

---

## Typography

```ts
export const typography = {

  fontFamily: "Inter",

  display: {
    size: 40,
    weight: 700,
    lineHeight: 48,
  },

  h1: {
    size: 32,
    weight: 700,
  },

  h2: {
    size: 24,
    weight: 600,
  },

  h3: {
    size: 20,
    weight: 600,
  },

  body: {
    size: 16,
    weight: 400,
  },

  caption: {
    size: 13,
    weight: 500,
  }

}
```

---

## Radius

```ts
export const radius = {

  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  full: 999

}
```

---

## Spacing

```ts
export const spacing = {

  xs:4,
  sm:8,
  md:16,
  lg:24,
  xl:32,
  xxl:48,
  xxxl:64

}
```

---

## Shadow

```ts
export const shadow = {

  sm:"0 2px 8px rgba(0,0,0,.05)",

  md:"0 8px 30px rgba(0,0,0,.06)",

  lg:"0 12px 40px rgba(0,0,0,.08)"

}
```

---

## Border

```ts
export const border = {

  width:1,

  color:"#E4E7E4"

}
```

---

## Animation

```ts
export const animation = {

  fast:150,

  normal:250,

  slow:350,

  easing:"ease-out"

}
```

---

## Grid

8pt System

```
4
8
16
24
32
40
48
64
```

---

## Breakpoints

```ts
export const breakpoints = {

  sm:640,

  md:768,

  lg:1024,

  xl:1280,

  "2xl":1536

}
```

---

## Icon Size

```ts
16

20

24

32
```

---

## Button Height

```ts
Small 40

Medium 48

Large 56
```

---

## Card Radius

```
24px
```

---

## Rule

Tutti i componenti devono utilizzare esclusivamente questi token.

Non sono ammessi valori hardcoded.