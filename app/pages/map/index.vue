<script setup lang="ts">
import 'maplibre-gl/dist/maplibre-gl.css'
import { useMapPage } from './use-map-page'

definePageMeta({ layout: 'map' })

const route = useRoute()
const isDev = import.meta.dev

const { mapContainer, zoomLevel, geoWarning, yearLegendItems, isYearSort, selectedBuilding, closeBuilding } = useMapPage()
</script>

<template>
  <div ref="mapContainer" class="map-container"></div>
  <div v-if="isYearSort && yearLegendItems.length" class="map-year-legend">
    <div v-for="(item, i) in yearLegendItems" :key="i" class="map-year-legend-row">
      <span class="map-year-legend-swatch" :style="{ backgroundColor: item.color }"></span>
      <span class="map-year-legend-label">{{ item.label }}</span>
    </div>
  </div>
  <div class="zoom-display">{{ zoomLevel }}</div>
  <div v-if="geoWarning" class="geo-warning">Nu ești în zona centrului Sibiului</div>
  <BuildingDetail :building="selectedBuilding" @close="closeBuilding" />
  <MapIntro v-if="!isDev && !('curated' in route.query)" />
</template>

<style scoped src="~/pages/map/map.scss"></style>