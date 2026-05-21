<script setup lang="ts">
import bk2 from '~/images/bk2.jpg'
import bk4 from '~/images/bk4.jpg'
import bk5 from '~/images/bk5.jpg'
import bk6 from '~/images/bk6.jpg'
import bk7 from '~/images/bk7.jpg'
import bk9 from '~/images/bk9.jpg'
import bk10 from '~/images/bk10.jpg'
import bk11 from '~/images/bk11.jpg'
import bk12 from '~/images/bk12.jpg'
import bk14 from '~/images/bk14.jpg'
import bk15 from '~/images/bk15.jpg'
import bk28 from '~/images/bk28.jpg'

definePageMeta({ layout: false })

useHead({
  script: [
    { src: 'https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js', defer: false },
    { src: 'https://cdn.jsdelivr.net/gh/jaukia/zoomooz@master/jquery.zoomooz.js', defer: false },
  ],
})

const projects = [
  { title: 'Monolith Residence', category: 'Residential', image: bk4 },
  { title: 'Glass Pavilion', category: 'Cultural', image: bk5 },
  { title: 'Terrace House', category: 'Residential', image: bk6 },
  { title: 'Urban Loft', category: 'Mixed Use', image: bk7 },
  { title: 'The Canopy', category: 'Public', image: bk9 },
  { title: 'Stone Chapel', category: 'Sacred', image: bk12 },
  { title: 'Interior Study', category: 'Detail', image: bk10 },
  { title: 'Facade Detail', category: 'Detail', image: bk11 },
  { title: 'Site Context', category: 'Landscape', image: bk2 },
  { title: 'Material Study', category: 'Detail', image: bk28 },
]

const zoomed = ref(false)
const activeProject = ref<typeof projects[0] | null>(null)




function waitForJQuery(): Promise<void> {
  return new Promise((resolve) => {
    const check = () => {
      if ((window as any).jQuery && (window as any).jQuery.fn.zoomTo) {
        resolve()
      } else {
        setTimeout(check, 100)
      }
    }
    check()
  })
}

function handleZoomOut() {
  ;(window as any).__zoomOut?.()
}

onMounted(async () => {
  await waitForJQuery()
  const $ = (window as any).jQuery

  // Create back button via DOM — appended to <html> to escape all Zoomooz transforms
  const btn = document.createElement('button')
  btn.className = 'zoom-back-btn'
  btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> return'
  btn.style.display = 'none'
  document.documentElement.appendChild(btn)

  function showBtn() { btn.style.display = 'flex' }
  function hideBtn() { btn.style.display = 'none' }

  function sendIframeEvent(data: string) {
    window.parent.postMessage({ type: 'IFRAME_EVENT', data }, '*')
  }

  function zoomOut() {
    if (!zoomed.value) return
    zoomed.value = false
    activeProject.value = null
    hideBtn()
    $('.zoom-target').removeClass('is-zoomed')
    $('.zoom-container').zoomTo({ targetsize: 1.0, duration: 500, easing: 'ease' })
    sendIframeEvent('')
  }

  btn.addEventListener('click', (e) => { e.stopPropagation(); zoomOut() })

  let currentIdx = -1
  const cards = $('.zoom-target').toArray() as HTMLElement[]

  function zoomToIdx(idx: number) {
    const project = projects[idx]
    if (!project || !cards[idx]) return

    currentIdx = idx
    zoomed.value = true
    activeProject.value = project
    $('.zoom-target').removeClass('is-zoomed')
    $(cards[idx]).addClass('is-zoomed')
    showBtn()
    $(cards[idx]).zoomTo({ targetsize: 0.85, duration: 600, easing: 'ease' })
    sendIframeEvent(cards[idx].dataset.srcKey || '')
  }

  // Click a card to zoom in (or switch to another card if already zoomed)
  $('.zoom-target').on('click', function (this: HTMLElement, evt: Event) {
    evt.stopPropagation()
    const idx = parseInt(this.dataset.idx || '0', 10)
    zoomToIdx(idx)
  })

  // Scroll wheel navigates to next/prev element (looping)
  const randomOrder = [4, 8, 1, 6, 3, 9, 0, 7, 5, 2]
  let randomPos = 0
  let scrollCooldown = false
  window.addEventListener('wheel', (e: WheelEvent) => {
    if (scrollCooldown) return
    e.preventDefault()
    scrollCooldown = true
    setTimeout(() => { scrollCooldown = false }, 700)

    if (e.shiftKey) {
      // Shift+scroll: iterate through random order
      if (e.deltaY > 0) {
        randomPos = (randomPos + 1) % randomOrder.length
      } else {
        randomPos = (randomPos - 1 + randomOrder.length) % randomOrder.length
      }
      const randomIdx = randomOrder[randomPos]
      if (randomIdx !== undefined) zoomToIdx(randomIdx)
    } else if (!zoomed.value) {
      // First scroll zooms into the first element
      zoomToIdx(0)
    } else if (e.deltaY > 0) {
      zoomToIdx((currentIdx + 1) % cards.length)
    } else {
      zoomToIdx((currentIdx - 1 + cards.length) % cards.length)
    }
  }, { passive: false })

  // Click the container (background) to zoom back out
  $('.zoom-container').on('click', function (evt: Event) {
    zoomOut()
  })

  // Esc key to zoom out
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') zoomOut()
  })

  onUnmounted(() => {
    btn.remove()
  })
})
</script>

