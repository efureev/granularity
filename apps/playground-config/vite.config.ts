import { fileURLToPath, URL } from 'node:url'
import { granum } from '@feugene/granum/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

import granumConfig from './granum.config'

export default defineConfig({
    root: fileURLToPath(new URL('./', import.meta.url)),
    base: '/playground-config/',
    plugins: [
        vue(),
        granum(granumConfig),
    ],
})
