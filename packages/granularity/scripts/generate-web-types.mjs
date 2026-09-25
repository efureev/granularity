import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createChecker } from 'vue-component-meta'

import { componentEntries, expandPropType } from './webTypes.mjs'

// Генерация web-types.json из РЕАЛЬНЫХ SFC (vue-component-meta), а не ручной
// синхронизации. Кладём результат в `dist/`, чтобы он публиковался (`files: ["dist"]`)
// и подхватывался IDE через поле `web-types` в package.json.

const pkgDir = fileURLToPath(new URL('..', import.meta.url))
const componentsDir = resolve(pkgDir, 'src/components')
const tsconfigPath = resolve(pkgDir, 'tsconfig.json')
const outputPath = resolve(pkgDir, 'dist/web-types.json')

const filteredPropNames = new Set(['key', 'ref', 'ref_for', 'ref_key', 'class', 'style'])

function normalizeText(value) {
  return (value ?? '').replace(/\s+/g, ' ').trim()
}

async function main() {
  const pkg = JSON.parse(await readFile(resolve(pkgDir, 'package.json'), 'utf8'))
  const entries = componentEntries(pkg.exports)
    .map(entry => ({ ...entry, sfc: resolve(componentsDir, entry.owner, `${entry.name}.vue`) }))
  const withoutSfc = entries.filter(entry => !existsSync(entry.sfc)).map(entry => entry.name)
  const checker = createChecker(tsconfigPath, { schema: true })

  const vueComponents = entries.filter(entry => existsSync(entry.sfc)).map(({ name, sfc }) => {
    const meta = checker.getComponentMeta(sfc)

    const props = meta.props
      .filter(prop => !prop.global)
      .filter(prop => !filteredPropNames.has(prop.name))
      .filter(prop => !prop.name.startsWith('onVue:'))
      .map(prop => ({
        name: prop.name,
        required: prop.required === true ? true : undefined,
        description: normalizeText(prop.description) || undefined,
        default: prop.default ?? undefined,
        value: prop.type ? { kind: 'expression', type: expandPropType(prop.type, prop.schema) } : undefined,
      }))

    const events = meta.events.map(event => ({
      name: event.name,
      description: normalizeText(event.description) || undefined,
    }))

    const slots = meta.slots.map(slot => ({
      name: slot.name,
      description: normalizeText(slot.description) || undefined,
    }))

    return {
      name,
      source: {
        module: `@feugene/granularity/components/${name}`,
        symbol: name,
      },
      props,
      ...(slots.length > 0 ? { slots } : {}),
      ...(events.length > 0 ? { js: { events } } : {}),
    }
  })

  const webTypes = {
    '$schema': 'https://raw.githubusercontent.com/JetBrains/web-types/master/schema/web-types.json',
    'name': pkg.name,
    'version': pkg.version,
    'framework': 'vue',
    'js-types-syntax': 'typescript',
    'description-markup': 'markdown',
    'contributions': {
      html: {
        'vue-components': vueComponents,
      },
    },
  }

  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify(webTypes, null, 2)}\n`, 'utf8')

  console.log(`web-types.json: ${vueComponents.length} components → ${outputPath}`)
  if (withoutSfc.length)
    console.log(`web-types.json: без SFC, не описаны — ${withoutSfc.join(', ')}`)
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error)
    process.exit(1)
  },
)
