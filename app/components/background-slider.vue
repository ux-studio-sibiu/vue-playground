<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination, Mousewheel, Keyboard, Navigation } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
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

const swiperRef = ref<SwiperType | null>(null)

function elasticBounce(swiper: SwiperType, direction: 'next' | 'prev') {
  const offset = direction === 'next' ? -40 : 40
  const wrapper = swiper.wrapperEl
  const origDuration = wrapper.style.transitionDuration
  const origTiming = wrapper.style.transitionTimingFunction
  const origTransform = wrapper.style.transform

  wrapper.style.transitionDuration = '300ms'
  wrapper.style.transitionTimingFunction = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  wrapper.style.transform = `translate3d(${swiper.translate + offset}px, 0px, 0px)`
  setTimeout(() => {
    wrapper.style.transitionDuration = '500ms'
    wrapper.style.transitionTimingFunction = 'cubic-bezier(0.165, 0.84, 0.44, 1)'
    wrapper.style.transform = origTransform
  }, 150)
}

function onSwiper(swiper: SwiperType) {
  swiperRef.value = swiper

  nextTick(() => {
    const nextEl = swiper.el.querySelector('.swiper-button-next') as HTMLElement
    const prevEl = swiper.el.querySelector('.swiper-button-prev') as HTMLElement

    let wasAtEnd = false
    let wasAtBeginning = false

    nextEl?.addEventListener('mousedown', () => { wasAtEnd = swiper.isEnd })
    prevEl?.addEventListener('mousedown', () => { wasAtBeginning = swiper.isBeginning })

    nextEl?.addEventListener('click', () => { if (wasAtEnd) elasticBounce(swiper, 'next') })
    prevEl?.addEventListener('click', () => { if (wasAtBeginning) elasticBounce(swiper, 'prev') })
  })
}
</script>

<template>
  <Swiper :modules="modules" direction="horizontal" :slides-per-view="1" :speed="1000" :mousewheel="true" :keyboard="{ enabled: true }" :pagination="{ clickable: true }" :navigation="true" class="fullpage-swiper" @swiper="onSwiper">
    <SwiperSlide v-for="(slide, i) in slides" :key="i">
      <img :src="slide.image" :alt="slide.title" class="slide-bg" />
    </SwiperSlide>
  </Swiper>
</template>

<style scoped lang="scss" src="./background-slider.scss"></style>
