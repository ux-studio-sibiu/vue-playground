<script setup lang="ts">
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Protocol } from 'pmtiles'
import { baseLayers, overlayLayers } from '~/lib/map-layers'

definePageMeta({ layout: 'map' })

const route = useRoute()
const isDev = import.meta.dev
const mapContainer = ref<HTMLElement>()
const zoomLevel = ref(16)
const geoWarning = ref(false)
let mapInstance: maplibregl.Map | null = null

type Building = {
  name: string
  fillColor: string
  mainImage: string
  content: { description?: string; images?: string[] }[]
  polygonJson?: string
}
const selectedBuilding = ref<Building | null>(null)

// Extract outer ring coordinates from any polygon geometry
function extractCoords(geometry: GeoJSON.Geometry): GeoJSON.Position[] | null {
  if (geometry.type === 'Polygon') return (geometry as GeoJSON.Polygon).coordinates[0]
  if (geometry.type === 'MultiPolygon') return (geometry as GeoJSON.MultiPolygon).coordinates[0][0]
  return null
}

// Set red highlight on the copy-mode GeoJSON layer
function setCopyHighlight(map: maplibregl.Map, coords: GeoJSON.Position[]) {
  const feature: GeoJSON.Feature<GeoJSON.Polygon> = { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [coords] } }
  ;(map.getSource('copy-highlight') as maplibregl.GeoJSONSource).setData({ type: 'FeatureCollection', features: [feature] })
}

function clearCopyHighlight() {
  if (!mapInstance?.getSource('copy-highlight')) return
  ;(mapInstance.getSource('copy-highlight') as maplibregl.GeoJSONSource).setData({ type: 'FeatureCollection', features: [] })
}

function closeBuilding() {
  selectedBuilding.value = null
  if (mapInstance?.getLayer('buildings-overlay-fill')) {
    mapInstance.setPaintProperty('buildings-overlay-fill', 'fill-color', ['get', 'fillColor'])
  }
  clearCopyHighlight()
}

onMounted(() => {
  if (!mapContainer.value) return

  const protocol = new Protocol()
  maplibregl.addProtocol('pmtiles', protocol.tile)

  const map = new maplibregl.Map({
    container: mapContainer.value,
    style: {
      version: 8,
      sources: { sibiu: { type: 'vector', url: 'pmtiles:///maps/sibiu.pmtiles' } },
      layers: baseLayers,
    },
    center: [24.1500, 45.7983],
    zoom: 16,
    minZoom: 15,
    maxBounds: [[24.135, 45.79], [24.17, 45.806]],
  })
  mapInstance = map

  // Geolocation
  const geolocate = new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true })
  map.addControl(geolocate)
  geolocate.on('geolocate', (e: GeolocationPosition) => {
    const { longitude, latitude } = e.coords
    geoWarning.value = longitude < 24.135 || longitude > 24.17 || latitude < 45.79 || latitude > 45.806
  })

  // Zoom tracking
  map.on('zoom', () => { zoomLevel.value = Math.round(map.getZoom() * 10) / 10 })

  map.on('load', async () => {
    // Load Sanity building overlays
    const res = await fetch('/api/map-buildings')
    const buildings = await res.json()
    map.addSource('buildings-overlay', { type: 'geojson', data: buildings })
    overlayLayers.forEach((layer) => map.addLayer(layer))

    // Click overlay building → show detail + highlight red
    map.on('click', 'buildings-overlay-fill', (e) => {
      if (!e.features?.length) return
      const props = e.features[0].properties
      selectedBuilding.value = { name: props.name, fillColor: props.fillColor || '#e74c3c', mainImage: props.mainImage || '', content: JSON.parse(props.content || '[]') }
      map.setPaintProperty('buildings-overlay-fill', 'fill-color', ['case', ['==', ['get', 'name'], props.name], '#e74c3c', ['get', 'fillColor']])
    })
    map.on('mouseenter', 'buildings-overlay-fill', () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'buildings-overlay-fill', () => { map.getCanvas().style.cursor = '' })

    // Copy mode (?copy) — click any base map building to extract polygon coords
    if ('copy' in route.query) {
      map.addSource('copy-highlight', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      map.addLayer({ id: 'copy-highlight-fill', type: 'fill', source: 'copy-highlight', paint: { 'fill-color': '#e74c3c', 'fill-opacity': 1 } })

      map.on('click', 'building', (e) => {
        if (!e.features?.length) return
        const coords = extractCoords(e.features[0].geometry)
        if (!coords) return
        selectedBuilding.value = { name: 'Building coordinates', fillColor: '', mainImage: '', content: [], polygonJson: JSON.stringify(coords) }
        setCopyHighlight(map, coords)
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
  <BuildingDetail :building="selectedBuilding" @close="closeBuilding" />
  <MapIntro v-if="!isDev && !('curated' in route.query)" />
</template>

<style scoped src="./map.scss"></style>
