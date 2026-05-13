import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'websiteSettings',
  title: 'Website Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'contactInfo',
      title: 'Contact Info',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
})
