# Vue Playground

A Nuxt 4 sandbox where each page explores a different frontend concept — wizards & theming, interactive maps, scroll animations, and zoom interactions. Pages are intentionally independent; they share only the shadcn-vue UI primitives, design tokens (`app/assets/css/shadcn.css`, `app/assets/scss/_tokens.scss`), and Nuxt plumbing.

## Shared foundation

- **Framework:** Nuxt 4 + Vue 3 (`<script setup>`, Composition API)
- **Styling:** Tailwind (`@nuxtjs/tailwindcss`) + SCSS modules + shadcn-vue primitives under [app/components/ui](app/components/ui)
- **CMS:** Sanity v5 (`@nuxtjs/sanity`, studio embedded under [app/pages/studio](app/pages/studio))
- **Tokens:** see [docs/design-system-architecture.md](docs/design-system-architecture.md)

## Pages

### [mars](app/pages/mars.vue)

Multi-step wizard demo with runtime theme switching (`default` / `dark` / `mars`). Theme is driven by a `?style=` query param that toggles a class on `<html>`.

- **Stack:** [WizardDialog](app/wizard/components/wizard-dialog.vue) (radix-vue `Dialog`), step engine in [shared/wizard/engine.ts](shared/wizard/engine.ts), step registry [app/wizard/steps/mars/registry.ts](app/wizard/steps/mars/registry.ts)
- **Forms:** vee-validate + zod (see [useStepForm.ts](app/wizard/composables/useStepForm.ts))
- **Server validation:** [server/api/wizard/validate-step.post.ts](server/api/wizard/validate-step.post.ts), [finalize.post.ts](server/api/wizard/finalize.post.ts)
- **Theming:** per-theme SCSS files (`wizard-dialog.theme-mars.scss`, `wizard-dialog.theme-dark.scss`) — see [docs/wizard-architecture.md](docs/wizard-architecture.md)

### [map](app/pages/map/index.vue)

Interactive MapLibre map of central Sibiu rendered from a local `.pmtiles` archive, with clickable buildings, a year-based heatmap (`?sort=year`), zoom display, geo-fenced warning, and a building detail panel sourced from Sanity.

- **Stack:** [maplibre-gl](https://maplibre.org/) + [pmtiles](https://github.com/protomaps/PMTiles) protocol, tiles at [public/maps/sibiu.pmtiles](public/maps/sibiu.pmtiles)
- **Logic:** [use-map-page.ts](app/pages/map/use-map-page.ts), layer defs [lib/map-layers.ts](app/lib/map-layers.ts), heatmap [map-heatmap.ts](app/pages/map/map-heatmap.ts), geometry helpers [map-geojson.ts](app/pages/map/map-geojson.ts)
- **Data:** [server/api/map-buildings.get.ts](server/api/map-buildings.get.ts) (Sanity `building` schema) + static [public/maps/buildings.json](public/maps/buildings.json)
- **UI:** [BuildingDetail](app/components/building-detail.vue), [MapIntro](app/components/map-intro.vue) (Swiper)

### [gsap](app/pages/gsap.vue)

Scroll-driven architecture portfolio: staggered hero reveal, parallax project cards, pinned horizontal ticker, counter animations, scale-in footer.

- **Stack:** [gsap](https://gsap.com/) + `ScrollTrigger` plugin, scoped via `gsap.context()` for cleanup
- **Companion page:** [gsap-arh.vue](app/pages/gsap-arh.vue) — alternate composition
- **Styling:** [gsap.scss](app/pages/gsap.scss)

### [zoom](app/pages/zoom.vue)

Project grid where clicking a tile triggers a full-viewport CSS-transform zoom into that project, using the legacy [Zoomooz](https://github.com/jaukia/zoomooz) jQuery plugin loaded from a CDN.

- **Stack:** jQuery 1.9 + Zoomooz (loaded via `useHead({ script })`), with a Vue-managed overlay back button appended to `<html>` to escape the zoom transform
- **Styling:** [zoom.scss](app/pages/zoom.scss)

## Other routes

- [/](app/pages/index.vue), [/projects](app/pages/projects.vue), [/contact](app/pages/contact.vue) — marketing surfaces
- [/studio](app/pages/studio/index.vue) — embedded Sanity Studio ([sanity.config.ts](sanity.config.ts), schemas in [sanity/schemas](sanity/schemas))

## Setup

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run preview
npm run tokens:sync   # regenerate SCSS tokens from shadcn.css
```

Requires `NUXT_SANITY_PROJECT_ID` in the environment for Sanity-backed pages.
