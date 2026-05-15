<script setup lang="ts">
const visible = ref(true)
</script>

<template>
  <Transition name="map-intro">
    <div v-if="visible" class="map-intro">
      <h1 class="map-intro-title">SIBIU:<br> arhitectura<br>la pas</h1>
      <!-- <p class="map-intro-subtitle">Descoperă clădirile istorice ale orașului</p> -->
      <button class="map-intro-start" @click="visible = false">Start</button>
    </div>
  </Transition>
</template>

<style scoped src="./map-intro.scss"></style>
