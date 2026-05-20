import maplibregl from 'maplibre-gl'

export function extractCoords(geometry: GeoJSON.Geometry): GeoJSON.Position[] | null {
  if (geometry.type === 'Polygon') {
    const polygon = geometry as GeoJSON.Polygon
    const outerRing = polygon.coordinates[0]
    return outerRing ?? null
  }

  if (geometry.type === 'MultiPolygon') {
    const multiPolygon = geometry as GeoJSON.MultiPolygon
    const firstPolygon = multiPolygon.coordinates[0]
    if (!firstPolygon) return null
    const firstRing = firstPolygon[0]
    return firstRing ?? null
  }

  return null
}

export function setCopyHighlight(map: maplibregl.Map, coords: GeoJSON.Position[]) {
  const feature: GeoJSON.Feature<GeoJSON.Polygon> = {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [coords] },
  }

  ;(map.getSource('copy-highlight') as maplibregl.GeoJSONSource).setData({
    type: 'FeatureCollection',
    features: [feature],
  })
}

export function clearCopyHighlight(map: maplibregl.Map | null) {
  if (!map?.getSource('copy-highlight')) return

  ;(map.getSource('copy-highlight') as maplibregl.GeoJSONSource).setData({
    type: 'FeatureCollection',
    features: [],
  })
}