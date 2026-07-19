import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createChecker } from 'vue-component-meta'
import { createServer } from 'vite'

const showcaseDir = fileURLToPath(new URL('..', import.meta.url))
const workspaceRoot = resolve(showcaseDir, '../..')
const granularityTsconfigPath = resolve(workspaceRoot, 'packages/granularity/tsconfig.json')
const granularityRegistryPath = resolve(workspaceRoot, 'packages/granularity/src/granular-provider/shared.ts')
const outputPath = resolve(showcaseDir, 'src/content/generated/componentApi.generated.json')

const filteredPropNames = new Set([
  'key',
  'ref',
  'ref_for',
  'ref_key',
  'class',
  'style',
])

// Список компонентов берём из реального реестра granular-provider'а, а не парсим
// исходник регуляркой: импортируем модуль через vite SSR и читаем ключи
// `granularityComponentConfigs` в рантайме. Это убирает хрупкую связь «формат кода = API».
async function loadComponentNames() {
  const server = await createServer({
    configFile: resolve(showcaseDir, 'vite.config.ts'),
    server: { middlewareMode: true, watch: null },
    appType: 'custom',
    logLevel: 'error',
    optimizeDeps: { noDiscovery: true },
  })

  try {
    const provider = await server.ssrLoadModule(granularityRegistryPath)
    return Object.keys(provider.granularityComponentConfigs)
  }
  finally {
    await server.close()
  }
}

function normalizeText(value) {
  if (!value)
    return ''

  return value.replace(/\s+/g, ' ').trim()
}

function toApiItem(entry) {
  return {
    name: entry.name,
    description: normalizeText(entry.description),
    type: entry.type ?? undefined,
    required: typeof entry.required === 'boolean' ? entry.required : undefined,
    default: entry.default ?? undefined,
  }
}

function createSection(key, title, items, origin = 'generated') {
  return {
    key,
    title,
    origin,
    items,
  }
}

async function main() {
  const componentNames = await loadComponentNames()
  const checker = createChecker(granularityTsconfigPath, { schema: true })

  const metadata = {}

  for (const componentName of componentNames) {
    const componentPath = resolve(
      workspaceRoot,
      `packages/granularity/src/components/${componentName}/${componentName}.vue`,
    )

    // Не у каждой записи реестра есть одноимённый SFC: например, `GrDialogService` —
    // это сервис (host + composable), рендерящийся `GrDialogServiceHost.vue`. Такие
    // «сервисные» компоненты в API-таблицу пропсов не попадают — пропускаем.
    if (!existsSync(componentPath)) {
      continue
    }

    const meta = checker.getComponentMeta(componentPath)

    const props = meta.props
      .filter(prop => !prop.global)
      .filter(prop => !filteredPropNames.has(prop.name))
      .filter(prop => !prop.name.startsWith('onVue:'))
      .map(toApiItem)

    const slots = meta.slots.map(slot => ({
      name: slot.name,
      description: normalizeText(slot.description),
      type: slot.type ?? undefined,
    }))

    const events = meta.events.map(event => ({
      name: event.name,
      description: normalizeText(event.description),
      type: event.type ?? undefined,
      signature: event.signature ?? undefined,
    }))

    const methods = meta.exposed.map(exposed => ({
      name: exposed.name,
      description: normalizeText(exposed.description),
      type: exposed.type ?? undefined,
    }))

    metadata[componentName] = {
      name: componentName,
      sourcePath: `packages/granularity/src/components/${componentName}/${componentName}.vue`,
      sections: [
        createSection('props', 'Props', props),
        createSection('slots', 'Slots', slots),
        createSection('events', 'Events', events),
        createSection('methods', 'Methods / Expose', methods),
      ],
    }
  }

  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8')
}

main().then(
  () => {
    // Vite-плагины оставляют активные handle даже после `server.close()`;
    // это разовая CLI-утилита — принудительно завершаем процесс.
    process.exit(0)
  },
  (error) => {
    console.error(error)
    process.exit(1)
  },
)