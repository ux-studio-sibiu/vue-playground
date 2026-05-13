import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NUXT_SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

export default defineEventHandler(async () => {
  return await client.fetch(`*[_type == "websiteSettings" && _id == "websiteSettings"][0]{
    contactInfo
  }`)
})
