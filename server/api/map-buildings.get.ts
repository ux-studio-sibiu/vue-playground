import { createClient } from '@sanity/client'

export default defineEventHandler(async () => {
  const { sanity } = useRuntimeConfig()

  const client = createClient({
    projectId: sanity.projectId,
    dataset: sanity.dataset,
    apiVersion: sanity.apiVersion,
    useCdn: true,
  })

  const buildings = await client.fetch(`*[_type == "building"]{
    title,
    fillColor,
    "mainImage": mainImage.asset->url,
    "content": content[]{
      description,
      "images": images[].asset->url
    },
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
          fillColor: b.fillColor || '#e74c3c',
          mainImage: b.mainImage || '',
          content: JSON.stringify(b.content || []),
        },
        geometry: {
          type: 'Polygon',
          coordinates: [JSON.parse(b.polygonJson)],
        },
      })),
  }
})
