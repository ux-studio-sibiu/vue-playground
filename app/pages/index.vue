<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination, Mousewheel, Keyboard, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

import img1 from '~/images/1.png'
import img2 from '~/images/2.png'
import img3 from '~/images/3.png'

const modules = [Pagination, Mousewheel, Keyboard, Navigation]

const slides = [
  { title: 'Welcome Home', subtitle: 'This is the main page of our Vue playground.', image: img1 },
  { title: 'Our Work', subtitle: 'Explore our latest projects and case studies.', image: img2 },
  { title: 'Get in Touch', subtitle: 'Let\'s build something amazing together.', image: img3 },
]
</script>

<template>
  <Swiper :modules="modules" direction="horizontal" :slides-per-view="1" :speed="800" :mousewheel="false" :keyboard="{ enabled: true }" :pagination="{ clickable: true }" :navigation="true" class="fullpage-swiper">
    <SwiperSlide v-for="(slide, i) in slides" :key="i">
      <img :src="slide.image" :alt="slide.title" class="slide-bg" />
      <div class="slide-content">
        <!-- <h1>{{ slide.title }}</h1>
        <p>{{ slide.subtitle }}</p> -->
      </div>
    </SwiperSlide>
  </Swiper>
</template>

<style scoped lang="scss" src="./index.scss"></style>
