<script setup lang="ts">
import { PortableText } from '@portabletext/vue'

const { data: settings } = await useFetch('/api/settings')
</script>

<template>
  <div class="contact-page">
    <PortableText :value="settings.contactInfo" />

  </div>
</template>

<style scoped lang="scss" src="./contact.scss"></style>
