<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import bk2 from '~/images/bk2.jpg'
import bk4 from '~/images/bk4.jpg'
import bk5 from '~/images/bk5.jpg'
import bk6 from '~/images/bk6.jpg'
import bk7 from '~/images/bk7.jpg'
import bk9 from '~/images/bk9.jpg'
import bk10 from '~/images/bk10.jpg'
import bk11 from '~/images/bk11.jpg'
import bk12 from '~/images/bk12.jpg'
import bk15 from '~/images/bk15.jpg'
import bk28 from '~/images/bk28.jpg'

gsap.registerPlugin(ScrollTrigger)

definePageMeta({ layout: false })

const pageRef = ref<HTMLElement>()

const portfolio = [
  { title: 'Monolith Residence', category: 'Residential', year: '2025', image: bk4 },
  { title: 'Glass Pavilion', category: 'Cultural', year: '2024', image: bk5 },
  { title: 'Terrace House', category: 'Residential', year: '2024', image: bk6 },
  { title: 'Urban Loft', category: 'Mixed Use', year: '2023', image: bk7 },
  { title: 'The Canopy', category: 'Public', year: '2023', image: bk9 },
  { title: 'Stone Chapel', category: 'Sacred', year: '2022', image: bk12 },
]

const gallery = [
  { image: bk10, caption: 'Interior detail — Monolith Residence' },
  { image: bk11, caption: 'Facade study — Glass Pavilion' },
  { image: bk2, caption: 'Site context — Terrace House' },
  { image: bk15, caption: 'Material exploration — Stone Chapel' },
]

onMounted(() => {
  if (!pageRef.value) return
  const ctx = gsap.context(() => {

    // 1. Hero — image scale-down reveal + text clip
    gsap.from('.arh-hero-img', { scale: 1.3, duration: 2, ease: 'power2.out' })
    gsap.from('.arh-hero-overlay', { opacity: 0, duration: 1.5, delay: 0.3, ease: 'power2.out' })
    gsap.from('.arh-hero-line', { yPercent: 100, duration: 1.2, ease: 'power4.out', stagger: 0.12, delay: 0.5 })
    gsap.from('.arh-hero-tag', { y: 20, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 1.2 })

    // 2. Philosophy — horizontal line draws in, text fades
    gsap.from('.arh-philosophy-rule', { scaleX: 0, transformOrigin: 'left center', duration: 1.2, ease: 'power3.inOut', scrollTrigger: { trigger: '.arh-philosophy', start: 'top 75%' } })
    gsap.from('.arh-philosophy-text', { y: 40, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.15, scrollTrigger: { trigger: '.arh-philosophy', start: 'top 70%' } })

    // 3. Portfolio grid — clip-path reveal + parallax
    gsap.utils.toArray<HTMLElement>('.arh-port-card').forEach((card, i) => {
      const img = card.querySelector('.arh-port-img') as HTMLElement
      // Parallax
      gsap.to(img, { yPercent: -10, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } })
      // Clip-path wipe reveal
      gsap.from(card, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'power3.inOut', scrollTrigger: { trigger: card, start: 'top 85%' } })
      // Info slide up
      const info = card.querySelector('.arh-port-info') as HTMLElement
      gsap.from(info, { y: 30, opacity: 0, duration: 0.8, delay: 0.3, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 80%' } })
    })

    // 4. Featured section — pinned image zoom on scroll
    const featuredImg = document.querySelector('.arh-featured-img') as HTMLElement
    if (featuredImg) {
      gsap.to(featuredImg, { scale: 1.15, ease: 'none', scrollTrigger: { trigger: '.arh-featured', start: 'top top', end: 'bottom top', scrub: true, pin: true } })
    }
    gsap.from('.arh-featured-caption span', { yPercent: 100, duration: 1, ease: 'power4.out', stagger: 0.1, scrollTrigger: { trigger: '.arh-featured', start: 'top 40%' } })

    // 5. Horizontal gallery — pinned horizontal scroll
    const galleryTrack = document.querySelector('.arh-gallery-track') as HTMLElement
    if (galleryTrack) {
      const totalScroll = galleryTrack.scrollWidth - window.innerWidth
      gsap.to(galleryTrack, { x: -totalScroll, ease: 'none', scrollTrigger: { trigger: '.arh-gallery', start: 'top top', end: () => `+=${totalScroll}`, pin: true, scrub: 1, invalidateOnRefresh: true } })
    }
    // Gallery items stagger in
    gsap.utils.toArray<HTMLElement>('.arh-gallery-item').forEach((item) => {
      gsap.from(item, { opacity: 0, y: 40, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'left 80%', containerAnimation: gsap.getById?.('galleryScroll') || undefined, scrub: false } })
    })

    // 6. Approach steps — staggered line + number reveal
    gsap.utils.toArray<HTMLElement>('.arh-step').forEach((step) => {
      gsap.from(step.querySelector('.arh-step-line'), { scaleX: 0, transformOrigin: 'left center', duration: 0.8, ease: 'power3.inOut', scrollTrigger: { trigger: step, start: 'top 85%' } })
      gsap.from(step.querySelector('.arh-step-num'), { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: step, start: 'top 85%' } })
      gsap.from(step.querySelector('.arh-step-content'), { y: 30, opacity: 0, duration: 0.8, delay: 0.15, ease: 'power3.out', scrollTrigger: { trigger: step, start: 'top 85%' } })
    })

    // 7. Contact — split reveal
    gsap.from('.arh-contact-title span', { yPercent: 100, duration: 1.2, ease: 'power4.out', stagger: 0.1, scrollTrigger: { trigger: '.arh-contact', start: 'top 75%' } })
    gsap.from('.arh-contact-link', { y: 20, opacity: 0, duration: 0.8, delay: 0.4, ease: 'power3.out', scrollTrigger: { trigger: '.arh-contact', start: 'top 70%' } })

  }, pageRef.value)

  onUnmounted(() => ctx.revert())
})
</script>

