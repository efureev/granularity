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
    },
    appType: 'custom',
    logLevel: 'error',
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

await main()