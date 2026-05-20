import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'building',
  title: 'Building',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'fillColor',
      title: 'Fill Color',
      type: 'string',
      initialValue: '#e74c3c',
    }),
    defineField({
      name: 'yearBuild',
      title: 'Year Built',
      type: 'number',
      validation: (rule) => rule.integer().min(1000).max(new Date().getFullYear()),
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'contentBlock',
          title: 'Content Block',
          fields: [

            defineField({
              name: 'images',
              title: 'Images',
              type: 'array',
              of: [{ type: 'image', options: { hotspot: true } }],
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
            }),
            
          ],
          preview: {
            select: { title: 'description' },
            prepare: ({ title }: { title?: string }) => ({
              title: title ? title.slice(0, 80) : 'Paragrafe',
            }),
          },
        },
      ],
    }),
    defineField({
      name: 'polygonJson',
      title: 'Polygon Coordinates (JSON)',
      type: 'text',
      description: 'Paste the coordinates array from the map console logger. Format: [[lng, lat], [lng, lat], ...]',
      validation: (rule) =>
        rule.required().custom((value) => {
          if (!value) return true
          try {
            const parsed = JSON.parse(value)
            if (!Array.isArray(parsed)) return 'Must be a JSON array of [lng, lat] pairs'
            return true
          } catch {
            return 'Invalid JSON'
          }
        }),
    }),
  ],
})
