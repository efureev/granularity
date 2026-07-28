import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'

export default defineConfig({
    root: fileURLToPath(new URL('./', import.meta.url)),
    base: '/playground-config/',
    plugins: [
        vue(),
        UnoCSS({
            configFile: fileURLToPath(new URL('./uno.config.ts', import.meta.url)),
        }),
    ],
})
