import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import GrAutocomplete from '../components/GrAutocomplete/GrAutocomplete.vue'
import GrInput from '../components/GrInput/GrInput.vue'
import GrInputTag from '../components/GrInputTag/GrInputTag.vue'
import GrNumberInput from '../components/GrNumberInput/GrNumberInput.vue'
import GrSelect from '../components/GrSelect/GrSelect.vue'
import GrTreeSelect from '../components/GrTreeSelect/GrTreeSelect.vue'

// В jsdom `import.meta.url` не file-scheme — пути от cwd пакета, как в `layering.test.ts`.
const componentsDir = resolve(process.cwd(), 'src/components')

/**
 * Общие роли: имя означает одно и то же во всём пакете. Новая роль добавляется
 * сюда вместе с записью в `docs/form-controls.md`, а не втихую в компоненте.
 */
const COMMON_SLOTS = new Set([
  'default',
  'prefix',
  'suffix',
  'header',
  'footer',
  'title',
  'label',
  'description',
  'icon',
  'error',
  'empty',
  'loading',
  'actions',
  'trigger',
  'content',
])

/**
 * Доменные роли: имя осмысленно только у своего компонента. Владелец объявлен
 * явно, чтобы `option` или `value` не расползлись туда, где значат другое.
 */
const DOMAIN_SLOTS: Record<string, string[]> = {
  'caption': ['GrTable', 'GrDataTable'],
  'center': ['GrNavbar'],
  'ellipsis': ['GrBreadcrumbs'],
  'end': ['GrSplitter'],
  'extra': ['GrCollapse'],
  'hint': ['GrFormField'],
  // Пункт ленты шагов. Не `item`: у соседей это строка списка, а здесь —
  // этап процесса со своим статусом, и общее имя стёрло бы разницу.
  'step': ['GrSteps'],
  'item': ['GrBottomNav', 'GrBreadcrumbs', 'GrCommandPalette', 'GrList', 'GrSortableList', 'GrTimeline', 'GrTransfer'],
  // Не `value`: у `GrSelect` это выбранное значение в контроле, здесь — лист
  // дерева. Одно имя на два смысла и есть то, что этот словарь ловит.
  'leaf': ['GrJsonViewer'],
  'group': ['GrTimeline'],
  // Уменьшенное представление кадра в полосе переключателей карусели. Не
  // `item`: у соседей это строка списка, а здесь — второй вид того же слайда,
  // и рендерит его не сам слайд, а полоса.
  'thumbnail': ['GrCarousel'],
  // Свои иконки стрелок карусели. Не `icon`: тот в общем словаре значит
  // «иконка компонента», а здесь их две и они различаются направлением.
  'prev': ['GrCarousel'],
  'next': ['GrCarousel'],
  'handle': ['GrSortableList'],
  // Места до и после величины, куда потребитель кладёт своё: знак и стрелку
  // (`GrDelta`), скрытое конечное значение для диктора (`GrStatistic`). Не
  // `before`/`after`: те читаются как «до/после всего компонента», а эти два
  // стоят **внутри** записи величины, между её частями.
  'lead': ['GrValue'],
  'trail': ['GrValue'],
  'left': ['GrNavbar'],
  'marker': ['GrTimeline'],
  'node': ['GrTreeSelect'],
  'option': ['GrSelect', 'GrAutocomplete'],
  'progress': ['GrFileUpload'],
  'separator': ['GrBreadcrumbs'],
  'shortcut': ['GrDropdownMenu'],
  'start': ['GrSplitter'],
  'subtitle': ['GrSidebar'],
  'symbol': ['GrRating'],
  'tab': ['GrTabs'],
  'tag': ['GrInputTag'],
  'text': ['GrRating'],
  'time': ['GrTimeline'],
  'tip': ['GrFileUpload'],
  'toolbar': ['GrImageViewer'],
  'toolbar-actions': ['GrImageViewer'],
  'total': ['GrPagination'],
  'trend': ['GrStatistic'],
  'value': ['GrSelect', 'GrTreeSelect'],
}

/**
 * Контролы с текстовой оболочкой: в поле помещается аддон, значит контракт
 * `prefix`/`suffix` обязателен. Закрытый список — иначе следующий контрол
 * заведёт «почти такой же» аддон со своим именем и своими пропами.
 */
const SHELL_CONTROLS = [
  { name: 'GrInput', component: GrInput },
  { name: 'GrNumberInput', component: GrNumberInput },
  { name: 'GrAutocomplete', component: GrAutocomplete },
  { name: 'GrTreeSelect', component: GrTreeSelect },
  { name: 'GrInputTag', component: GrInputTag },
  { name: 'GrSelect', component: GrSelect },
]

const ADDON_PROPS = [
  'prefixMinWidth',
  'prefixMaxWidth',
  'suffixMinWidth',
  'suffixMaxWidth',
  'prefixFixed',
  'suffixFixed',
]

