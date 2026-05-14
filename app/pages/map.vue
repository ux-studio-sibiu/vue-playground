<script setup lang="ts">
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Protocol } from 'pmtiles'

definePageMeta({ layout: 'map' })

const mapContainer = ref<HTMLElement>()

onMounted(() => {
  if (!mapContainer.value) return

  const protocol = new Protocol()
  maplibregl.addProtocol('pmtiles', protocol.tile)

  const map = new maplibregl.Map({
    container: mapContainer.value,
    style: {
      version: 8,
      sources: {
        sibiu: {
          type: 'vector',
          url: 'pmtiles:///maps/sibiu.pmtiles',
        },
      },
      layers: [
        {
          id: 'background',
          type: 'background',
          paint: { 'background-color': '#f8f4f0' },
        },
        {
          id: 'landcover',
          type: 'fill',
          source: 'sibiu',
          'source-layer': 'landcover',
          paint: { 'fill-color': '#d5e8d4', 'fill-opacity': 0.6 },
        },
        {
          id: 'landuse',
          type: 'fill',
          source: 'sibiu',
          'source-layer': 'landuse',
          paint: { 'fill-color': '#e8e4c9', 'fill-opacity': 0.5 },
        },
        {
          id: 'park',
          type: 'fill',
          source: 'sibiu',
          'source-layer': 'park',
          paint: { 'fill-color': '#b8db9a', 'fill-opacity': 0.6 },
        },
        {
          id: 'water',
          type: 'fill',
          source: 'sibiu',
          'source-layer': 'water',
          paint: { 'fill-color': '#a0cfdf' },
        },
        {
          id: 'waterway',
          type: 'line',
          source: 'sibiu',
          'source-layer': 'waterway',
          paint: { 'line-color': '#a0cfdf', 'line-width': 1.5 },
        },
        {
          id: 'transportation',
          type: 'line',
          source: 'sibiu',
          'source-layer': 'transportation',
          paint: { 'line-color': '#ffffff', 'line-width': 1.5 },
        },
        {
          id: 'boundary',
          type: 'line',
          source: 'sibiu',
          'source-layer': 'boundary',
          paint: { 'line-color': '#9e9cab', 'line-width': 1, 'line-dasharray': [3, 2] },
        },
        {
          id: 'building',
          type: 'fill',
          source: 'sibiu',
          'source-layer': 'building',
          paint: { 'fill-color': '#ffffff', 'fill-opacity': 0.9 },
        },
        {
          id: 'building-outline',
          type: 'line',
          source: 'sibiu',
          'source-layer': 'building',
          paint: { 'line-color': '#000000', 'line-width': 3 },
        },
      ],
    },
    center: [24.1500, 45.7983],
    zoom: 15,
  })

//   new maplibregl.Marker({ color: '#e74c3c' })
//     .setLngLat([24.1255, 45.7925])
//     .setPopup(new maplibregl.Popup().setText('Catedrala Ortodoxă'))
//     .addTo(map)

  map.addControl(new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }))

  map.on('load', async () => {
    const res = await fetch('/maps/buildings.json')
    const buildings = await res.json()

    map.addSource('buildings-overlay', {
      type: 'geojson',
      data: buildings,
    })
    map.addLayer({
      id: 'buildings-overlay-fill',
      type: 'fill',
      source: 'buildings-overlay',
      paint: { 'fill-color': '#e74c3c', 'fill-opacity': 0.6 },
    })
    map.addLayer({
      id: 'buildings-overlay-outline',
      type: 'line',
      source: 'buildings-overlay',
      paint: { 'line-color': '#c0392b', 'line-width': 2 },
    })

    map.on('click', 'buildings-overlay-fill', (e) => {
      if (!e.features?.length) return
      const props = e.features[0].properties
      new maplibregl.Popup().setLngLat(e.lngLat).setHTML(`<strong>${props.name}</strong>`).addTo(map)
    })
    map.on('mouseenter', 'buildings-overlay-fill', () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'buildings-overlay-fill', () => { map.getCanvas().style.cursor = '' })
  })
})
</script>

<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<style scoped>
.map-container {
  width: 100vw;
    height: 100vh;
}
</style>
