<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Sanity Studio' })
</script>

<template>
  <ClientOnly>
    <SanityStudio />
  </ClientOnly>
</template>
