<script setup lang="ts">
definePageMeta({ layout: 'studio' })
useHead({ title: 'Sanity Studio' })
</script>

<template>
  <ClientOnly>
    <SanityStudio />
  </ClientOnly>
</template>
