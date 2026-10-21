import { readFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { emitThemeStylesheet } from '@feugene/granum/node'

/**
 * Готовый CSS темы для подключения без granum — по частям и целиком:
 *
 *   themes/<id>/root.css      всё, что от режима не зависит: примитивы, формулы, общие токены компонентов
 *   themes/<id>/<режим>.css   пара режима с фолбэками; `:root` — только у режима по умолчанию
 *   themes/<id>.css           склейка `root.css` и всех режимов каталога
 *
 * Приложение берёт `root.css` и свои режимы, его бандлер склеивает их в один
 * файл. `root.css` — первым: фолбэк режима заменяет формулу из `root.css` при
 * равной специфичности, и выигрывает тот, кто ниже. Режим самодостаточен —
 * наследование по `extends` в нём раскрыто, — поэтому файл базы ему не нужен.
 *
 * Части отдаёт `emitThemeStylesheet` granum — по тем же правилам, что сборку
 * приложения: селекторы режимов, формулы на границе `[data-theme]` и фолбэки те
 * же, что у приложения на granum. Значения компонентов ядра приходят с данными
 * темы — её разделом `components`, — поэтому провайдер нужен один: пакет токенов.
 * Токенов спутников здесь нет — их знает только сборка приложения со всеми манифестами.
 *
 *   node scripts/theme-css.mjs --dist                   записать файлы каждой темы каталога в `dist/themes/`
 *   node scripts/theme-css.mjs --stdout <id> [часть]    напечатать тему целиком или часть: `root` или имя режима
 */

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const TOKENS_PROVIDER_ID = '@feugene/granularity-tokens'

const BANNERS = {
  all: [
    'Тема `{id}` для `@feugene/granularity` без granum: примитивы, все режимы каталога,',
    'токены компонентов ядра и фолбэки. Режим включается парой `data-theme="{id}-<режим>"`',
    'на корне или на острове; без атрибута действует режим по умолчанию. По частям —',
    '`themes/{id}/root.css` и `themes/{id}/<режим>.css`.',
  ],
  root: [
    'Тема `{id}`: всё, что от режима не зависит, — примитивы, формулы, общие токены',
    'компонентов ядра. Подключается первым, за ним — файлы режимов `themes/{id}/<режим>.css`.',
  ],
  mode: [
    'Режим `{mode}` темы `{id}`: пара `data-theme="{id}-{mode}"` и фолбэки. Самодостаточен —',
    'подключается после `themes/{id}/root.css`, без других режимов.',
  ],
  defaultMode: [
    'Режим `{mode}` темы `{id}` — режим по умолчанию: `:root` и пара `data-theme="{id}-{mode}"`,',
    'фолбэки. Самодостаточен — подключается после `themes/{id}/root.css`, без других режимов.',
  ],
}

function banner(kind, values) {
  const lines = BANNERS[kind].map(line => Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), line))
  return ['/*', ...lines.map(line => ` * ${line}`), ' */'].join('\n')
}

/**
 * Части темы: `root` и по файлу на режим. Режимы — все режимы темы, явным набором:
 * без `modes.names` granum собирает только режим по умолчанию, а у готовых файлов
 * выбирающего нет — выбирает приложение, подключая нужные.
 */
export async function themeParts(id) {
  const entry = catalog()[id]
  if (!entry?.modes)
    throw new Error(`[theme-css] темы ${id} нет в каталоге ${TOKENS_PROVIDER_ID}`)
  const { parts, resolution } = await emitThemeStylesheet({ providers: [TOKENS_PROVIDER_ID], themes: [{ theme: id, modes: entry.modes }], root: ROOT })
  const defaultMode = resolution.themes.default?.defaultMode

  return {
    root: `${banner('root', { id })}\n${parts.root.trim()}\n`,
    modes: Object.fromEntries(Object.entries(parts.modes).map(([mode, css]) => [
      mode,
      `${banner(mode === defaultMode ? 'defaultMode' : 'mode', { id, mode })}\n${css.trim()}\n`,
    ])),
  }
}

/** Тема целиком — склейка тех же частей: файлы по частям и целиком не расходятся. */
function joinParts(id, { root, modes }) {
  const body = [root, ...Object.values(modes)].map(part => part.slice(part.indexOf(' */\n') + 4).trim())

  return `${banner('all', { id })}\n${body.join('\n\n')}\n`
}

export async function themeCss(id) {
  return joinParts(id, await themeParts(id))
}

function catalog() {
  const manifest = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.resolve(`${TOKENS_PROVIDER_ID}/granum.manifest.json`))), 'granum.manifest.json'), 'utf8'))

  return manifest.theme.catalog ?? {}
}

function catalogThemes() {
  return Object.keys(catalog()).sort()
}

const args = process.argv.slice(2)

if (args[0] === '--stdout') {
  const [, id, part] = args
  if (!part) {
    process.stdout.write(await themeCss(id))
  }
  else {
    const parts = await themeParts(id)
    const css = part === 'root' ? parts.root : parts.modes[part]
    if (css === undefined)
      throw new Error(`[theme-css] у темы ${id} нет части ${part}: root, ${Object.keys(parts.modes).join(', ')}`)
    process.stdout.write(css)
  }
}
else if (args[0] === '--dist') {
  const ids = catalogThemes()
  for (const id of ids) {
    const parts = await themeParts(id)
    const files = { [`${id}.css`]: joinParts(id, parts), [`${id}/root.css`]: parts.root }
    for (const [mode, css] of Object.entries(parts.modes))
      files[`${id}/${mode}.css`] = css
    for (const [name, css] of Object.entries(files)) {
      const file = resolve(ROOT, 'dist/themes', name)
      await mkdir(dirname(file), { recursive: true })
      await writeFile(file, css)
    }
  }
  console.log(`[theme-css] dist/themes: ${ids.map(id => `${id}.css, ${id}/`).join('; ')}`)
}
