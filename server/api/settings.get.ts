import { createClient } from '@sanity/client'

export default defineEventHandler(async () => {
  const { sanity } = useRuntimeConfig()

  const client = createClient({
    projectId: sanity.projectId,
    dataset: sanity.dataset,
    apiVersion: sanity.apiVersion,
    useCdn: true,
  })

  return await client.fetch(`*[_type == "websiteSettings" && _id == "websiteSettings"][0]{
    contactInfo
  }`)
})
