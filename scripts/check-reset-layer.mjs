import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

/**
 * Сброс браузерных стилей (`@unocss/reset`) подключается только в слой:
 * `@import '@unocss/reset/tailwind-compat.css' layer(reset);` из CSS-файла, который
 * приложение импортирует первым.
 *
 * Нелейерный CSS по правилам каскада бьёт любой `@layer` независимо от
 * специфичности. Сброс вне слоя перебивал утилиты granum: `button { color: inherit }`
 * дал красной кнопке контраст 2.89:1, `table { border-collapse: collapse }` схлопнул
 * таблицы демо (`apps/showcase/src/styles/reset.css`). Из JS слой не задать, поэтому
 * `import '@unocss/reset/…'` в коде и в примерах доки — нарушение.
 *
 * Сверяются доки пакетов и корня, README и исходники приложений: примеры доки
 * копируют в чужие проекты, а песочницы — в доку.
 */
const repoDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const CODE = /\.(?:[cm]?[jt]s|vue|css)$/
const SKIP = new Set(['node_modules', 'dist', '.output', 'coverage', 'test-results'])

function walk(dir, accept, found = []) {
  if (!existsSync(dir))
    return found
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name))
      continue
    const path = join(dir, name)
    if (statSync(path).isDirectory())
      walk(path, accept, found)
    else if (accept(path))
      found.push(path)
  }
  return found
}

const dirsOf = group => existsSync(join(repoDir, group))
  ? readdirSync(join(repoDir, group)).map(name => join(repoDir, group, name)).filter(path => statSync(path).isDirectory())
  : []

const files = [
  ...walk(join(repoDir, 'docs'), path => path.endsWith('.md')),
  ...[join(repoDir, 'README.md')],
  ...dirsOf('packages').flatMap(dir => [
    ...walk(join(dir, 'docs'), path => path.endsWith('.md')),
    join(dir, 'README.md'),
  ]),
  ...dirsOf('apps').flatMap(dir => [
    ...walk(join(dir, 'src'), path => CODE.test(path)),
    join(dir, 'README.md'),
  ]),
].filter(path => existsSync(path))

const JS_IMPORT = /(?<!@)\bimport\s*\(?\s*['"]@unocss\/reset\/[^'"]+['"]/g
const CSS_IMPORT = /@import\s+(?:url\(\s*)?['"]@unocss\/reset\/[^'"]+['"][^;]*;/g

const lineOf = (text, index) => text.slice(0, index).split('\n').length

const problems = []
for (const path of files) {
  const text = readFileSync(path, 'utf8')
  const where = relative(repoDir, path)
  for (const match of text.matchAll(JS_IMPORT))
    problems.push(`${where}:${lineOf(text, match.index)} — импорт из JS, вне слоя`)
  for (const match of text.matchAll(CSS_IMPORT)) {
    if (!/\blayer\(/.test(match[0]))
      problems.push(`${where}:${lineOf(text, match.index)} — @import без layer(…)`)
  }
}

if (problems.length > 0) {
  const list = problems.map(line => `  ${line}`).join('\n')

  console.error(
    `[reset-layer] сброс браузерных стилей вне слоя — ${problems.length}:\n${list}\n`
    + 'Починка: CSS-файл с `@import \'@unocss/reset/tailwind-compat.css\' layer(reset);`, импортированный первым.',
  )
  process.exitCode = 1
}
else {
  console.log(`[reset-layer] OK — сброс подключается в слой; проверено файлов: ${files.length}.`)
}
