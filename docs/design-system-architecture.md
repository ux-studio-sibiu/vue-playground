# Design System Architecture

This document describes the design system (DS) layer that powers the Vue/Nuxt
playground and is intended to be portable to a future Next.js app without a
rewrite. Keep this file as the single reference for *where decisions live* and
*which layer owns which responsibility*.

---

## 1. Goals

- **One source of truth for design tokens.** Colors, spacing, radii live in one
  place and propagate to every consumer (Tailwind utilities, primitive
  components, SCSS authoring, future Next.js app).
- **Framework-agnostic public contract.** The public token API is plain CSS
  custom properties. Anything that can read CSS can adopt the DS — Vue, React,
  Angular, Web Components, vanilla HTML.
- **Tailwind for composition, primitives for meaning.** Pages compose layout
  with Tailwind utilities; semantic UI behavior (button, modal, input,
  field) lives in versioned components.
- **No premature monorepo.** While only one app consumes the DS, primitives
  live in-repo. Promotion to `packages/` happens only when a second real
  consumer appears.

---

## 2. The Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Design Tokens  (app/assets/css/shadcn.css)                 │
│  CSS variables:  --primary, --foreground, --radius, …       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Tailwind Theme  (tailwind.config.ts)                       │
│  Utilities mapped to CSS vars:  bg-primary, rounded-md, …   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  DS Primitives  (app/components/ui/**)                      │
│  Button, Input, Field, Dialog, Progress, StepperItem, …      │
│  Internals use Tailwind utilities + cva variants.           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Feature components & pages  (app/wizard/**, app/pages/**)  │
│  Compose primitives + Tailwind for layout.                  │
└─────────────────────────────────────────────────────────────┘
```

### Side channel: SCSS authoring

```
Design Tokens  ──(hsl bridge)──▶  app/assets/scss/_tokens.scss
                                  $color-primary: hsl(var(--primary))
                                  ↓ used by component-local .scss files
```

SCSS variables in the bridge **read** CSS variables at runtime, so dark mode
and future themes still work for any SCSS-authored component.

---

## 3. Where each kind of work belongs

### Use Tailwind utilities directly for

- Layout: `flex`, `grid`, `grid-cols-2`, `gap-4`
- Spacing: `p-4`, `mt-6`, `space-y-2`
- Responsive: `md:flex`, `lg:grid-cols-4`
- Positioning: `absolute`, `top-0`
- Local one-off tweaks: `mt-2`, `max-w-7xl`

### Use DS primitives for

- Interactive UI: `Button`, `Input`, `Select`, `Checkbox`, `Dialog`
- Field UX: `Field`, `FieldLabel`, `FieldHint`, `FieldError`
- Brand-consistent visuals: any component with `variant` / `size` props
- Patterns with built-in a11y: focus rings, `aria-*`, keyboard nav

### Never duplicate

Don't repeat utility blobs like `bg-primary text-primary-foreground px-4 py-2
rounded` in pages. Wrap them in a primitive with a `variant` prop. If a blob
appears in two places, extract it.

---

## 4. The token contract — `app/assets/css/shadcn.css`

Tokens are stored as **HSL channel triplets without the `hsl()` wrapper**:

```css
:root {
  --primary: 240 5.9% 10%;         /* H S% L%  */
  --primary-foreground: 0 0% 98%;
  --destructive: 0 84.2% 60.2%;
  --radius: 0.5rem;
}
.dark { /* same names, dark values */ }
```

Why no `hsl()` wrapper? So Tailwind can inject the alpha at the call site:

```ts
// tailwind.config.ts
primary: 'hsl(var(--primary) / <alpha-value>)'
```

…which lets `bg-primary/50` work transparently.

### Adding a token

1. Add the variable to **both** `:root` and `.dark` in `app/assets/css/shadcn.css`.
2. If it should be reachable as a Tailwind utility, extend
   [tailwind.config.ts](../tailwind.config.ts) `theme.extend.colors` (or
   `borderRadius`, etc.).
3. If SCSS authors need it, add an alias in
   [app/assets/scss/_tokens.scss](../app/assets/scss/_tokens.scss) as
   `$name: hsl(var(--name));`.

### Changing brand color

Swap only the `--primary` (and matching `--ring` for consistent focus) values.
Every consumer updates automatically.

---

## 5. Primitive conventions

All primitives live under `app/components/ui/<name>/`. Each folder has:

- `<Name>.vue` — the component
- `index.ts` — re-exports the component and, when applicable, a `cva` variants
  object and `*Variants` type

The shared shape:

```ts
// index.ts
import { cva, type VariantProps } from 'class-variance-authority'
export { default as Button } from './Button.vue'
export const buttonVariants = cva('…base classes…', {
  variants: { variant: { default: '…', outline: '…' }, size: { … } },
  defaultVariants: { variant: 'default', size: 'default' },
})
export type ButtonVariants = VariantProps<typeof buttonVariants>
```

```vue
<!-- Button.vue -->
<script setup lang="ts">
import { Primitive } from 'radix-vue'
import { type ButtonVariants, buttonVariants } from '.'
import { cn } from '~/lib/utils'

interface Props {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
}
const props = defineProps<Props>()
</script>

<template>
  <Primitive :class="cn(buttonVariants({ variant, size }), $attrs.class ?? '')">
    <slot />
  </Primitive>
</template>
```

Rules every primitive follows:

1. Tailwind utilities inside; **no** raw color/spacing literals (`#fff`, `8px`).
2. Forward `$attrs.class` so callers can add composition utilities from outside.
3. Expose meaningful states with `variant` and `size` props, not boolean flags.
4. Set ARIA where it makes sense (`aria-invalid`, `aria-describedby`,
   `role="alert"`, `aria-current`).
