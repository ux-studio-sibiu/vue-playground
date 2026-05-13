import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'

const singletonTypes = ['websiteSettings']

export default defineConfig({
  basePath: '/studio',
  name: 'default',
  title: 'Vue-Sanity-Studio',
  projectId: '7bb8d8bc',
  dataset: 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Website Settings')
              .child(S.document().schemaType('websiteSettings').documentId('websiteSettings')),
            S.divider(),
            ...S.documentTypeListItems().filter((item) => !singletonTypes.includes(item.getId()!)),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
})
