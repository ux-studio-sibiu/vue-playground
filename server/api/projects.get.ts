import { createClient } from '@sanity/client'

export default defineEventHandler(async () => {
  const { sanity } = useRuntimeConfig()

  const client = createClient({
    projectId: sanity.projectId,
    dataset: sanity.dataset,
    apiVersion: sanity.apiVersion,
    useCdn: true,
  })

  return await client.fetch(`*[_type == "project"]{
    title,
    description,
    year,
    address,
    "mainImage": mainImage.asset->url,
    "images": images[].asset->url
  }`)
})