interface ComponentSlots {
  name: string
  source: string
  slots: string[]
}

function readComponents(): ComponentSlots[] {
  return readdirSync(componentsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.startsWith('Gr'))
    .map((entry) => {
      // Слоты компонента живут не только в главном SFC: `GrCollapse` раздаёт их
      // из `GrCollapseItem.vue`, и для потребителя это слоты `GrCollapse`.
      const source = readdirSync(resolve(componentsDir, entry.name))
        .filter(file => file.endsWith('.vue'))
        .map(file => readFileSync(resolve(componentsDir, entry.name, file), 'utf8'))
        .join('\n')

      return { name: entry.name, source, slots: slotNamesOf(source) }
    })
    .filter(entry => entry.source.length > 0)
}

function slotNamesOf(source: string): string[] {
  const names = new Set<string>()

  for (const tag of source.match(/<slot\b[^>]*?\/?>/g) ?? []) {
    const named = /\bname="([^"]+)"/.exec(tag)
    // Слоты с вычисляемым именем (`#cell-<key>` у `GrDataTable`) — семейство, а
    // не роль: имя задаёт колонка, словарь про них ничего сказать не может.
    if (named && named[1].includes('${'))
      continue

    names.add(named ? named[1] : 'default')
  }

  return [...names].sort()
}

/** Все SFC пакета по отдельности — гейт типизации считает по файлам. */
function sfcFiles(): Array<[string, string]> {
  const files: Array<[string, string]> = []

  for (const entry of readdirSync(componentsDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith('Gr'))
      continue

    for (const file of readdirSync(resolve(componentsDir, entry.name))) {
      if (!file.endsWith('.vue'))
        continue
      files.push([`${entry.name}/${file}`, readFileSync(resolve(componentsDir, entry.name, file), 'utf8')])
    }
  }

  return files
}

const components = readComponents()

describe('словарь слотов', () => {
  it('в пакете есть что проверять', () => {
    expect(components.length).toBeGreaterThan(40)
  })

  it('имя слота — из общего словаря или доменное у своего владельца', () => {
    const offenders: string[] = []

    for (const { name, slots } of components) {
      for (const slot of slots) {
        if (COMMON_SLOTS.has(slot))
          continue

        const owners = DOMAIN_SLOTS[slot]
        if (owners?.includes(name))
          continue

        offenders.push(owners
          ? `${name}: доменный слот \`${slot}\` принадлежит ${owners.join(', ')}`
          : `${name}: слот \`${slot}\` не объявлен ни в общем словаре, ни как доменный`)
      }
    }

    expect(offenders, 'роль есть — берём её имя из словаря; роли нет — заводим её осознанно').toEqual([])
  })

  it('в словаре нет записей про несуществующие слоты', () => {
    const rendered = new Map<string, Set<string>>()

    for (const { name, slots } of components) {
      for (const slot of slots) {
        if (!rendered.has(slot))
          rendered.set(slot, new Set())
        rendered.get(slot)!.add(name)
      }
    }

    const stale = Object.entries(DOMAIN_SLOTS)
      .flatMap(([slot, owners]) => owners
        .filter(owner => !rendered.get(slot)?.has(owner))
        .map(owner => `${slot}: ${owner}`))

    expect(stale, 'слот убрали — уберите и запись владельца').toEqual([])
  })
})

describe('типизация слотов', () => {
  /**
   * Правило одностороннее: «есть слоты → есть `defineSlots`», но не наоборот.
   * `GrAvatarGroup` объявляет типы и не рендерит `<slot>` вовсе — он раздаёт
   * узлы через `useSlots()`, и обратная проверка сделала бы его нарушителем.
   *
   * Считаем по файлам, а не по директориям: у компонента их несколько
   * (`GrCollapse` + `GrCollapseItem`), и склейка источников зеленела бы, пока
   * `defineSlots` есть хоть в одном — восемь дырок так и проскочили бы.
   */
  it.each(sfcFiles())('%s объявляет defineSlots, если у него есть слоты', (_label, source) => {
    if (slotNamesOf(source).length === 0)
      return

    // Без `defineSlots` слоты не попадают ни в `.d.ts`, ни в API-таблицы
    // витрины: описание слота там берётся ровно из JSDoc над его членом.
    expect(source, 'слоты есть, а типов у них нет').toContain('defineSlots<')
  })
})

describe('контракт аддонов', () => {
  it.each(SHELL_CONTROLS.map(({ name }) => name))('%s объявляет слоты prefix и suffix', (name) => {
    const component = components.find(entry => entry.name === name)!

    expect(component.slots).toContain('prefix')
    expect(component.slots).toContain('suffix')
  })

  it.each(SHELL_CONTROLS)('$name объявляет шесть пропов ширины аддонов', ({ component }) => {
    const declared = Object.keys((component as { props?: Record<string, unknown> }).props ?? {})

    expect(ADDON_PROPS.filter(prop => !declared.includes(prop))).toEqual([])
  })
})
