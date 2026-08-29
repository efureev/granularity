import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Изоляция гранулярного импорта: что приезжает потребителю, взявшему один
 * компонент.
 *
 * Subpath на компонент — обещание пакета, и до сих пор его не проверял никто.
 * `componentDependencies.test.ts` смотрит исходники и следит за обратным: чтобы
 * `config.dependencies` не отставал от импортов. Ребро, которое появляется
 * только на сборке — общий чанк `dist/chunks/*`, куда рядом с нужным уехало
 * чужое, — в исходниках не видно вовсе.
 *
 * Чужой `.ts` утечкой не считается: контекст `GrConfigProvider`, шкалы из
 * `components/shared/`, композаблы — общая среда пакета, она приезжает по
 * определению (`docs/packaging.md`). Утечка — чужая **разметка**: SFC тянет за
 * собой вёрстку, свои классы и свой safelist, то есть ровно тот вес, ради
 * отсутствия которого подпуть и берут.
 */

/** Компонент, чьи `.vue` собраны в этот чанк. Имя берётся из карты: в минифицированном коде его нет. */
export function markupOwners(mapSource) {
  let sources

  try {
    sources = JSON.parse(mapSource).sources ?? []
  }
  catch {
    return []
  }

  return [...new Set(sources
    .map(source => /src[\\/]components[\\/](Gr[A-Za-z0-9]+)[\\/][^\\/]*\.vue$/.exec(source)?.[1])
    .filter(Boolean))]
}

/**
 * Переходник — файл, в котором нет ничего, кроме импортов и реэкспортов.
 *
 * Карту такому файлу сборка не выдаёт: трансформировать нечего. Отличать его
 * обязательно — иначе гейт не сможет сказать, чем вызвано молчание карты:
 * отсутствием кода или тем, что сборка перестала отдавать `sourcemap`.
 */
export function isReexportOnly(source) {
  const withoutComments = source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:'"])\/\/[^\n]*/g, '$1')

  return withoutComments
    .replace(/(?:^|[\s;])(?:import|export)\b(?:[^;'"]|"[^"]*"|'[^']*')*;/g, ' ')
    .trim() === ''
}

/**
 * Файл собран только из виртуальных модулей — тех, чей идентификатор сборка
 * помечает `\0` (хелпер `plugin-vue`, шимы плагинов).
 *
 * Исходника на диске у них нет, поэтому нет и карты: отображать не на что.
 * Разметки компонента в таком модуле не бывает по построению — она приходит
 * из `.vue`, а у `.vue` файл есть. Каждый модуль чанка сборка называет в
 * заголовке `//#region`, поэтому вопрос решается точно, а не по имени файла:
 * имя несёт хеш содержимого и меняется на каждой сборке.
 */
export function isVirtualOnly(source) {
  const regions = [...source.matchAll(/^\/\/#region (.*)$/gm)].map(match => match[1])

  return regions.length > 0 && regions.every(id => id.startsWith('\\0'))
}

/** Объявленные зависимости вместе с их собственными: транзитивное пакет не дублирует (SPEC §4.1 пресета). */
export function dependencyClosure(component, declaredOf, closed = new Set()) {
  for (const dependency of declaredOf(component)) {
    if (closed.has(dependency))
      continue

    closed.add(dependency)
    dependencyClosure(dependency, declaredOf, closed)
  }

  return closed
}

/**
 * Компонент, которому принадлежит подпуть.
 *
 * Части составного компонента (`./components/GrDialogHeader`) — псевдонимы на
 * entry родителя, и вес у них общий с ним. Владелец берётся из пути файла, а не
 * из имени подпути: иначе часть выглядела бы компонентом, который тянет чужую
 * разметку, хотя это разметка его же родителя.
 */
export function entryOwner(file) {
  return /dist[\\/]components[\\/](Gr[A-Za-z0-9]+)[\\/]/.exec(file)?.[1] ?? null
}

/**
 * Что приехало вместе с entry: разметка каких компонентов и какие файлы гейт
 * прочитать не смог.
 */
export function inspectEntry(files, read = path => readFileSync(path, 'utf8'), exists = existsSync) {
  const reached = new Set()
  const blind = []

  for (const file of files) {
    if (!file.endsWith('.js'))
      continue

    if (exists(`${file}.map`)) {
      for (const owner of markupOwners(read(`${file}.map`)))
        reached.add(owner)

      continue
    }

    const source = read(file)

    if (!isReexportOnly(source) && !isVirtualOnly(source))
      blind.push(file)
  }

  return { reached: [...reached].sort(), blind }
}

/** Подпути `exports`, ведущие на entry компонента. Дубли по владельцу схлопываются: у псевдонима тот же файл. */
export function componentEntries(exportsMap, packageDir) {
  const byOwner = new Map()

  for (const [name, value] of Object.entries(exportsMap)) {
    const file = typeof value === 'string' ? value : value?.import
    if (typeof file !== 'string' || !file.endsWith('.js'))
      continue

    const owner = entryOwner(file)
    if (!owner || byOwner.has(owner))
      continue

    byOwner.set(owner, { owner, name, file: resolve(packageDir, file) })
  }

  return [...byOwner.values()].sort((a, b) => a.owner.localeCompare(b.owner))
}
