<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import img1 from '~/images/1.png'
import img2 from '~/images/2.png'
import img3 from '~/images/3.png'

gsap.registerPlugin(ScrollTrigger)

definePageMeta({ layout: false })

const pageRef = ref<HTMLElement>()

const projects = [
  { title: 'Prairie House', location: 'Sibiu, Romania', year: '2024', image: img1 },
  { title: 'Lakeside Pavilion', location: 'Cluj-Napoca, Romania', year: '2023', image: img2 },
  { title: 'Courtyard Residence', location: 'Brașov, Romania', year: '2025', image: img3 },
]

onMounted(() => { 
  if (!pageRef.value) return
  const ctx = gsap.context(() => {

    // 1. Hero title — staggered letter reveal
    gsap.from('.hero-line', { y: 120, opacity: 0, duration: 1.2, ease: 'power4.out', stagger: 0.15 })
    gsap.from('.hero-subtitle', { y: 30, opacity: 0, duration: 1, delay: 0.6, ease: 'power3.out' })

    // 2. Manifesto section — fade + slide on scroll
    gsap.from('.manifesto-text', { scrollTrigger: { trigger: '.manifesto', start: 'top 80%' }, y: 60, opacity: 0, duration: 1, ease: 'power3.out' })

    // 3. Project cards — parallax image + staggered entry
    gsap.utils.toArray<HTMLElement>('.project-card').forEach((card) => {
      const img = card.querySelector('.project-card-img') as HTMLElement
      // Parallax: image moves slower than scroll
      gsap.to(img, { yPercent: -15, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } })
      // Card entrance
      gsap.from(card, { scrollTrigger: { trigger: card, start: 'top 85%' }, y: 80, opacity: 0, duration: 0.8, ease: 'power3.out' })
    })

    // 4. Horizontal text scroll — pinned section
    const ticker = document.querySelector('.ticker-track') as HTMLElement
    if (ticker) {
      gsap.to(ticker, { xPercent: -50, ease: 'none', scrollTrigger: { trigger: '.ticker', start: 'top top', end: '+=1500', pin: true, scrub: 1 } })
    }

    // 5. Stats — counter animation
    gsap.utils.toArray<HTMLElement>('.stat-number').forEach((el) => {
      const target = parseInt(el.dataset.value || '0', 10)
      gsap.from(el, { textContent: 0, duration: 2, ease: 'power1.out', snap: { textContent: 1 }, scrollTrigger: { trigger: el, start: 'top 85%' } })
    })

    // 6. Footer reveal — scale up from small
    gsap.from('.footer-cta', { scrollTrigger: { trigger: '.footer-cta', start: 'top 90%' }, scale: 0.8, opacity: 0, duration: 1, ease: 'power3.out' })

  }, pageRef.value)

  onUnmounted(() => ctx.revert())
})
</script>

<template>
  <div ref="pageRef" class="gsap-page">

    <!-- HERO: staggered line reveal -->
    <section class="hero">
      <h1 class="hero-title">
        <span class="hero-line">We shape</span>
        <span class="hero-line">spaces that</span>
        <span class="hero-line">inspire life.</span>
      </h1>
      <p class="hero-subtitle">Architecture studio — Sibiu, Romania</p>
    </section>

    <!-- MANIFESTO: fade in on scroll -->
    <section class="manifesto">
      <p class="manifesto-text">Every structure tells a story. We believe architecture should dissolve the boundary between shelter and landscape, creating spaces where concrete breathes and light becomes material.</p>
    </section>

    <!-- PROJECTS: parallax images + scroll entry -->
    <section class="projects">
      <div v-for="(project, i) in projects" :key="i" class="project-card">
        <div class="project-card-img-wrapper">
          <img :src="project.image" :alt="project.title" class="project-card-img" />
        </div>
        <div class="project-card-info">
          <span class="project-card-year">{{ project.year }}</span>
          <h2 class="project-card-title">{{ project.title }}</h2>
          <p class="project-card-location">{{ project.location }}</p>
        </div>
      </div>
    </section>

    <!-- TICKER: pinned horizontal scroll -->
    <section class="ticker">
      <div class="ticker-track">
        <span v-for="n in 6" :key="n" class="ticker-word">Concrete &bull; Light &bull; Form &bull; Space &bull;&nbsp;</span>
      </div>
    </section>

    <!-- STATS: number counter -->
    <section class="stats">
      <div class="stat">
        <span class="stat-number" data-value="47">47</span>
        <span class="stat-label">Projects completed</span>
      </div>
      <div class="stat">
        <span class="stat-number" data-value="12">12</span>
        <span class="stat-label">Years of practice</span>
      </div>
      <div class="stat">
        <span class="stat-number" data-value="8">8</span>
        <span class="stat-label">Design awards</span>
      </div>
    </section>

    <!-- FOOTER CTA: scale reveal -->
    <section class="footer-cta">
      <h2 class="footer-cta-title">Let's build something together.</h2>
      <a href="/contact" class="footer-cta-button">Get in touch</a>
    </section>

  </div>
</template>

<style scoped lang="scss" src="./gsap.scss"></style>
