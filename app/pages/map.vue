<script setup lang="ts">
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Protocol } from 'pmtiles'
import { baseLayers, overlayLayers } from '~/lib/map-layers'

definePageMeta({ layout: 'map' })

const route = useRoute()
const isDev = import.meta.dev
const mapContainer = ref<HTMLElement>()
const selectedBuilding = ref<{ name: string; fillColor: string; mainImage: string; content: { description?: string; images?: string[] }[]; polygonJson?: string } | null>(null)
const zoomLevel = ref(16)
const geoWarning = ref(false)

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
      layers: baseLayers,
    },
    center: [24.1500, 45.7983],
    zoom: 16,
    minZoom: 15,
    maxBounds: [[24.135, 45.79], [24.17, 45.806]],
  })

  const geolocate = new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true })
  map.addControl(geolocate)
  geolocate.on('geolocate', (e: GeolocationPosition) => {
    const { longitude, latitude } = e.coords
    geoWarning.value = longitude < 24.135 || longitude > 24.17 || latitude < 45.79 || latitude > 45.806
  })
  map.on('zoom', () => { zoomLevel.value = Math.round(map.getZoom() * 10) / 10 })

  map.on('load', async () => {
    const res = await fetch('/api/map-buildings')
    const buildings = await res.json()

    map.addSource('buildings-overlay', {
      type: 'geojson',
      data: buildings,
    })
    overlayLayers.forEach((layer) => map.addLayer(layer))

    map.on('click', 'buildings-overlay-fill', (e) => {
      if (!e.features?.length) return
      const props = e.features[0].properties
      selectedBuilding.value = { name: props.name, fillColor: props.fillColor || '#e74c3c', mainImage: props.mainImage || '', content: JSON.parse(props.content || '[]') }
    })
    map.on('mouseenter', 'buildings-overlay-fill', () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'buildings-overlay-fill', () => { map.getCanvas().style.cursor = '' })

    if ('copy' in route.query) {
      map.on('click', 'building', (e) => {
        if (!e.features?.length) return
        const feature = e.features[0]
        if (feature.geometry.type === 'Polygon') {
          const coords = (feature.geometry as GeoJSON.Polygon).coordinates[0]
          selectedBuilding.value = { name: 'Building coordinates', description: '', fillColor: '', mainImage: '', images: [], polygonJson: JSON.stringify(coords) }
        }
      })
      map.on('mouseenter', 'building', () => { map.getCanvas().style.cursor = 'crosshair' })
      map.on('mouseleave', 'building', () => { map.getCanvas().style.cursor = '' })
    }
  })
})
</script>

<template>
  <div ref="mapContainer" class="map-container"></div>
  <div class="zoom-display">{{ zoomLevel }}</div>
  <div v-if="geoWarning" class="geo-warning">Nu ești în zona centrului Sibiului</div>
  <BuildingDetail :building="selectedBuilding" @close="selectedBuilding = null" />
  <MapIntro v-if="!isDev" />
</template>

<style scoped src="./map.scss"></style>
