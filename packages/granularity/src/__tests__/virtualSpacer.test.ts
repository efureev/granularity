import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * Гейт контракта распорок виртуального списка.
 *
 * Дефект, ради которого написан: у каждого потребителя `useVirtualList` были
 * свои имена — `data-gr-tree-virtual` с `--gr-tree-virtual-before`,
 * `data-gr-select-virtual` с `--gr-select-virtual-before` и так далее, — причём
 * имя переменной писалось руками дважды: в CSS и в стиле контейнера. Разойдись
 * они на одну букву — распорка не создаётся, список остаётся без прокрутки, и
 * увидеть это можно только глазами в браузере: разметка валидна, тесты зелёные.
 *
 * Три блока из четырёх к тому же не имели `display: block` и работали лишь
 * потому, что их контейнеры — флексы. Убери кто-нибудь флекс — псевдоэлемент
 * станет строчным, а строчная коробка игнорирует `height`.
 *
 * **Контрактов два, и это не поблажка.** Списочные компоненты держат распорки
 * псевдоэлементами контейнера, но в таблице так нельзя физически: `<tbody>`
 * игнорирует `padding`, а псевдоэлемент внутри группы строк не образует строку
 * с управляемой высотой. Там распорки — служебные `<tr>`. Гейт требует ровно
 * один из двух контрактов: компонент, не подходящий ни под один, его роняет.
 *
 * **Почему правило продублировано, а не лежит в одном файле.** Единственный
 * глобальный стиль пакета — `styles/base.css`, и он необязателен: его шапка
 * прямо разрешает потребителю подключить `tokens.css` с темой и пропустить
 * base. Правило, уехавшее туда, молча ломало бы прокрутку у всех, кто так и
 * сделал. Scoped-стиль SFC, наоборот, уезжает в чанк своего компонента — то
 * есть доставляется ровно тем, кто компонент выбрал. Синхронность копий держит
 * этот гейт (у `base.css` с `preflight.css` то же дублирование, но там она
 * держится припиской в комментарии).
 */

const componentsDir = resolve(process.cwd(), 'src/components')

/** Канонический блок распорок. Источник истины — здесь. */
const CANONICAL_CSS = `[data-gr-virtual]::before,
[data-gr-virtual]::after {
    content: '';
    display: block;
    flex: none;
}

[data-gr-virtual]::before {
    height: var(--gr-virtual-before, 0px);
}

[data-gr-virtual]::after {
    height: var(--gr-virtual-after, 0px);
}`

/** Имена, разведённые по компонентам до выноса: вернуться они не должны. */
const LEGACY_NAMES = /data-gr-[a-z-]+-virtual|--gr-(?:tree|select|autocomplete|command)-virtual-/

/**
 * Потребитель — компонент, а не файл: вызов примитива у крупных компонентов
 * уезжает в собственный композабл (`GrSelect/composables/useSelectVirtualization.ts`),
 * а разметка и распорки остаются в его `.vue`. Гейт поэтому смотрит на всю
 * директорию, но контракт спрашивает с разметки.
 */
type VirtualConsumer = {
  name: string
  /** Только SFC: там живут распорки и канонический блок стилей. */
  markup: string
  /** Вся директория: вызов примитива и `spacerStyle` могут быть в композабле. */
  sources: string
}

function readComponentSources(dir: string): { markup: string, sources: string } {
  let markup = ''
  let sources = ''
  const stack = [resolve(componentsDir, dir)]

  while (stack.length) {
    const current = stack.pop()!

    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (entry.name === '__tests__') continue

      const path = resolve(current, entry.name)
      if (entry.isDirectory()) {
        stack.push(path)
        continue
      }

      if (!/\.(?:vue|ts)$/.test(entry.name)) continue

      const source = readFileSync(path, 'utf-8')
      sources += source
      if (entry.name.endsWith('.vue')) markup += source
    }
  }

  return { markup, sources }
}

