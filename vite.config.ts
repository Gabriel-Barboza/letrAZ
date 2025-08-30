import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Adicionando seus novos SVGs para serem incluídos no cache
      includeAssets: ['faviconF.svg', 'letrazLogoFF.svg'], 
      manifest: {
        name: 'LetrAZ',
        short_name: 'LetrAZ',
        description: 'Um divertido jogo de adivinhar a palavra de 5 letras em português.',
        theme_color: '#0284c7',
        background_color: '#0284c7',
        display: 'standalone',
        scope: '/',
        start_url: '/?source=pwa',
        icons: [
    {
      src: 'pwa-192x192.png',
      sizes: '192x192',
      type: 'image/png'
    },
    {
      src: 'pwa-512x512.png',
      sizes: '512x512',
      type: 'image/png',
    }
  ],
  screenshots: [
      {
        src: 'screenshot-desktop.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide', // Fator de forma 'largo' para desktop
        label: 'Tela do Jogo no Desktop'
      },
      {
        src: 'screenshot-mobile.png',
        sizes: '720x1280',
        type: 'image/png',
        form_factor: 'narrow', // Fator de forma 'estreito' para celular
        label: 'Tela do Jogo no Celular'
      }
    ]
      }
    })
  ]
})