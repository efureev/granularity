import { readdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Генерация четырёх реестров компонентов из файловой структуры.
 *
 * Компонент считается публичным, если у него есть и `index.ts`, и `config.ts`
 * в `src/components/GrX/`. Из этого списка генерируются:
 *
 *   src/index.ts                     — root-barrel (`export * from './components/GrX'`);
 *   package.json#exports             — subpath `./components/GrX`;
 *   vite.config.ts                   — entry `components/GrX/index`;
 *   src/granular-provider/shared.ts  — импорт `grXConfig` + запись в реестр.
 *
 * Зачем: списки синхронизировались руками, и пропуск любого из них не даёт
 * ошибки сборки — ломается что-то одно (tree-shaking, subpath-импорт, скан
 * UnoCSS-классов или генерация API-доки витрины), причём молча. К моменту
 * написания генератора списки уже разъехались: в `package.json` порядок
 * `GrTable, GrTabs, GrTabPanels` против `GrTable, GrTabPanels, GrTabs`
 * в трёх остальных.
 *
 * В TS-файлах блоки размечены маркерами `// <granularity:components>` —
 * генератор переписывает только их, остальное содержимое файла его не касается.
 * В `package.json` маркеров быть не может, поэтому там заменяется непрерывный
 * ряд ключей `./components/Gr*` на месте первого из них.
 *
 * Запуск: `yarn generate:registry`, `--check` — только проверка расхождения
 * (используется тестом `src/__tests__/registry.generated.test.ts`).
 */

const pkgDir = fileURLToPath(new URL('..', import.meta.url))
const componentsDir = resolve(pkgDir, 'src/components')

const BLOCK_OPEN_PREFIX = '<granularity:components'
const BLOCK_CLOSE_PREFIX = '</granularity:components'

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Порядок во всех четырёх списках — регистронезависимый алфавитный. */
function compareComponentNames(left, right) {
  return left.toLowerCase() < right.toLowerCase() ? -1 : left.toLowerCase() > right.toLowerCase() ? 1 : 0
}

/** Имя экспорта конфига выводится из имени компонента: `GrX` → `grXConfig`. */
function configExportName(component) {
  return `gr${component.slice(2)}Config`
}

async function collectComponents() {
  const entries = await readdir(componentsDir, { withFileTypes: true })

  const components = entries
    .filter(entry => entry.isDirectory() && entry.name.startsWith('Gr'))
    .map(entry => entry.name)
    .filter(name => (
      existsSync(resolve(componentsDir, name, 'index.ts'))
      && existsSync(resolve(componentsDir, name, 'config.ts'))
    ))
    .sort(compareComponentNames)

  // Конвенция имени конфига — часть контракта: по ней строится импорт в
  // провайдере. Расхождение ловим здесь, а не отладкой сборки.
  for (const component of components) {
    const source = await readFile(resolve(componentsDir, component, 'config.ts'), 'utf8')
    const declared = source.match(/export const (\w+)\s*=\s*defineGranularComponent/)?.[1]

    if (declared !== configExportName(component)) {
      throw new Error(
        `${component}/config.ts экспортирует \`${declared ?? '—'}\`, а реестр ждёт `
        + `\`${configExportName(component)}\`. Переименуй экспорт: имя выводится из имени компонента.`,
      )
    }
  }

  return components
}

/**
 * Заменяет содержимое размеченного блока. Маркеры и отступ берутся из файла —
 * генератор не навязывает форматирование окружающему коду.
 */
function replaceBlock(source, blockId, lines, filePath) {
  const suffix = blockId ? `:${blockId}` : ''
  const openTag = `${BLOCK_OPEN_PREFIX}${suffix}>`
  const closeTag = `${BLOCK_CLOSE_PREFIX}${suffix}>`

  const open = new RegExp(`^([ \\t]*)//\\s*${escapeRegExp(openTag)}.*$`, 'm')
  const openMatch = source.match(open)

  if (!openMatch)
    throw new Error(`в ${filePath} нет открывающего маркера \`// ${openTag}\``)

  const indent = openMatch[1]
  const openIndex = openMatch.index + openMatch[0].length
  const close = new RegExp(`^[ \\t]*//\\s*${escapeRegExp(closeTag)}.*$`, 'm')
  const rest = source.slice(openIndex)
  const closeMatch = rest.match(close)

  if (!closeMatch)
    throw new Error(`в ${filePath} нет закрывающего маркера \`// ${closeTag}\``)

  const body = lines.map(line => (line ? `${indent}${line}` : '')).join('\n')

  // Всё между маркерами заменяется целиком; `rest.slice(closeMatch.index)` —
  // это закрывающий маркер и хвост файла.
  return `${source.slice(0, openIndex)}\n${body}\n${rest.slice(closeMatch.index)}`
}

// --- рендеры ---------------------------------------------------------------

function renderIndex(source, components) {
  return replaceBlock(
    source,
    null,
    components.map(component => `export * from './components/${component}'`),
    'src/index.ts',
  )
}

function renderViteConfig(source, components) {
  const lines = components.flatMap(component => [
    `'components/${component}/index': fileURLToPath(`,
    `  new URL('./src/components/${component}/index.ts', import.meta.url),`,
    '),',
  ])

  return replaceBlock(source, null, lines, 'vite.config.ts')
}

function renderProviderShared(source, components) {
  const withImports = replaceBlock(
    source,
    'imports',
    components.map(component => (
      `import { ${configExportName(component)} } from '../components/${component}/config'`
    )),
    'src/granular-provider/shared.ts',
  )

  return replaceBlock(
    withImports,
    'registry',
    components.map(component => `${component}: ${configExportName(component)},`),
    'src/granular-provider/shared.ts',
  )
}

function renderPackageJson(source, components) {
  const pkg = JSON.parse(source)
  const entries = Object.entries(pkg.exports)
  const isComponentKey = key => key.startsWith('./components/Gr')
  const firstComponentIndex = entries.findIndex(([key]) => isComponentKey(key))

  if (firstComponentIndex === -1)
    throw new Error('в package.json#exports нет ни одного subpath `./components/Gr*`')

  const componentEntries = components.map(component => [
    `./components/${component}`,
    {
      types: `./dist/types/src/components/${component}/index.d.ts`,
      import: `./dist/components/${component}/index.js`,
    },
  ])

  pkg.exports = Object.fromEntries([
    ...entries.slice(0, firstComponentIndex).filter(([key]) => !isComponentKey(key)),
    ...componentEntries,
    ...entries.slice(firstComponentIndex).filter(([key]) => !isComponentKey(key)),
  ])

  return `${JSON.stringify(pkg, null, 2)}\n`
}

// --- запись ----------------------------------------------------------------

async function main() {
  const check = process.argv.includes('--check')
  const components = await collectComponents()

  const targets = [
    ['src/index.ts', renderIndex],
    ['vite.config.ts', renderViteConfig],
    ['package.json', renderPackageJson],
    ['src/granular-provider/shared.ts', renderProviderShared],
  ]

  const stale = []

  for (const [relativePath, render] of targets) {
    const absolutePath = resolve(pkgDir, relativePath)
    const current = await readFile(absolutePath, 'utf8')
    const next = render(current, components)

    if (next === current)
      continue

    if (check) {
      stale.push(relativePath)
      continue
    }

    await writeFile(absolutePath, next, 'utf8')
  }

  if (check) {
    if (stale.length > 0) {
      console.error(
        `[registry] реестры разошлись с \`src/components/\`: ${stale.join(', ')}\n`
        + 'Запусти `yarn generate:registry`.',
      )
      process.exitCode = 1
      return
    }

    console.log(`[registry] все четыре реестра актуальны (${components.length} компонентов)`)
    return
  }

  console.log(`[registry] синхронизировано ${components.length} компонентов в ${targets.length} реестрах`)
}

await main()