5. Keep behavior framework-agnostic in spirit — the *contract* (CSS classes,
   ARIA, tokens) should port to React with minimal change.

---

## 6. Current primitive inventory

| Primitive | Location | Notes |
|---|---|---|
| `Button` | `ui/button/` | shadcn-vue default; `variant`, `size` via cva |
| `Dialog` (+ parts) | `ui/dialog/` | Styled radix-vue parts: `DialogContent` (portal + overlay + animation), `DialogTitle` (default typography). Use `DialogRoot` / `DialogClose` directly from `radix-vue`. |
| `Field`, `FieldLabel`, `FieldHint`, `FieldError` | `ui/field/` | Composable form-field parts; provide/inject context for id + `aria-describedby` |
| `Input` | `ui/input/` | Auto-binds id and aria from `Field` context |
| `Select` | `ui/select/` | Same context wiring as `Input` |
| `Checkbox` | `ui/checkbox/` | Same context wiring as `Input` |
| `StepperItem` | `ui/stepper/` | Wizard sidebar item; variants `current \| visited \| upcoming` |

### Form-field composition example

```vue
<Field name="fullName" :error="form.errors.value.fullName">
  <FieldLabel>Earth name</FieldLabel>
  <Input v-model="fullName" v-bind="fullNameAttrs" />
  <FieldError />
</Field>
```

- `Field` generates a stable id, provides it via context.
- `FieldLabel` binds its `for` to that id.
- `FieldHint` / `FieldError` register themselves, their ids are joined into
  the `aria-describedby` that `Input`/`Select`/`Checkbox` automatically pick up.
- `Input` sets `aria-invalid="true"` when an error is present.

---

## 7. SCSS bridge — `app/assets/scss/_tokens.scss`

For component-local `.scss` files that exist alongside `.vue` files, the
bridge exposes SCSS aliases that read CSS variables at runtime:

```scss
$color-primary: hsl(var(--primary));
$color-foreground: hsl(var(--foreground));
$radius: var(--radius);
```

Rules:

- **Don't** define color/radius/spacing as SCSS literals anywhere outside the
  bridge. SCSS literals compile away — they can't theme.
- Prefer Tailwind utilities over importing the bridge. The bridge exists for
  legacy `.scss` files only.
- Auto-injected via Nuxt config (`vite.css.preprocessorOptions.scss.additionalData`)
  if the global SCSS pipeline points at it.

---

## 8. Tailwind config

Source: [tailwind.config.ts](../tailwind.config.ts)

- `darkMode: 'class'` — dark theme activates when `<html class="dark">`.
- All semantic colors (`primary`, `destructive`, `muted`, `accent`, …) are
  defined as `hsl(var(--…) / <alpha-value>)`, so `bg-primary/50` works.
- Border radii derive from `--radius`:
  - `rounded-sm` → `calc(var(--radius) - 4px)`
  - `rounded-md` → `calc(var(--radius) - 2px)`
  - `rounded-lg` → `var(--radius)`
  - `rounded-xl` → `calc(var(--radius) + 4px)`

When adding a token that should be a utility, extend the matching theme key.

---

## 9. Cross-framework story (Next.js)

Because the public contract is CSS variables, a Next.js consumer needs zero
SCSS:

```ts
// app/layout.tsx
import '@/styles/shadcn.css'  // copy of app/assets/css/shadcn.css
```

And the same `tailwind.config.ts` `theme.extend` block can be lifted verbatim
into the Next app's Tailwind config — utilities resolve through the same
CSS variables.

If/when this gets promoted to a real package:

```
packages/
  design-system/
    css/shadcn.css            # the tokens
    tailwind-preset.ts        # the theme.extend block as a preset
    components-vue/           # current Vue primitives
    components-react/         # future React mirrors (optional)
apps/
  vue-app/                    # consumes Vue primitives
  next-app/                   # consumes CSS + Tailwind preset (+ React mirrors)
```

Until then, treat `app/components/ui/` as the DS root and keep the layering
strict so the future extraction is a move, not a rewrite.

---

## 10. Decision log

| Decision | Rationale |
|---|---|
| Tokens as CSS variables (HSL channels), not SCSS literals | Runtime themable, alpha-friendly, framework-agnostic |
| Tailwind theme reads CSS variables | One token source flows to every utility |
| Primitives use `cva` + `cn` (shadcn pattern) | Already established by existing `Button.vue`; minimal churn |
| Field as composable parts (Field/Label/Hint/Error) over a bundled `<InputField>` | Flexible: works for checkbox-as-label, multi-control fields, custom layouts |
| Flat names (`Button`, `Dialog`, not `BaseButton`) | Matches existing convention; aligns with shadcn-vue ecosystem |
| In-repo `app/components/ui/`, no `packages/design-system/` yet | YAGNI; promotion is cheap when a second consumer arrives |
| SCSS bridge backed by `var(--…)` | Migration aid for existing `.scss` files; not the long-term path |

---

## 11. Quick adoption checklist (for new features)

1. Need a form input? Use `Field` + `FieldLabel` + (`Input` | `Select` |
   `Checkbox`) + `FieldError`. Don't reach for raw `<input>` + manual `<label>`.
2. Need spacing/layout? Tailwind utilities directly on the JSX/template.
3. Need a new color or radius? Add it to `shadcn.css` (both themes) and, if it
   should be a utility, to `tailwind.config.ts`.
4. Need a new interactive pattern? Add a primitive under `app/components/ui/`,
   following the cva + cn shape. Don't inline it in the page.
5. Building a `.scss` sibling? Import via `@use` from `_tokens.scss`; never
   hardcode `#hex` or `px` colors/spacing.
