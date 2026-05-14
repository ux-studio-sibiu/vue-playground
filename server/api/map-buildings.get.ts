import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NUXT_SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

export default defineEventHandler(async () => {
  const buildings = await client.fetch(`*[_type == "building"]{
    title,
    description,
    fillColor,
    polygonJson
  }`)

  return {
    type: 'FeatureCollection',
    features: buildings
      .filter((b: any) => b.polygonJson)
      .map((b: any) => ({
        type: 'Feature',
        properties: {
          name: b.title,
          description: b.description || '',
          fillColor: b.fillColor || '#e74c3c',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [JSON.parse(b.polygonJson)],
        },
      })),
  }
})
