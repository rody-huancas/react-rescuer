import { defineConfig } from 'vitepress'

export default defineConfig({
  title      : 'react-rescuer',
  description: 'Smart React error boundaries with recovery, observability, and DevOverlay',
  appearance : 'dark',
  // Set to '/react-rescuer/' for GitHub Pages at rody-huancas.github.io/react-rescuer/
  // Change to '/' if using a custom domain
  base: '/react-rescuer/',

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started', activeMatch: '/guide/' },
      { text: 'API', link: '/api/reference', activeMatch: '/api/' },
    ],

    sidebar: [
      {
        text : 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Fallback UI', link: '/guide/fallback' },
          { text: 'Automatic Recovery', link: '/guide/recovery' },
          { text: 'Observability', link: '/guide/observability' },
          { text: 'Async Errors', link: '/guide/async-errors' },
          { text: 'Testing', link: '/guide/testing' },
        ],
      },
      {
        text : 'API',
        items: [
          { text: 'Reference', link: '/api/reference' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/rody-huancas/react-rescuer' },
    ],

    editLink: {
      pattern: 'https://github.com/rody-huancas/react-rescuer/edit/main/packages/docs/:path',
      text   : 'Edit this page on GitHub',
    },

    footer: {
      message  : 'Released under the MIT License.',
      copyright: 'Copyright © 2024–present Rody Huancas',
    },
  },
})
