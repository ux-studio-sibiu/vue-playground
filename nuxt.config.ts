// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  routeRules: {
    '/**': {
      headers: {
        'X-Frame-Options': '',
        'Content-Security-Policy': 'frame-ancestors *',
      },
    },
  },
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap' },
      ],
    },
  },
  modules: ['@nuxtjs/tailwindcss', 'shadcn-nuxt', '@nuxtjs/sanity'],
  sanity: {
    projectId: process.env.NUXT_SANITY_PROJECT_ID,
    dataset: 'production',
    apiVersion: '2024-01-01',
    useCdn: true,
  },
  runtimeConfig: {
    sanity: {
      projectId: process.env.NUXT_SANITY_PROJECT_ID,
      dataset: 'production',
      apiVersion: '2024-01-01',
    },
  },
  css: ['~/assets/css/shadcn.css', '~/assets/scss/global.scss'],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/scss/_variables" as *;',
        },
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react/jsx-runtime', 'styled-components'],
    },
    define: {
      'process.env.SANITY_STUDIO_BASEPATH': JSON.stringify('/studio'),
    },
  },
})