<template>
  <div ref="pageRef" class="arh-page">

    <!-- HERO: full-bleed image with scale reveal -->
    <section class="arh-hero">
      <div class="arh-hero-img-wrapper">
        <img :src="bk28" alt="Architecture hero" class="arh-hero-img" />
      </div>
      <div class="arh-hero-overlay">
        <h1 class="arh-hero-title">
          <span class="arh-hero-line-wrap"><span class="arh-hero-line">Form follows</span></span>
          <span class="arh-hero-line-wrap"><span class="arh-hero-line">intention.</span></span>
        </h1>
        <p class="arh-hero-tag">Architecture &mdash; Interior &mdash; Landscape</p>
      </div>
    </section>

    <!-- PHILOSOPHY: rule + text reveal -->
    <section class="arh-philosophy">
      <div class="arh-philosophy-rule"></div>
      <p class="arh-philosophy-text">We design with restraint, allowing material honesty and spatial clarity to define every project. Our work is rooted in context — the land, the light, the way people inhabit a space.</p>
      <p class="arh-philosophy-text">Each line drawn is purposeful. Nothing is ornamental unless it serves the whole.</p>
    </section>

    <!-- PORTFOLIO: asymmetric grid with clip reveals -->
    <section class="arh-portfolio">
      <div class="arh-portfolio-header">
        <span class="arh-portfolio-label">Selected Work</span>
        <span class="arh-portfolio-count">{{ portfolio.length }} Projects</span>
      </div>
      <div class="arh-portfolio-grid">
        <div v-for="(project, i) in portfolio" :key="i" class="arh-port-card" :class="`arh-port-card--${i + 1}`">
          <div class="arh-port-img-wrapper">
            <img :src="project.image" :alt="project.title" class="arh-port-img" />
          </div>
          <div class="arh-port-info">
            <span class="arh-port-category">{{ project.category }}</span>
            <h3 class="arh-port-title">{{ project.title }}</h3>
            <span class="arh-port-year">{{ project.year }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURED: pinned zoom image -->
    <section class="arh-featured">
      <div class="arh-featured-img-wrapper">
        <img :src="bk2" alt="Featured project" class="arh-featured-img" />
      </div>
      <div class="arh-featured-caption">
        <span><span>Courtyard House</span></span>
        <span><span>Sibiu, 2025</span></span>
      </div>
    </section>

    <!-- HORIZONTAL GALLERY: pinned horizontal scroll -->
    <section class="arh-gallery">
      <div class="arh-gallery-track">
        <div class="arh-gallery-intro">
          <h2 class="arh-gallery-title">Process &amp; Detail</h2>
        </div>
        <div v-for="(item, i) in gallery" :key="i" class="arh-gallery-item">
          <img :src="item.image" :alt="item.caption" class="arh-gallery-img" />
          <span class="arh-gallery-caption">{{ item.caption }}</span>
        </div>
      </div>
    </section>

    <!-- APPROACH: numbered steps -->
    <section class="arh-approach">
      <div class="arh-step" v-for="(step, i) in [{ title: 'Listen', desc: 'We begin every project with deep listening — understanding the site, the brief, and the unspoken desires.' }, { title: 'Sketch', desc: 'Ideas take form through hand drawing. Volumes, light, movement — explored before a single line is digitised.' }, { title: 'Refine', desc: 'Iterative detailing. Every joint, every threshold, every sightline is considered and reconsidered.' }, { title: 'Realise', desc: 'Construction is craft. We stay close to the build, ensuring the built work matches the vision.' }]" :key="i">
        <div class="arh-step-line"></div>
        <span class="arh-step-num">0{{ i + 1 }}</span>
        <div class="arh-step-content">
          <h3 class="arh-step-title">{{ step.title }}</h3>
          <p class="arh-step-desc">{{ step.desc }}</p>
        </div>
      </div>
    </section>

    <!-- CONTACT: split text reveal -->
    <section class="arh-contact">
      <h2 class="arh-contact-title">
        <span><span>Let's create</span></span>
        <span><span>something lasting.</span></span>
      </h2>
      <a href="/contact" class="arh-contact-link">studio@atelier.ro</a>
    </section>

  </div>
</template>

<style scoped lang="scss" src="./gsap-arh.scss"></style>
