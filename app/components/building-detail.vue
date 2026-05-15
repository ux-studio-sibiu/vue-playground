<script setup lang="ts">
const props = defineProps<{
  building: { name: string; fillColor: string; mainImage: string; content: { description?: string; images?: string[] }[]; polygonJson?: string } | null
}>()

const emit = defineEmits<{ close: [] }>()
const collapsed = ref(false)
const copied = ref(false)

function copyPolygonJson() {
  if (!props.building?.polygonJson) return
  navigator.clipboard.writeText(props.building.polygonJson)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

watch(() => props.building, () => { collapsed.value = false; copied.value = false })
</script>

<template>
  <Transition name="slide">
    <div v-if="building" class="building-detail" :class="{ 'building-detail--collapsed': collapsed }">
      <button class="building-detail-toggle" @click="collapsed = !collapsed">{{ collapsed ? '◀' : '▶' }}</button>
      <div class="building-detail-panel">
        <button class="building-detail-close" @click="emit('close')">&times;</button>
        <img v-if="building.mainImage" :src="building.mainImage" :alt="building.name" class="building-detail-main-image" />
        
        <div class="building-detail-info">
            <h2 class="building-detail-title">{{ building.name }}</h2>
            
            <div v-for="(block, i) in building.content" :key="i" class="building-detail-block">
              <div v-if="block.images?.length" class="building-detail-gallery">
                <img v-for="(img, j) in block.images" :key="j" :src="img" :alt="`${building.name} ${i + 1}-${j + 1}`" class="building-detail-gallery-image" />
              </div>
              <p v-if="block.description" class="building-detail-description">{{ block.description }}</p>
            </div>

            <div v-if="building.polygonJson" class="building-detail-coords">
              <h3 class="building-detail-coords-title">polygonJson</h3>
              <pre class="building-detail-coords-pre">{{ building.polygonJson }}</pre>
              <button class="building-detail-coords-copy" @click="copyPolygonJson">{{ copied ? 'Copied!' : 'Copy' }}</button>
            </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped src="./building-detail.scss"></style>
