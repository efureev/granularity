import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { emitCss, prepareApp, readComponentThemesDir } from '@feugene/granum/node'
import { windEngine } from '@feugene/granum-engine-wind'

/**
 * Готовый CSS темы для подключения без granum — `@feugene/granularity/themes/<id>.css`.
 *
 * Собирает его тот же `emitCss` granum, что и сборку приложения, поэтому
 * селекторы режимов, формулы на границе `[data-theme]` и фолбэки здесь те же,
 * что у приложения на granum. В файл идут два слоя в порядке granum — `tokens`
 * (формулы и примитивы), затем `themes` (режимы, токены компонентов ядра,
 * `@supports`-фолбэки): равная специфичность решается порядком, и фолбэк обязан
 * идти после формулы, которую он заменяет. Токенов спутников здесь нет — их знает
 * только сборка приложения со всеми манифестами.
 *
 * Ядро подаётся манифестом из исходников, а не из `dist`: в CSS темы участвуют
 * только папки `themesDir` компонентов, а тестам ядра незачем ждать сборки.
 *
 *   node scripts/theme-css.mjs --dist            записать `dist/themes/<id>.css` для каждой темы каталога
 *   node scripts/theme-css.mjs --stdout <id>     напечатать CSS темы
 */

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const COMPONENTS = join(ROOT, 'src/components')
const PROVIDER_ID = '@feugene/granularity'
const TOKENS_PROVIDER_ID = '@feugene/granularity-tokens'

const BANNER = [
  '/*',
  ' * Тема `{id}` для `@feugene/granularity` без granum: примитивы, режимы, токены',
  ' * компонентов ядра и фолбэки — в порядке слоёв granum. Режим включается парой',
  ' * `data-theme="{id}-<режим>"` на корне или на острове; без атрибута действует',
  ' * режим по умолчанию.',
  ' */',
].join('\n')

/** Компоненты с папкой `themes/`; `config.ts` каждого обязан её объявить, иначе сборка granum её не увидит. */
function themedComponents() {
  return readdirSync(COMPONENTS, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && existsSync(join(COMPONENTS, entry.name, 'themes')))
    .map((entry) => {
      const config = readFileSync(join(COMPONENTS, entry.name, 'config.ts'), 'utf8')
      if (!config.includes('themesDir: \'./themes\''))
        throw new Error(`${entry.name}: есть папка themes/, но config.ts не объявляет themesDir: './themes'`)

      return entry.name
    })
    .sort()
}

function sourceManifest() {
  const components = Object.fromEntries(themedComponents().map(name => [name, {
    entry: `components/${name}/index.js`,
    files: [],
    css: [],
    group: null,
    dependencies: [],
    classes: [],
    safelist: [],
    tokens: {
      themes: readComponentThemesDir(PROVIDER_ID, name, join(COMPONENTS, name, 'themes')),
      consumes: [],
      requires: [],
      dynamic: [],
    },
    hash: '',
  }]))

  return {
    manifest: {
      granum: 3,
      contractVersion: 2,
      id: PROVIDER_ID,
      version: '0.0.0',
      generatedBy: 'scripts/theme-css.mjs',
      hash: '',
      dependencies: [TOKENS_PROVIDER_ID],
      theme: { declares: [] },
      engine: { dialect: null, vocabulary: null, name: 'none', module: null },
      components,
      warnings: [],
    },
    baseUrl: pathToFileURL(join(ROOT, 'src/')).href,
  }
}

export async function themeCss(id) {
  const app = await prepareApp({
    engine: windEngine(),
    providers: [sourceManifest()],
    components: 'all',
    theme: id,
    appSources: { dirs: [] },
  }, ROOT)
  const { layers } = await emitCss(app)

  return `${BANNER.replaceAll('{id}', id)}\n${layers.tokens.trim()}\n\n${layers.themes.trim()}\n`
}

function catalogThemes() {
  const manifest = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.resolve(`${TOKENS_PROVIDER_ID}/granum.manifest.json`))), 'granum.manifest.json'), 'utf8'))

  return Object.keys(manifest.theme.catalog ?? {}).sort()
}

const args = process.argv.slice(2)

if (args[0] === '--stdout') {
  process.stdout.write(await themeCss(args[1]))
}
else if (args[0] === '--dist') {
  const ids = catalogThemes()
  for (const id of ids) {
    const file = resolve(ROOT, 'dist/themes', `${id}.css`)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, await themeCss(id))
  }
  console.log(`[theme-css] dist/themes: ${ids.join(', ')}`)
}
