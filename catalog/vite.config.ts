import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const entry = (p: string) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    cssMinify: true,
    rollupOptions: {
      input: {
        main: entry('index.html'),
        admin: entry('admin/index.html'),
      },
    },
  },
})
