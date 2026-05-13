import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NUXT_SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

export default defineEventHandler(async () => {
  return await client.fetch(`*[_type == "project"]{
    title,
    description,
    year,
    address,
    "mainImage": mainImage.asset->url,
    "images": images[].asset->url
  }`)
})
