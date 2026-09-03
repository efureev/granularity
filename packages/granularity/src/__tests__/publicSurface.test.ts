import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * Гейт публичной поверхности компонентных барелей.
 *
 * Дефект, ради которого написан: из 68 барелей наружу уезжало 832 имени, и почти
 * четверть — внутренности одного компонента (геометрия сплиттера, парсинг hex,
 * сортировка ячеек, inject-ключи, рантайм-кортежи вариантов). На 1.0 публичный
 * API замораживается, и всё это заморозилось бы вместе с ним — включая то, чего
 * потребитель никогда не звал.
 *
 * Правило проверяется на **значениях**, а не на типах: тип обёртке потребителя
 * нужен, а функция — почти никогда. `export type *` поэтому разрешён,
 * `export *` — нет: он тянет наружу чужой модуль целиком и делает поверхность
 * невидимой из самой барели.
 *
 * Список исключений закрытый: новое имя в него не попадает само собой, а
 * добавляется руками вместе с причиной — и причина обязана быть «у этого есть
 * документированный потребитель», а не «пусть будет».
 */

const componentsDir = resolve(process.cwd(), 'src/components')

/** Значения, которым место в публичной поверхности, хотя они не SFC/config/safelist. */
const ALLOWED_VALUES: Record<string, string> = {
  'GrAvatar/initialsFrom': 'документирован в components/GrAvatar.md: инициалы считает потребитель',
  'GrBadgeWrap/formatBadgeValue': 'документирован: формат «+N» переиспользуют вне компонента',
  'GrBreadcrumbs/resolveBreadcrumbsFit': 'документирована арифметика схлопывания по ширине',
  'GrBreadcrumbs/resolveBreadcrumbsLayout': 'то же: раскладка считается снаружи в SSR',
  'GrDelta/deltaDirection': 'документировано: направление величины считают там, где стрелки дельты нет',
  'GrDelta/deltaTone': 'документирован: тот же тон нужен `GrStatistic` и `GrBadge`, где разметка дельты не подходит',
  'GrTree/grTreeViewVars': 'документирован в components/GrTree.md: готовые виды — набор значений тех же токенов, что задаёт `size`, и потребитель раскладывает его в `style`',
  'GrDialogService/dialogService': 'императивный сервис — сам по себе публичный API',
  'GrDialogService/granularityDialogServicePlugin': 'ставится в app.use()',
  'GrDialogService/teardownDialogService': 'нужен в тестах потребителя и при hot-reload',
  'GrFilePreview/fileKindOf': 'документирован: по виду файла потребитель решает, какие отдать в просмотрщик',
  'GrFilePreview/isPreviewableKind': 'то же: компонент вид не открывает, а классификация нужна снаружи',
  'GrFileUpload/GrUploadAbortError': 'приходит в catch: без класса не написать instanceof',
  'GrFileUpload/GrUploadHttpError': 'то же',
  'GrFileUpload/FileValidationError': 'прилетает эмитом `error`; тот же класс, что в ./fileValidation',
  'GrForm/createGrFormMessageResolver': 'документирован в form-controls.md',
  'GrForm/getByPath': 'адресация модели: тот, кто строит правила снаружи, обязан читать модель так же, как форма',
  'GrForm/isEmpty': 'признак пустоты: своя копия разошлась бы с формой молча — правило `min` перестало бы срабатывать',
  'GrForm/runFieldRules': 'движок правил тестируется и переиспользуется отдельно',
  'GrForm/setByPath': 'парный писатель к `getByPath`; создаёт объекты, поэтому массивы потребитель готовит сам',
  'GrKbd/GR_KBD_TOKENS': 'витрина строит по нему таблицу сочетаний',
  'GrKbd/findKbdToken': 'то же',
  'GrResponseErrorBanner/coreResponseErrorParsers': 'документированная сборка своего набора парсеров',
  'GrResponseErrorBanner/createResponseErrorClassifier': 'то же',
  'GrResponseErrorBanner/extendDefaultParsers': 'то же',
  'GrResponseErrorBanner/normalizeError': 'то же',
  'GrSplitter/sizeFromPointer': 'документирована геометрия жеста',
  'GrStatistic/formatStatisticValue': 'документирован формат числа',
}

