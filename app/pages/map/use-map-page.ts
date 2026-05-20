import maplibregl from 'maplibre-gl'
import { computed, onMounted, ref } from 'vue'
import { Protocol } from 'pmtiles'
import { useRoute } from '#imports'
import { baseLayers, overlayLayers } from '~/lib/map-layers'
import { clearCopyHighlight, extractCoords, setCopyHighlight } from './map-geojson'
import { applyYearHeatmap, type YearLegendItem } from './map-heatmap'

type Building = {
  name: string
  fillColor: string
  mainImage: string
  content: { description?: string; images?: string[] }[]
  polygonJson?: string
}

function getSortParam(route: ReturnType<typeof useRoute>): string {
  const sort = route.query.sort
  if (Array.isArray(sort)) return sort[0] ?? ''
  return sort ?? ''
}

export function useMapPage() {
  const route = useRoute()
  const mapContainer = ref<HTMLElement | null>(null)
  const zoomLevel = ref(16)
  const geoWarning = ref(false)
  const yearLegendItems = ref<YearLegendItem[]>([])
  const selectedBuilding = ref<Building | null>(null)
  const isYearSort = computed(() => getSortParam(route) === 'year')

  let mapInstance: maplibregl.Map | null = null
  let hoveredBuildingId: string | number | null = null

  function closeBuilding() {
    selectedBuilding.value = null
    if (mapInstance?.getLayer('buildings-overlay-fill')) {
      mapInstance.setPaintProperty('buildings-overlay-fill', 'fill-color', ['get', 'fillColor'])
    }
    clearCopyHighlight(mapInstance)
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

    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
    })
    map.addControl(geolocate)
    geolocate.on('geolocate', (e: GeolocationPosition) => {
      const { longitude, latitude } = e.coords
      geoWarning.value = longitude < 24.135 || longitude > 24.17 || latitude < 45.79 || latitude > 45.806
    })

    map.on('zoom', () => {
      zoomLevel.value = Math.round(map.getZoom() * 10) / 10
    })

    map.on('load', async () => {
      const res = await fetch('/api/map-buildings')
      const buildings = await res.json()

      yearLegendItems.value = isYearSort.value ? applyYearHeatmap(buildings) : []

      map.addSource('buildings-overlay', { type: 'geojson', data: buildings, generateId: true })
      overlayLayers.forEach((layer) => map.addLayer(layer))

      map.on('click', 'buildings-overlay-fill', (e?: maplibregl.MapLayerMouseEvent) => {
        if (!e) return
        const feature = e.features?.[0]
        if (!feature?.properties) return

        const props = feature.properties as Record<string, unknown>
        const name = typeof props.name === 'string' ? props.name : ''
        const fillColor = typeof props.fillColor === 'string' ? props.fillColor : '#e74c3c'
        const mainImage = typeof props.mainImage === 'string' ? props.mainImage : ''
        const contentRaw = typeof props.content === 'string' ? props.content : '[]'
        const content = JSON.parse(contentRaw)

        selectedBuilding.value = { name, fillColor, mainImage, content }
        map.setPaintProperty('buildings-overlay-fill', 'fill-color', [
          'case',
          ['==', ['get', 'name'], name],
          '#e74c3c',
          ['get', 'fillColor'],
        ])
      })

      map.on('mouseenter', 'buildings-overlay-fill', () => {
        map.getCanvas().style.cursor = 'pointer'
      })

      map.on('mousemove', 'buildings-overlay-fill', (e) => {
        const feature = e.features?.[0]
        if (!feature || feature.id === undefined) return

        const nextHoveredId = feature.id
        if (hoveredBuildingId !== null && hoveredBuildingId !== nextHoveredId) {
          map.setFeatureState({ source: 'buildings-overlay', id: hoveredBuildingId }, { hover: false })
        }

        hoveredBuildingId = nextHoveredId
        map.setFeatureState({ source: 'buildings-overlay', id: hoveredBuildingId }, { hover: true })
      })

      map.on('mouseleave', 'buildings-overlay-fill', () => {
        map.getCanvas().style.cursor = ''
        if (hoveredBuildingId !== null) {
          map.setFeatureState({ source: 'buildings-overlay', id: hoveredBuildingId }, { hover: false })
          hoveredBuildingId = null
        }
      })

      if ('copy' in route.query) {
        map.addSource('copy-highlight', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
        map.addLayer({
          id: 'copy-highlight-fill',
          type: 'fill',
          source: 'copy-highlight',
          paint: { 'fill-color': '#e74c3c', 'fill-opacity': 1 },
        })

        map.on('click', 'building', (e?: maplibregl.MapLayerMouseEvent) => {
          if (!e) return
          const feature = e.features?.[0]
          if (!feature) return

          const coords = extractCoords(feature.geometry)
          if (!coords) return

          selectedBuilding.value = {
            name: 'Building coordinates',
            fillColor: '',
            mainImage: '',
            content: [],
            polygonJson: JSON.stringify(coords),
          }
          setCopyHighlight(map, coords)
        })

        map.on('mouseenter', 'building', () => {
          map.getCanvas().style.cursor = 'crosshair'
        })

        map.on('mouseleave', 'building', () => {
          map.getCanvas().style.cursor = ''
        })
      }
    })
  })

  return {
    mapContainer,
    zoomLevel,
    geoWarning,
    yearLegendItems,
    isYearSort,
    selectedBuilding,
    closeBuilding,
  }
}