<template>
  <div class="zoom-page">
    <div class="zoomViewport">
      <div class="zoomContainer zoom-container">
        <div class="zoom-grid">
          <div class="zoom-card zoom-target" data-idx="0" data-src-key="bk4"><span class="zoom-card-num">7</span><img :src="bk4" alt="Monolith Residence" class="zoom-card-img" /><span class="zoom-card-caption"><em>01</em> Monolith Residence</span></div>
          <div class="zoom-card zoom-target" data-idx="1" data-src-key="bk5"><span class="zoom-card-num">3</span><img :src="bk5" alt="Glass Pavilion" class="zoom-card-img" /><span class="zoom-card-caption"><em>02</em> Glass Pavilion</span></div>
          <div class="zoom-card zoom-target" data-idx="2" data-src-key="bk6"><span class="zoom-card-num">10</span><img :src="bk6" alt="Terrace House" class="zoom-card-img" /><span class="zoom-card-caption"><em>03</em> Terrace House</span></div>
          
          <div class="zoom-card zoom-target" data-idx="3" data-src-key="bk14"><span class="zoom-card-num">5</span><img :src="bk14" alt="Urban Loft" class="zoom-card-img" /><span class="zoom-card-caption"><em>04</em> Urban Loft</span></div>
          <div class="zoom-card zoom-target" data-idx="4" data-src-key="bk9"><span class="zoom-card-num">1</span><img :src="bk9" alt="The Canopy" class="zoom-card-img" /><span class="zoom-card-caption"><em>05</em> The Canopy</span></div>
          <div class="zoom-card zoom-target flip" data-idx="5" data-src-key="bk12"><span class="zoom-card-num">9</span><img :src="bk12" alt="Stone Chapel" class="zoom-card-img" /><span class="flip-text">UPSIDE DOWN</span><span class="zoom-card-caption hidden"><em>06</em> Stone Chapel</span></div>
          
          <div class="zoom-card zoom-card-pair">
            <div class="zoom-target" data-idx="6" data-src-key="bk10"><span class="zoom-card-num">4</span><img :src="bk10" alt="Interior Study" class="zoom-card-img" /><span class="zoom-card-caption"><em>07</em> Interior Study</span></div>
            <div class="zoom-target" data-idx="7" data-src-key="bk7"><span class="zoom-card-num">6</span><img :src="bk7" alt="Material Study" class="zoom-card-img" /><span class="zoom-card-caption"><em>08</em> Material Study</span></div>
          </div>

          <div class="zoom-card zoom-target" data-idx="8" data-src-key="bk11"><span class="zoom-card-num">8</span><img :src="bk11" alt="Facade Detail" class="zoom-card-img" /><span class="zoom-card-caption"><em>09</em> Facade Detail</span></div>
          <div class="zoom-card zoom-target" data-idx="9" data-src-key="bk2"><span class="zoom-card-num">2</span><img :src="bk2" alt="Site Context" class="zoom-card-img" /><span class="zoom-card-caption"><em>10</em> Site Context</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./zoom.scss"></style>
