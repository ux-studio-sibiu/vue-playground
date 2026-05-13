# Copilot Instructions

## Vue Template Formatting

- Keep Vue component tags with their attributes on a **single line** when possible.
- Do NOT split attributes across multiple lines.

Example — do this:
```vue
<Swiper :modules="modules" direction="horizontal" :slides-per-view="1" :speed="800" :mousewheel="false" :keyboard="{ enabled: true }" :pagination="{ clickable: true }" :navigation="true" class="fullpage-swiper">

<SwiperSlide v-for="(slide, i) in slides" :key="i" :style="{ backgroundColor: slide.bg }">
```

Not this:
```vue
<Swiper
  :modules="modules"
  direction="horizontal"
  :slides-per-view="1"
  :speed="800"
>
```
