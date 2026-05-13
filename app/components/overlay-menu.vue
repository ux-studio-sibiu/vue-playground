<script setup lang="ts">
const isOpen = ref(false)

provide('overlayOpen', isOpen)

const links = [
  { label: 'Projects', to: '/projects' },
  { label: 'Contact', to: '/contact' },
]

const route = useRoute()

if (['/contact', '/projects'].includes(route.path)) {isOpen.value = true}
</script>

<template>
  <div class="overlay-menu">
    <button class="menu-trigger" :class="{ active: isOpen }" @click="isOpen = !isOpen">John Slick</button>

    <Transition name="overlay">
      <div v-if="isOpen" class="menu-overlay">
        <nav class="menu-nav">
          <NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="menu-link">{{ link.label }}</NuxtLink>
        </nav>
        <div class="menu-page-content">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss" src="./overlay-menu.scss"></style>
