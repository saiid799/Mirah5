import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'

// Cloudflare Workers لا يوفّر نظام ملفات، لذا نفعّل الإضافة عند البناء فقط ونشغّل التطوير على Node
const config = defineConfig(({ command }) => ({
  resolve: { tsconfigPaths: true },
  plugins: [...(command === 'build' ? [cloudflare({ viteEnvironment: { name: 'ssr' } })] : []), devtools(), tailwindcss(), tanstackStart(), viteReact()],
}))

export default config