const consumers: VirtualConsumer[] = readdirSync(componentsDir)
  .filter(dir => dir.startsWith('Gr'))
  .map(dir => ({ name: dir, ...readComponentSources(dir) }))
  .filter(consumer => consumer.sources.includes('useVirtualList('))

/**
 * Разметка строк-распорок целиком.
 *
 * Границы ищем сканированием, а не регэкспом по `<tr[^>]*`: в атрибутах строки
 * живёт `v-if="… > 0"`, и класс «любой символ, кроме `>`» обрывается на нём.
 */
function spacerRows(source: string): string[] {
  const rows: string[] = []
  let at = source.indexOf('data-gr-datatable-spacer')

  while (at >= 0) {
    const start = source.lastIndexOf('<tr', at)
    const end = source.indexOf('</tr>', at)
    if (start >= 0 && end >= 0) rows.push(source.slice(start, end))

    at = source.indexOf('data-gr-datatable-spacer', at + 1)
  }

  return rows
}

/** Каким контрактом распорок пользуется компонент. */
function spacerContract(source: string): 'pseudo' | 'rows' | 'none' {
  if (source.includes('data-gr-virtual')) return 'pseudo'
  if (source.includes('data-gr-datatable-spacer')) return 'rows'
  return 'none'
}

const pseudoConsumers = consumers.filter(consumer => spacerContract(consumer.markup) === 'pseudo')
const rowConsumers = consumers.filter(consumer => spacerContract(consumer.markup) === 'rows')

describe('контракт распорок виртуального списка', () => {
  it('потребители примитива вообще есть — иначе гейт молчал бы впустую', () => {
    expect(consumers.map(consumer => consumer.name).sort()).toEqual([
      'GrAutocomplete',
      'GrCommandPalette',
      'GrDataTable',
      'GrList',
      'GrSelect',
      'GrTree',
    ])
  })

  it.each(consumers.map(consumer => [consumer.name, consumer] as const))(
    '%s объявляет один из двух контрактов распорок',
    (_name, consumer) => {
      expect(spacerContract(consumer.markup)).not.toBe('none')
    },
  )

  it.each(pseudoConsumers.map(consumer => [consumer.name, consumer] as const))(
    '%s (псевдоэлементы) несёт канонический блок',
    (_name, consumer) => {
      expect(consumer.markup).toContain(CANONICAL_CSS)
    },
  )

  it.each(pseudoConsumers.map(consumer => [consumer.name, consumer] as const))(
    '%s (псевдоэлементы) не пишет имена переменных руками: их отдаёт `spacerStyle`',
    (_name, consumer) => {
      expect(consumer.sources).toContain('spacerStyle')
      expect(consumer.sources).not.toMatch(/'--gr-virtual-(?:before|after)'/)
    },
  )

  it.each(rowConsumers.map(consumer => [consumer.name, consumer] as const))(
    '%s (строки-распорки) скрывает их от AT и растягивает на все колонки',
    (_name, consumer) => {
      // Распорка — не строка данных: посчитанная диктором, она сместила бы
      // нумерацию, а `colspan` меньше числа колонок сломал бы раскладку.
      const spacers = spacerRows(consumer.markup)
      expect(spacers).toHaveLength(2)

      for (const spacer of spacers) {
        expect(spacer).toContain('aria-hidden="true"')
        expect(spacer).toContain(':colspan="totalColumns"')
      }
    },
  )

  it.each(rowConsumers.map(consumer => [consumer.name, consumer] as const))(
    '%s (строки-распорки) фиксирует раскладку таблицы',
    (_name, consumer) => {
      // Без этого ширины колонок считались бы по отрисованному окну и прыгали
      // бы на каждой прокрутке.
      expect(consumer.markup).toContain('fixedLayout')
    },
  )

  it.each(consumers.map(consumer => [consumer.name, consumer] as const))(
    '%s не тащит разведённые по компонентам имена',
    (_name, consumer) => {
      const legacy = consumer.sources.match(LEGACY_NAMES)
      expect(legacy?.[0] ?? null).toBeNull()
    },
  )
})
