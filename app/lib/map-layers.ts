import type { LayerSpecification } from 'maplibre-gl'

export const baseLayers: LayerSpecification[] = [
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
    paint: { 'fill-color': '#fcfcfc', 'fill-opacity': 0.6 },
  },
  {
    id: 'landuse',
    type: 'fill',
    source: 'sibiu',
    'source-layer': 'landuse',
    paint: { 'fill-color': '#cccccc', 'fill-opacity': 1 },
  },
  {
    id: 'park',
    type: 'fill',
    source: 'sibiu',
    'source-layer': 'park',
    paint: { 'fill-color': '#78b840', 'fill-opacity': 0.6 },
  },
  {
    id: 'water',
    type: 'fill',
    source: 'sibiu',
    'source-layer': 'water',
    paint: { 'fill-color': '#ffffff' },
  },
  {
    id: 'waterway',
    type: 'line',
    source: 'sibiu',
    'source-layer': 'waterway',
    paint: { 'line-color': '#ffffff', 'line-width': 0 },
  },
  {
    id: 'transportation',
    type: 'line',
    source: 'sibiu',
    'source-layer': 'transportation',
    paint: { 'line-color': '#ffffffcc', 'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1, 16, 2, 18, 3] },
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
    paint: { 'line-color': '#000000', 'line-width': ['interpolate', ['linear'], ['zoom'], 15, 1, 16, 2, 17, 3, 18, 4] },
  },
]

export const overlayLayers: LayerSpecification[] = [
  {
    id: 'buildings-overlay-fill',
    type: 'fill',
    source: 'buildings-overlay',
    paint: {
      'fill-color': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        '#3f3f3f',
        ['get', 'fillColor'],
      ],
      'fill-opacity': 1,
    },
  },
  {
    id: 'buildings-overlay-outline',
    type: 'line',
    source: 'buildings-overlay',
    paint: { 'line-color': '#000000', 'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.2, 16, 1] },
  },
]
