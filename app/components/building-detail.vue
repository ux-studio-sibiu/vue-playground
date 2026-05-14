<script setup lang="ts">
const props = defineProps<{
  building: { name: string; description: string; fillColor: string; mainImage: string; images: string[] } | null
}>()

const emit = defineEmits<{ close: [] }>()
const collapsed = ref(false)

watch(() => props.building, () => { collapsed.value = false })
</script>

<template>
  <Transition name="slide">
    <div v-if="building" class="building-detail" :class="{ 'building-detail--collapsed': collapsed }">
      <button class="building-detail__toggle" @click="collapsed = !collapsed">{{ collapsed ? '◀' : '▶' }}</button>
      <div class="building-detail__panel">
        <button class="building-detail__close" @click="emit('close')">&times;</button>
        <img v-if="building.mainImage" :src="building.mainImage" :alt="building.name" class="building-detail__main-image" />
        <div class="building-detail__color" :style="{ backgroundColor: building.fillColor }"></div>
        <h2 class="building-detail__title">{{ building.name }}</h2>
        <p v-if="building.description" class="building-detail__description">{{ building.description }}</p>
        <div v-if="building.images.length" class="building-detail__gallery">
          <img v-for="(img, i) in building.images" :key="i" :src="img" :alt="`${building.name} ${i + 1}`" class="building-detail__gallery-image" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped src="./building-detail.scss"></style>