type Export = { name: string, kind: 'value' | 'type', from: string }

/** Комментарии убираются до разбора: внутри `export { … }` они встречаются. */
function stripComments(source: string): string {
  return source.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')
}

function barrelExports(dir: string): Export[] {
  const source = stripComments(readFileSync(resolve(componentsDir, dir, 'index.ts'), 'utf-8'))
  const result: Export[] = []

  for (const match of source.matchAll(/export\s+(type\s+)?\{([^}]*)\}\s+from\s+'([^']+)'/g)) {
    const blockIsType = Boolean(match[1])
    for (const raw of match[2].split(',')) {
      const entry = raw.trim()
      if (!entry)
        continue
      const isType = blockIsType || /^type\s/.test(entry)
      const cleaned = entry.replace(/^type\s+/, '')
      const alias = cleaned.match(/\bas\s+([\w$]+)/)
      result.push({ name: alias ? alias[1] : cleaned, kind: isType ? 'type' : 'value', from: match[3] })
    }
  }

  return result
}

function componentDirs(): string[] {
  return readdirSync(componentsDir).filter((dir) => {
    if (!dir.startsWith('Gr'))
      return false
    try {
      readFileSync(resolve(componentsDir, dir, 'index.ts'))
      return true
    }
    catch {
      return false
    }
  })
}

describe('публичная поверхность компонентных барелей', () => {
  const dirs = componentDirs()

  it('барелей найдено столько же, сколько компонентов', () => {
    // Страховка от немого гейта: сломанный обход дал бы пустой список и зелень.
    expect(dirs.length).toBeGreaterThan(60)
  })

  it('нет `export *`: транзитивный реэкспорт прячет поверхность от самой барели', () => {
    const offenders = dirs.flatMap((dir) => {
      const source = stripComments(readFileSync(resolve(componentsDir, dir, 'index.ts'), 'utf-8'))
      // `export type *` разрешён: типы наружу нужны, и они не растят рантайм.
      return [...source.matchAll(/export\s+\*\s+from\s+'([^']+)'/g)].map(m => `${dir} → ${m[1]}`)
    })

    expect(offenders, offenders.join('\n')).toEqual([])
  })

  it('значения наружу — только компонент, config, safelist, композабл или исключение', () => {
    const offenders: string[] = []

    for (const dir of dirs) {
      for (const item of barrelExports(dir)) {
        if (item.kind === 'type')
          continue
        // SFC, `grXConfig` и `grXSafelist` — предписанный контракт барели
        // (.claude/rules/library-conventions.md, «Анатомия компонента»).
        if (/\.vue$/.test(item.from) || /\/config$/.test(item.from) || /\/safelist$/.test(item.from))
          continue
        // Композаблы — поверхность интеграции: через них потребитель встраивает
        // свой контрол в провайдер, поле и форму.
        if (/^use[A-Z]/.test(item.name))
          continue
        if (`${dir}/${item.name}` in ALLOWED_VALUES)
          continue

        offenders.push(`${dir}/${item.name} (из ${item.from})`)
      }
    }

    expect(
      offenders,
      `Внутренности компонента не уезжают в публичный API. Либо оставьте имя экспортом модуля\n`
      + `(соседние файлы компонента импортируют его по прямому пути), либо добавьте в\n`
      + `ALLOWED_VALUES вместе с документированным потребителем:\n${offenders.join('\n')}`,
    ).toEqual([])
  })

  it('список исключений не протух: каждое имя действительно экспортируется', () => {
    const actual = new Set(
      dirs.flatMap(dir => barrelExports(dir).filter(e => e.kind === 'value').map(e => `${dir}/${e.name}`)),
    )
    const stale = Object.keys(ALLOWED_VALUES).filter(key => !actual.has(key))

    expect(stale, stale.join('\n')).toEqual([])
  })
})
