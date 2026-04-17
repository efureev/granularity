import {fileURLToPath, URL} from 'node:url'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import Components from 'unplugin-vue-components/vite'

// Резолвер `unplugin-vue-components` из отдельного build-time пакета.
// Благодаря ему `<DsIcon />` в шаблонах авто-резолвится в sub-path
// `@feugene/granularity/components/DsIcon` — никаких ручных `import` в SFC.
import {GranularityResolver} from '@feugene/unplugin-granularity'

export const playground9GranularityDistDir = fileURLToPath(
    new URL('../../packages/granularity/dist/', import.meta.url),
)

// Чанк-группы на случай production-сборки: отдельно `vue`, отдельно `reset`,
// отдельно код `granularity` (всё, что пришло из dist-а рантайм-пакета).
export const playground9VueChunkGroup = {
    name: 'vue',
    test: /node_modules[\\/](?:vue|@vue)[\\/]/,
    priority: 3,
}

export const playground9ResetChunkGroup = {
    name: 'reset',
    test: /node_modules[\\/]@unocss[\\/]reset[\\/]/,
    priority: 1,
}

export const playground9GranularityChunkGroup = {
    name: 'granularity',
    test: (id: string) => id.startsWith(playground9GranularityDistDir),
    priority: 2,
}

export default defineConfig({
    root: fileURLToPath(new URL('./', import.meta.url)),
    base: '/playground-9/',
    build: {
        rolldownOptions: {
            output: {
                codeSplitting: {
                    groups: [
                        playground9VueChunkGroup,
                        playground9ResetChunkGroup,
                        playground9GranularityChunkGroup,
                    ],
                },
            },
        },
    },
    plugins: [
        vue(),
        UnoCSS({
            configFile: fileURLToPath(new URL('./uno.config.ts', import.meta.url)),
        }),
        Components({
            // Генерируем `components.d.ts` рядом с конфигом — Volar/vue-tsc
            // подхватят типы глобальных тегов автоматически.
            dts: fileURLToPath(new URL('./components.d.ts', import.meta.url)),
            // В этом playground'е директивы не используются — отключаем их
            // авто-импорт, чтобы резолвер точно не затащил ничего лишнего.
            resolvers: [
                GranularityResolver({
                    directives: false,
                }),
            ],
        }),
    ],
})
