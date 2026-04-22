import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createServer } from 'vite'

const showcaseDir = fileURLToPath(new URL('..', import.meta.url))
const outputPath = resolve(showcaseDir, 'src/content/generated/showcaseSearchIndex.generated.json')

async function loadShowcaseModules() {
  const server = await createServer({
    configFile: resolve(showcaseDir, 'vite.config.ts'),
    server: {
      middlewareMode: true,
      // Нам нужен только `ssrLoadModule` — file-watcher от chokidar и прочие
      // handle только мешают: они переживают `server.close()` и не дают
      // Node завершиться. Отключаем watcher сразу.
      watch: null,
    },
    appType: 'custom',
    logLevel: 'error',
    // Запрещаем автодискавери зависимостей — для разового SSR-импорта оно
    // не нужно, а dep-scanner оставляет фоновые задачи.
    optimizeDeps: { noDiscovery: true },
  })

  try {
    const showcase = await server.ssrLoadModule('/src/app/showcase.ts')
    const showcaseSearch = await server.ssrLoadModule('/src/app/showcaseSearch.ts')

    return {
      showcase,
      showcaseSearch,
    }
  }
  finally {
    await server.close()
  }
}

async function main() {
  const {
    showcase,
    showcaseSearch,
  } = await loadShowcaseModules()

  const pageEntries = showcase.showcaseNavigationItems.map(item => showcaseSearch.createPageEntry(
    item,
    showcase.getShowcaseSectionsForPath(item.path),
  ))

  const entityEntries = showcase.showcaseEntityRegistry.map(entity => showcaseSearch.createEntityEntry(entity))

  const searchIndex = [
    ...pageEntries,
    ...pageEntries.flatMap(entry => showcase.getShowcaseSectionsForPath(entry.href).map(section => showcaseSearch.createSectionEntry(entry, section))),
    ...entityEntries,
    ...entityEntries.flatMap(entry => showcase.getShowcaseSectionsForPath(entry.href).map(section => showcaseSearch.createSectionEntry(entry, section))),
  ]

  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify(searchIndex, null, 2)}\n`, 'utf8')
}

main().then(
  () => {
    // Vite-плагины (`UnoCSS`, `unplugin-icons`, `@vitejs/plugin-vue`, т.п.)
    // оставляют активные handle даже после `server.close()`. Здесь это
    // разовая CLI-утилита — принудительно завершаем процесс, иначе он
    // висит в CI/yarn scripts.
    process.exit(0)
  },
  (error) => {
    console.error(error)
    process.exit(1)
  },
)