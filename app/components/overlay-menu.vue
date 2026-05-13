<script setup lang="ts">
const isOpen = ref(false)

const links = [
  { label: 'Home', to: '/' },
  { label: 'Projects', to: '/projects' },
  { label: 'Contact', to: '/contact' },
  { label: 'Studio', to: '/studio' },
]

const route = useRoute()
watch(() => route.path, () => { isOpen.value = false })
</script>

<template>
  <div class="overlay-menu">
    <button class="menu-trigger" :class="{ active: isOpen }" @click="isOpen = !isOpen">John SLick</button>

    <Transition name="overlay">
      <div v-if="isOpen" class="menu-overlay">
        <nav class="menu-nav">
          <NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="menu-link">{{ link.label }}</NuxtLink>
        </nav>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss" src="./overlay-menu.scss"></style>
