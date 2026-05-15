<script setup lang="ts">
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Protocol } from 'pmtiles'
import { baseLayers, overlayLayers } from '~/lib/map-layers'

definePageMeta({ layout: 'map' })

const route = useRoute()
const mapContainer = ref<HTMLElement>()
const selectedBuilding = ref<{ name: string; fillColor: string; mainImage: string; content: { description?: string; images?: string[] }[]; polygonJson?: string } | null>(null)
const zoomLevel = ref(16)

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

  map.addControl(new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }))
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
  <BuildingDetail :building="selectedBuilding" @close="selectedBuilding = null" />
  <MapIntro />
</template>

<style scoped>
.map-container {
  width: 100vw;
    height: 100vh;
}

.zoom-display {
  position: fixed;
  bottom: 12px;
  left: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 13px;
  font-family: monospace;
  z-index: 5;
  pointer-events: none;
}
</style>
