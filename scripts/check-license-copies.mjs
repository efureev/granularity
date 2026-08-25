import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

/**
 * У публикуемого пакета обязан лежать свой `LICENSE`, побайтово равный корневому.
 *
 * `npm` кладёт `LICENSE` в тарбол сам, независимо от `files` — но только если файл
 * есть в директории пакета. Шесть пакетов из одиннадцати объявляли
 * `"license": "SEE LICENSE IN LICENSE"` и файла не прикладывали: ссылка вела в
 * пустоту, и комплаенс-сканер потребителя помечал такой пакет как лицензию без
 * текста. Это отказ на формальном основании, до всякого разговора о содержании.
 *
 * Копия, а не симлинк: `npm pack` разыменовывает по-разному на разных платформах,
 * а git на Windows отдаёт симлинк текстовым файлом с путём внутри.
 *
 * Отсюда же и требование побайтового равенства: одиннадцать копий разойдутся
 * молча, и разойдутся именно тогда, когда текст лицензии будут править.
 */
const repoDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const digest = path => createHash('sha256').update(readFileSync(path)).digest('hex')

const rootLicense = join(repoDir, 'LICENSE')
if (!existsSync(rootLicense)) {
  console.error('[license-copies] в корне репозитория нет LICENSE — сверять не с чем.')
  process.exit(1)
}

const expected = digest(rootLicense)
const problems = []
let checked = 0

for (const name of readdirSync(join(repoDir, 'packages')).sort()) {
  const packageDir = join(repoDir, 'packages', name)
  const manifestPath = join(packageDir, 'package.json')
  if (!existsSync(manifestPath)) continue

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  if (manifest.private) continue

  checked += 1
  const licensePath = join(packageDir, 'LICENSE')

  if (!existsSync(licensePath)) {
    problems.push(`${manifest.name} — нет LICENSE, хотя манифест ссылается на него`)
    continue
  }

  if (digest(licensePath) !== expected)
    problems.push(`${manifest.name} — LICENSE разошёлся с корневым`)
}

if (problems.length > 0) {
  const list = problems.map(line => `  ${line}`).join('\n')

  console.error(
    `[license-copies] ${problems.length} пакет(ов) с неверной лицензией:\n${list}\n`
    + 'Починка: cp LICENSE packages/<пакет>/LICENSE',
  )
  process.exitCode = 1
}
else {
  console.log(`[license-copies] OK — у всех ${checked} публикуемых пакетов LICENSE совпадает с корневым.`)
}
