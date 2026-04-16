import {fileURLToPath, URL} from 'node:url'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {visualizer} from 'rollup-plugin-visualizer'

export default defineConfig(({mode}) => ({
    root: fileURLToPath(new URL('./', import.meta.url)),
    base: '/playground/',
    build: {
        rolldownOptions: {
            output: {
                codeSplitting: {
                    groups: [
                        {
                            name: 'vue',
                            test: /node_modules[\\/](?:vue|@vue)[\\/]/,
                        },
                    ],
                },
            },
        },
    },
    plugins: [
        vue(),
        mode === 'analyze' && visualizer({
            filename: 'dist/stats.html',
            gzipSize: true,
            brotliSize: true,
            template: 'treemap',
        }),
    ],
}))