# Copilot Instructions

## File Naming

- Use **kebab-case** for `.vue` component filenames (e.g. `wizard-dialog.vue`, `background-slider.vue`, `building-detail.vue`).
- A component's sibling `.scss` file (when present) must share the same kebab-case stem: `wizard-dialog.vue` + `wizard-dialog.scss`. Keeps grep symmetric across template and stylesheet.
- Use **kebab-case** for `.ts` / `.scss` files (e.g. `map-layers.ts`, `_tokens.scss`).
- **Exception**: shadcn-vue primitives under `app/components/ui/**` stay PascalCase (`Button.vue`, `DialogContent.vue`) to match the upstream ecosystem.
- Component identifier in `<script>` imports stays PascalCase regardless of filename: `import WizardDialog from './wizard-dialog.vue'`. Templates can use either `<WizardDialog>` or `<wizard-dialog>`; prefer `<WizardDialog>` for consistency with the import name.

## Vue Template Formatting

- Keep Vue component tags with their attributes on a **single line** by default.
- Only use vertical (multi-line) attribute formatting when a tag has **more than 2 long attributes** (e.g. long bound expressions, long class strings, long inline objects). If there are 2 or fewer long attributes, keep the whole tag on one line — even if the line gets wide.
- Do NOT split attributes across multiple lines just for readability when the threshold above is not met.

Example — do this (≤ 2 long attributes → single line):
```vue
<Swiper :modules="modules" direction="horizontal" :slides-per-view="1" :speed="800" :mousewheel="false" :keyboard="{ enabled: true }" :pagination="{ clickable: true }" :navigation="true" class="fullpage-swiper">

<SwiperSlide v-for="(slide, i) in slides" :key="i" :style="{ backgroundColor: slide.bg }">

<DialogContentRadix v-bind="forwarded" :class="cn('fixed left-1/2 top-1/2 z-50 ...long class string...', props.class ?? '')">
```

Not this (avoid vertical split when ≤ 2 long attributes):
```vue
<Swiper
  :modules="modules"
  direction="horizontal"
  :slides-per-view="1"
  :speed="800"
>
```

Vertical formatting is acceptable only when there are 3+ long attributes on a single tag.

## CSS / SCSS Class Naming

- Use **flat, grep-friendly class names**: `wizard-dialog-close`, `wizard-dialog-title`, `building-card-header`.
- Do NOT use BEM-style nesting with `&__` in SCSS. Every class should appear in the codebase as a full literal string so `Ctrl+F <class-name>` finds every reference (template + stylesheet) without expanding nested selectors mentally.
- Pattern: `<component-kebab-name>-<part>`. The component name comes first, the part name follows.

Do this:
```scss
.wizard-dialog-close { color: hsl(var(--muted-foreground)); }
.wizard-dialog-title { font-weight: 600; }

:global(.theme-mars) .wizard-dialog-close { color: hsl(var(--destructive)); }
```

Not this:
```scss
.wizard-dialog {
  &__close { color: hsl(var(--muted-foreground)); }
  &__title { font-weight: 600; }
}
```

Modifier states (`:hover`, `:focus`, `:disabled`, etc.) and structural pseudo-selectors may still nest with `&` — that doesn't hide the class name from grep.

## Tokens vs Free-Form Theme CSS

Two ways to vary styles per theme. Pick the one that fits the *scope* of the variation:

- **Use a CSS variable** (`--foo` in `app/assets/css/shadcn.css`) when the value is referenced by **2+ components** or represents a **brand-level decision** (palette, radius, ring width, body font). The whole point of the token contract is consistency — if every theme needs to flip a value, declare it once.
- **Use free-form CSS inside a `:global(.theme-*)` block** in the component's local `.scss` when the variation is **local to one component** and unlikely to be shared. Examples: an oversized close icon only in Mars, a circular avatar border only in Ocean, a specific gradient on one card.

Heuristic / decision questions:

1. Would two unrelated components both want to read this value? → token.
2. Is this value already conceptually in the palette (a color, a radius, a spacing scale step)? → token.
3. Is the change a layout or structural override (size, position, pseudo-element)? → free-form CSS in the component's theme block.
4. Would adding this as a token bloat `shadcn.css` with a row that has no other consumer? → keep it free-form.

Other rules:

- Free-form theme blocks should **still read existing tokens** wherever possible. Prefer `hsl(var(--destructive))` over a hardcoded hex — the palette already adapts.
- When promoting a free-form rule into a token: add the `--foo` to **every** theme block in `shadcn.css` (`:root`, `.dark`, `.theme-mars`). A token that only exists in one theme is a footgun.
- Do not invent per-component tokens like `--dialog-close-size` unless that value really is a shared design decision. One-off sizing belongs in the component's SCSS theme block.

## Per-Theme Stylesheet Files

When a component needs theme-specific overrides, split each theme into its own sibling SCSS file rather than appending more `:global(.theme-*)` blocks to the base stylesheet.

- Base styles live in `<component>.scss` (no `:global(.theme-*)` wrappers).
- Each theme override lives in `<component>.theme-<name>.scss`. Write selectors as `:global(.theme-<name>) .component-class { }` — **not** nested inside a `:global()` block. Vue only scopes the rightmost non-global selector; nesting inside `:global()` makes every selector in the block global and leaks styles to other components.
- Wire each file via its own `<style scoped lang="scss" src="./...">` tag in the SFC. All `<style scoped>` blocks in one SFC share the same scope hash, so selectors compose cleanly across files.

Example layout:
```
wizard-dialog.vue
wizard-dialog.scss                 // base
wizard-dialog.theme-mars.scss      // :global(.theme-mars) { ... }
wizard-dialog.theme-ocean.scss     // :global(.theme-ocean) { ... }
```

```vue
<style scoped lang="scss" src="./wizard-dialog.scss"></style>
<style scoped lang="scss" src="./wizard-dialog.theme-mars.scss"></style>
<style scoped lang="scss" src="./wizard-dialog.theme-ocean.scss"></style>
```

Why: each theme becomes a self-contained, deletable unit; the file list communicates which themes a component supports; merge conflicts on theme work don't collide with base styles. The cost is a repeated `:global(.theme-*)` wrapper per file — accept it.

Don't split when a component has zero theme overrides — only the base `.scss` should exist.

## Documentation Maintenance

- After any code change that affects something described in `docs/` (component APIs, props, architecture diagrams, file structure, conventions, public exports, build/run commands, etc.), update the relevant doc file in the same change.
- Do NOT create new `.md` files just to record what changed. Edit existing docs in place.
- Only create a new doc file when introducing a new architectural area that has no existing home in `docs/`, and keep it scoped to durable reference material — not changelogs.
- When removing or renaming a symbol, grep `docs/` for references and update or remove them too.
- Keep doc edits minimal and factual: update only the lines that no longer match reality.
