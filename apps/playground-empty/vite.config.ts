import {fileURLToPath, URL} from 'node:url'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {visualizer} from 'rollup-plugin-visualizer'

export const playgroundEmptyBase = '/playground-empty/'
export const playgroundEmptyVueChunkGroup = {
    name: 'vue',
    test: /node_modules[\\/](?:vue|@vue)[\\/]/,
}

export default defineConfig(({mode}) => ({
    root: fileURLToPath(new URL('./', import.meta.url)),
    base: playgroundEmptyBase,
    build: {
        rolldownOptions: {
            output: {
                codeSplitting: {
                    groups: [
                        playgroundEmptyVueChunkGroup,
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
