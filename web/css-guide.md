# CSS Guide

## Reset

Apply a minimal reset at the top of the file — before any tokens or component styles.

```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

img, picture {
  display: block;
}
```

### Rules
- `box-sizing: border-box` on everything so padding and border are included in declared widths
- Zero out `margin` and `padding` globally — set spacing deliberately per component
- `display: block` on `img` and `picture` removes the default inline gap at the bottom of images
- Keep the reset minimal — don't reset things you'll always override anyway

---

## Design Tokens

Declare all design decisions as CSS custom properties on `:root`. Never hard-code a color, font, or radius inline. For example:

```css
:root {
  --color-background: #292831;
  --color-primary:    #ee8695;
  --color-secondary:  #4a7a96;
  --color-tertiary:   #333f58;
  --color-highlight:  #fbbbad;

  --font-display: "Lilita One", serif;
  --font-body:    "Nunito", sans-serif;

  --radius-card: 20px;
  --radius-pill: 9999px;
}
```

### Naming convention

```
--category-name
```

- `--color-*` — all colors
- `--font-*` — font stacks
- `--radius-*` — border radii
- `--space-*` — spacing scale (if needed)
- `--shadow-*` — box shadows (if needed)

### Rules
- Tokens live in `:root` so they are globally available
- Name by role, not value: `--color-primary` not `--pink`
- Group by category with a blank line between groups
- Tokens defined here mirror the source of truth in the app (`app/src/theme.ts`)

---

## Property Order

Group properties in three layers — outer to inner.

### 1. Box (position relative to parent)
How the element sits in the flow and how much space it takes up.

```css
z-index
position
top / right / bottom / left

width / min-width / max-width
height / min-height / max-height
margin
padding
overflow
```

### 2. Container (appearance of the box itself)
Visual treatment of the element's surface.

```css
border
border-radius
background / background-image / background-size / background-position
box-shadow
opacity
transition
animation
```

### 3. Content (how things inside are arranged and styled)
Layout and typography for the element's children.

```css
display
flex-direction / flex-wrap / justify-content / align-items / align-self
gap

font-family / font-size / font-weight / line-height
color
text-align
cursor
```

### Blank lines between groups

Only add a blank line between groups when the rule has **more than 10 lines**. For short rules, write all properties continuously — the group order alone is enough to scan.

**Short rule (≤ 10 lines) — no blank lines:**

```css
.pill {
  padding: 3px 12px;
  background-color: var(--color-background);
  border-radius: var(--radius-pill);
  display: inline-block;
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}
```

**Long rule (> 10 lines) — blank lines between groups:**

```css
.card {
  width: 100%;
  margin: 0.5rem;
  padding: 5rem 1.5rem;
  overflow: hidden;

  background-image: url('./hero.png');
  background-size: cover;
  background-position: center;
  border-radius: 1rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);

  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1rem;
  color: var(--color-text);
}
```

---

## Media Queries — Mobile First

Write base styles for mobile, then use `min-width` queries to progressively enhance for larger screens. Never use `max-width` to undo styles — that's desktop-first thinking.

### Breakpoints

```css
/* base          — mobile, no query needed */
/* sm: 480px     — large phones / landscape */
/* md: 768px     — tablets */
/* lg: 1024px    — small desktops */
/* xl: 1280px    — wide desktops */
```

### Where to put them

Place media queries **at the bottom of the file**, grouped by breakpoint — not scattered next to each rule. This keeps the mobile styles clean and the overrides easy to find.

```css
/* ─── Base (mobile) ─────────────────────── */

.card {
  width: 100%;
  padding: 1.5rem;

  border-radius: 1rem;

  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card__title {
  font-size: 1.25rem;
}


/* ─── md: 768px ──────────────────────────── */

@media (min-width: 768px) {
  .card {
    padding: 2rem;
    flex-direction: row;
  }

  .card__title {
    font-size: 1.5rem;
  }
}


/* ─── lg: 1024px ─────────────────────────── */

@media (min-width: 1024px) {
  .card {
    max-width: 960px;
    margin-inline: auto;
  }
}
```

### Rules
- Start with the smallest screen — base styles require no query
- Use `min-width`, never `max-width` to override mobile styles
- One block per breakpoint at the bottom, not one query per rule throughout the file
- Only put overrides inside the query — don't repeat properties that don't change

---

## Class Naming — BEM

Use **Block__Element--Modifier** (BEM).

```
block               — standalone component
block__element      — a part of the block
block--modifier     — a variant of the block
block__element--modifier — a variant of an element
```

### Rules
- Use lowercase and hyphens for multi-word names: `hero-text`, not `heroText`
- The block is the top-level component name: `card`, `nav`, `form`
- Elements are direct logical parts of the block: `card__title`, `nav__link`
- Modifiers describe state or variant: `btn--disabled`, `card--featured`
- Don't nest deeper than two levels — if you need `block__element__sub`, the sub is probably its own block

### Examples

```css
/* Block */
.btn { }

/* Elements */
.btn__label { }
.btn__spinner { }

/* Modifiers */
.btn--primary { }
.btn--ghost { }

/* Element modifier */
.btn__label--hidden { }
```

```html
<button class="btn btn--primary">
  <span class="btn__label">Submit</span>
  <span class="btn__spinner" hidden></span>
</button>
```
