import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import semver from 'semver'

/**
 * Диапазон на workspace-пакет обязан покрывать его текущую версию.
 *
 * Иначе yarn перестаёт линковать пакет из репозитория и идёт за ним в реестр —
 * а нужной версии там ещё нет, потому что её как раз собираются выпустить.
 * Локально это не всплывает: `node_modules` уже разложены. В CI ставится с нуля,
 * и `--frozen-lockfile` не спасает — записи о workspace-пакете в `yarn.lock`
 * нет вовсе.
 *
 * Ловушка ровно в нулевом мажоре: `^0.4.1` это `>=0.4.1 <0.5.0`, поэтому любой
 * минорный бамп внутри монорепо обязан прийти вместе с подъёмом диапазонов у
 * всех, кто на него ссылается. За одну сессию на это наступили дважды: сначала
 * с `granularity-test-kit`, потом с `unplugin-granularity`, и оба раза ценой
 * красного CI и перевыпуска тега.
 *
 * `peerDependencies` не проверяются: они намеренно широкие (`>=0.4.0 <1.0.0`) —
 * это контракт для потребителя, а не связь внутри репозитория.
 */
const repoDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function manifestsIn(group) {
  const dir = join(repoDir, group)
  if (!existsSync(dir)) return []

  return readdirSync(dir)
    .map(name => join(dir, name, 'package.json'))
    .filter(path => existsSync(path))
}

const manifests = ['packages', 'apps'].flatMap(manifestsIn)

/** Версии пакетов самого репозитория — только они и проверяются. */
const versions = new Map()

for (const path of manifests) {
  const data = JSON.parse(readFileSync(path, 'utf8'))
  if (data.name && data.version) versions.set(data.name, data.version)
}

const mismatches = []

for (const path of manifests) {
  const data = JSON.parse(readFileSync(path, 'utf8'))

  for (const field of ['dependencies', 'devDependencies']) {
    for (const [dependency, range] of Object.entries(data[field] ?? {})) {
      const version = versions.get(dependency)
      if (!version || semver.satisfies(version, range)) continue

      mismatches.push(`${data.name} → ${dependency}@${range}, а в репозитории ${version} (${field})`)
    }
  }
}

if (mismatches.length > 0) {
  const list = mismatches.map(line => `  ${line}`).join('\n')

  console.error(
    `[workspace-ranges] ${mismatches.length} диапазон не покрывает свою версию:\n${list}\n`
    + 'Yarn пойдёт за пакетом в реестр вместо воркспейса — в CI это падение установки.',
  )
  process.exitCode = 1
}
else {
  console.log(`[workspace-ranges] OK — все ссылки на ${versions.size} пакетов репозитория покрывают их версии.`)
}
