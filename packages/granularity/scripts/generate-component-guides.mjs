import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { parseComponentGuide } from './componentGuides.mjs'
import { componentEntries } from './webTypes.mjs'

/**
 * `dist/component-guides.json` — руководства по выбору компонента для
 * потребителей вне репозитория (формат и отбор секций — `componentGuides.mjs`).
 *
 * Страница без абзаца назначения или без «Когда брать» роняет сборку: такое
 * руководство отдало бы потребителю пустоту под видом ответа.
 */

const pkgDir = fileURLToPath(new URL('..', import.meta.url))
const docsDir = resolve(pkgDir, 'docs/components')
const outputPath = resolve(pkgDir, 'dist/component-guides.json')

const pkg = JSON.parse(readFileSync(resolve(pkgDir, 'package.json'), 'utf8'))
const exported = new Set(componentEntries(pkg.exports).map(entry => entry.name))
const guides = {}
const problems = []

for (const file of readdirSync(docsDir).filter(name => name.endsWith('.md')).sort()) {
  const name = file.slice(0, -'.md'.length)
  const guide = parseComponentGuide(readFileSync(resolve(docsDir, file), 'utf8'))

  if (!exported.has(name))
    problems.push(`${file}: компонента ${name} нет в exports`)
  else if (!guide.summary || !guide.when)
    problems.push(`${file}: нет абзаца назначения или секции «Когда брать»`)
  else
    guides[name] = guide
}

if (problems.length) {
  console.error(`[component-guides] ${problems.length} страниц(ы) не дают руководства:\n  ${problems.join('\n  ')}`)
  process.exit(1)
}

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, `${JSON.stringify({ name: pkg.name, version: pkg.version, guides }, null, 2)}\n`)

console.log(`component-guides.json: ${Object.keys(guides).length} руководств → ${outputPath}`)
