#!/usr/bin/env node
/**
 * Копия темы для granularity — `gr-theme-copy <источник> <id>`; в монорепо —
 * `yarn workspace @feugene/granularity-tokens theme:copy <источник> <id>`.
 *
 * Обёртка над `copyTheme` granum (D-13): независимый исходник темы со
 * значениями источника по парам, раскрытыми один раз. Сверху — то, что знает
 * только дизайн-система: фолбэки `@supports not (color-mix)` в копию не идут.
 * Их считает `defineTheme` по формулам производных из значений темы, и
 * скопированные устарели бы на первой правке цвета.
 *
 * Источник — id темы каталога (`slate`) или путь к исходнику темы. Копия ложится
 * в `themes/<id>/` текущего каталога, если не задана `--dest`; версия —
 * `--theme-version`, иначе `0.1.0`. В каталоге пакета `theme.lock.json` запишет
 * следующий `generate`.
 *
 *   node scripts/theme-copy.mjs slate blueprint --title "Чертёж"
 *   node scripts/theme-copy.mjs ./my-theme brand --dest ../app/src/themes/brand --theme-version 1.0.0
 */
import { existsSync, readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { copyTheme } from '@feugene/granum/node'

const pkgDir = fileURLToPath(new URL('..', import.meta.url))
const PROVIDER_ID = '@feugene/granularity-tokens'
const IGNORE = ['notes.json', 'theme.lock.json']

function option(args, name) {
  const index = args.indexOf(name)
  return index === -1 ? undefined : args[index + 1]
}

/** Фолбэки режимов копии — посчитанные значения: снимаются, их пересчитает сборка темы. */
export function stripComputedFallbacks(dir) {
  const file = join(dir, 'theme.json')
  const theme = JSON.parse(readFileSync(file, 'utf8'))
  let stripped = 0
  for (const mode of Object.values(theme.modes ?? {})) {
    if (mode.fallbacks !== undefined) {
      delete mode.fallbacks
      stripped++
    }
  }
  writeFileSync(file, `${JSON.stringify(theme, null, 2)}\n`)
  return stripped
}

export function copyGranularityTheme({ source, id, dest, title, version, cwd = process.cwd() }) {
  const sourcePath = resolve(cwd, source)
  const result = copyTheme({
    source: existsSync(join(sourcePath, 'theme.json')) ? sourcePath : source,
    ignore: IGNORE,
    dest: resolve(cwd, dest ?? join('themes', id)),
    id,
    ...(title !== undefined ? { title } : {}),
    ...(version !== undefined ? { version } : {}),
    config: { providers: [PROVIDER_ID] },
    root: pkgDir,
  })
  return { ...result, strippedFallbacks: stripComputedFallbacks(result.dir) }
}

// Бинарь пакета запускается через симлинк `node_modules/.bin`: сравниваются настоящие пути.
if (process.argv[1] !== undefined && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  const [source, id] = args.filter((arg, index) => !arg.startsWith('--') && !args[index - 1]?.startsWith('--'))
  if (!source || !id) {
    console.error('usage: theme:copy <источник> <id> [--title <название>] [--theme-version <версия>] [--dest <папка>]')
    process.exit(2)
  }
  const result = copyGranularityTheme({
    source,
    id,
    dest: option(args, '--dest'),
    title: option(args, '--title'),
    version: option(args, '--theme-version'),
  })
  console.log(`[theme:copy] ${source} → ${result.dir}: ${result.files.length} файл(ов), фолбэков снято в ${result.strippedFallbacks} режиме(ах)`)
}
