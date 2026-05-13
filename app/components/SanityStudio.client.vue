<script setup lang="ts">
const root = ref<HTMLDivElement | null>(null)
let dispose: (() => void) | undefined

onMounted(async () => {
  if (root.value) {
    const { renderStudio } = await import('sanity')
    const { default: config } = await import('~~/sanity.config')
    dispose = renderStudio(root.value, config)
  }
})

onBeforeUnmount(() => {
  dispose?.()
})
</script>

<template>
  <div ref="root" id="sanity" style="position: fixed; inset: 0; height: 100vh; width: 100vw; z-index: 9999; background: #fff;" />
</template>
