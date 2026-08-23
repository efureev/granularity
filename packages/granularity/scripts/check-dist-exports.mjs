import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

/**
 * Каждый объявленный subpath обязан вести к существующему файлу.
 *
 * Проверка по `dist`, а не по исходникам: `exports` — единственный контракт,
 * который видит потребитель, и промах в нём не даёт ни ошибки сборки пакета,
 * ни жалобы типов. Всплывает он у потребителя, на его сборке, словами
 * `ERR_PACKAGE_PATH_NOT_EXPORTED` — то есть там, где чинить дороже всего.
 *
 * Мы это уже проходили: README годами обещал
 * `@feugene/granularity/components/<Name>/styles.css`, которого не было в
 * `exports` вовсе, а `@feugene/granularity/styles.css` исчез при переходе с
 * `Ds*` на `Gr*` — и заметил это только потребитель.
 *
 * Обратную сторону (файл есть, а в `exports` его нет) проверять нельзя: в
 * `dist` полно внутренних чанков, которым наружу и не надо.
 */
const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'))

/** Все пути значения записи: строка, либо объект с условиями. */
function targetsOf(value) {
  if (typeof value === 'string')
    return [value]
  if (!value || typeof value !== 'object')
    return []

  return Object.values(value).flatMap(targetsOf)
}

/**
 * Звёздочка в ключе — семейство путей. Существование проверяется хотя бы одним
 * совпадением: `./styles/*` без единого файла означает мёртвый subpath, а
 * требовать файл под каждую подстановку бессмысленно.
 */
function patternMatches(target) {
  const [head, tail] = target.split('*')
  const dir = join(packageDir, head.endsWith('/') ? head : dirname(head))
  if (!existsSync(dir))
    return false

  const prefix = head.endsWith('/') ? '' : head.slice(head.lastIndexOf('/') + 1)

  return readdirSync(dir).some(name => name.startsWith(prefix) && name.endsWith(tail ?? ''))
}

const missing = []

for (const [key, value] of Object.entries(manifest.exports ?? {})) {
  for (const target of targetsOf(value)) {
    const ok = target.includes('*')
      ? patternMatches(target)
      : existsSync(join(packageDir, target))

    if (!ok)
      missing.push(`${key} → ${target}`)
  }
}

if (missing.length > 0) {
  const list = missing.map(line => `  ${line}`).join('\n')

  console.error(
    `[dist-exports] ${missing.length} subpath ведёт в никуда:\n${list}\n`
    + 'У потребителя это `ERR_PACKAGE_PATH_NOT_EXPORTED` на его сборке.',
  )
  process.exitCode = 1
}
else {
  console.log(`[dist-exports] OK — все ${Object.keys(manifest.exports ?? {}).length} subpath ведут к существующим файлам.`)
}
