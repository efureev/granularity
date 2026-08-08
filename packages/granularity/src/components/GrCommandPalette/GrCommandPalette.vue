<script setup lang="ts">
import { useGrComponentProp } from '../GrConfigProvider/context'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

import { useVirtualList } from '../../composables/useVirtualList'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import { isComposingEvent } from '../../internal/keyboard'
import GrKbd from '../GrKbd/GrKbd.vue'
import GrModal from '../GrModal/GrModal.vue'

import {
  filterCommandItems,
  findDuplicateCommandIds,
  groupCommandItems,
  matchCommandItem,
  splitCommandMatch,
  withRecentCommands,
  type GrCommandFilter,
  type GrCommandItem,
} from './filtering'
import {
  formatCommandHotkey,
  isAppleDevice,
  matchesCommandHotkey,
  parseCommandHotkey,
} from '../shared/hotkey'
import {
  commandEmptyClass,
  commandFooterClass,
  commandGroupLabelClass,
  commandItemClass,
  commandItemDescriptionClass,
  commandItemMutedClass,
  commandMatchClass,
  commandPaletteModalSizeBySize,
  commandSearchInputClass,
  commandSearchRowClass,
  type GrCommandPaletteSize,
} from './grCommandPaletteStyles'

export type { GrCommandFilter, GrCommandGroup, GrCommandItem } from './filtering'
export type { GrCommandPaletteSize } from './grCommandPaletteStyles'

/**
 * Публичный GR-примитив «Command palette» (⌘K) — модальный поиск по командам
 * приложения с группировкой, подсказками сочетаний и клавиатурной навигацией.
 *
 * A11y: WAI-ARIA combobox поверх модалки — `role="combobox"` на поле ввода,
 * `role="listbox"` на списке, `aria-activedescendant` на активной команде
 * (фокус остаётся в поле). Esc, фокус-ловушка и блокировка скролла приходят
 * из `GrModal`.
 *
 * Открытие по глобальному сочетанию (`hotkey`, по умолчанию `mod+k` — Cmd на
 * macOS, Ctrl на прочих) компонент берёт на себя; передайте `hotkey: null`,
 * чтобы управлять открытием только через `v-model`.
 */
export interface GrCommandPaletteProps {
  /** Открыта ли палитра. */
  modelValue: boolean
  /** Плоский список команд; группировка — по полю `group` самой команды. */
  items?: GrCommandItem[]
  /**
   * Недавние команды: пока запрос пуст, они поднимаются отдельной группой
   * наверх в этом порядке и не дублируются ниже.
   */
  recentIds?: string[]
  placeholder?: string
  size?: GrCommandPaletteSize
  /** Глобальное сочетание открытия. `null` — не вешать слушатель. */
  hotkey?: string | null
  /** Локальная фильтрация по запросу. `false` — фильтрует владелец по событию `search`. */
  filterable?: boolean
  /** Кастомный матчер локальной фильтрации. */
  filter?: GrCommandFilter
  /** Внешне управляемое состояние загрузки (для remote-поиска). */
  loading?: boolean
  /** Закрывать палитру после выбора команды. */
  closeOnSelect?: boolean
  /** Максимальная высота списка, px. */
  maxHeight?: number
  /**
   * Виртуализация списка: в DOM живёт только окно вокруг вьюпорта. Высоту окна
   * задаёт `maxHeight`.
   *
   * Включается осознанно: на сотне команд выигрыша нет, а в разметке остаётся
   * только окно — вместе с ним меняется и то, что находит `querySelector`
   * потребителя. Профильный сценарий — палитра приложения на тысячи команд.
   */
  virtual?: boolean
  /** Показывать подсказку сочетания в поле ввода. */
  showHotkeyHint?: boolean
  emptyText?: string
  ariaLabel?: string
}

export interface GrCommandPaletteEmits {
  (e: 'update:modelValue', value: boolean): void
  /** Команда выбрана (клик или Enter). */
  (e: 'select', item: GrCommandItem): void
  /** Поисковый запрос изменился — точка входа для remote-поиска. */
  (e: 'search', query: string): void
}

import './defaults'

const props = withDefaults(
  defineProps<GrCommandPaletteProps>(),
  {
    items: undefined,
    recentIds: undefined,
    placeholder: undefined,
    // Дефолт `size` живёт в резолвере ниже, а не здесь: Vue подставил бы его
    // до того, как компонент заглянет в `GrConfigProvider`.
    size: undefined,
    hotkey: 'mod+k',
    filterable: true,
    filter: undefined,
    loading: false,
    closeOnSelect: true,
    maxHeight: 360,
    virtual: false,
    showHotkeyHint: true,
    emptyText: undefined,
    ariaLabel: undefined,
  },
)

const emit = defineEmits<GrCommandPaletteEmits>()

const { t } = useGranularityTranslations()

const resolvedPlaceholder = computed(() => props.placeholder ?? t('gr.commandPalette.placeholder', 'Type a command or search…'))
const resolvedEmptyText = computed(() => props.emptyText ?? t('gr.commandPalette.empty', 'Nothing found'))
const resolvedAriaLabel = computed(() => props.ariaLabel ?? t('gr.commandPalette.label', 'Command palette'))
const loadingText = computed(() => t('gr.commandPalette.loading', 'Loading…'))
const recentTitle = computed(() => t('gr.commandPalette.recent', 'Recent'))

const query = ref('')
const activeIndex = ref(0)
const inputEl = ref<HTMLInputElement | null>(null)
const listboxId = useId()

const itemsResolved = computed<GrCommandItem[]>(() => props.items ?? [])

const filteredItems = computed<GrCommandItem[]>(() =>
  props.filterable
    ? filterCommandItems(itemsResolved.value, query.value, props.filter ?? matchCommandItem)
    : itemsResolved.value,
)

const groups = computed(() => {
  const grouped = groupCommandItems(filteredItems.value)

  // С непустым запросом секции «недавние» нет: там правит релевантность, а не
  // история — иначе первая же буква уводила бы взгляд не туда.
  if (query.value.trim()) return grouped

  return withRecentCommands(grouped, filteredItems.value, props.recentIds ?? [], recentTitle.value)
})

/**
 * Порядок обхода стрелками совпадает с порядком на экране: «недавние» стоят
 * первыми, значит и первая стрелка ведёт туда же.
 */
const orderedItems = computed(() => groups.value.flatMap(group => group.items))

/** Плоский список того, что реально выбирается — по нему ходят стрелки. */
const navigableItems = computed(() => orderedItems.value.filter(item => !item.disabled))

const activeItem = computed<GrCommandItem | undefined>(() => navigableItems.value[activeIndex.value])

function itemDomId(id: string): string {
  return `${listboxId}-item-${id}`
}

const activeDescendantId = computed(() =>
  activeItem.value ? itemDomId(activeItem.value.id) : undefined,
)

/**
 * Виртуализация списка.
 *
 * Набор — плоский поток строк экрана: заголовок группы занимает такую же
 * строку, как команда, поэтому входит в него наравне. Вложенную структуру
 * рендер пересобирает уже из окна.
 */

/** Оценки высоты строк. Команда крупнее заголовка; дальше уточняются замером. */
const ITEM_SIZE_ESTIMATE = 44
const GROUP_LABEL_SIZE_ESTIMATE = 28

type PaletteRow =
  | { kind: 'label', groupIndex: number }
  | { kind: 'item', groupIndex: number, item: GrCommandItem, posInSet: number, setSize: number }

const listEl = ref<HTMLElement | null>(null)

const paletteRows = computed<PaletteRow[]>(() => {
  const rows: PaletteRow[] = []

  groups.value.forEach((group, groupIndex) => {
    if (group.name) rows.push({ kind: 'label', groupIndex })

    group.items.forEach((item, index) => {
      rows.push({
        kind: 'item',
        groupIndex,
        item,
        // Набор — группа, а не весь список: по ARIA позиция отсчитывается от неё.
        posInSet: index + 1,
        setSize: group.items.length,
      })
    })
  })

  return rows
})

const virtualizer = useVirtualList({
  container: listEl,
  count: () => (props.virtual ? paletteRows.value.length : 0),
  // Запрос пересобирает набор строк — замеры прошлого набора невалидны.
  source: () => paletteRows.value,
  itemSize: index => (paletteRows.value[index]?.kind === 'label' ? GROUP_LABEL_SIZE_ESTIMATE : ITEM_SIZE_ESTIMATE),
  // Список закрытой палитры не смонтирован вовсе: `clientHeight` взять неоткуда.
  // `maxHeight` можно перебить `--gr-command-list-max-height` — тогда точная
  // высота приедет с первым замером, а это останется оценкой первого рендера.
  viewportSize: () => props.maxHeight,
})

/**
 * Группы к отрисовке. При виртуализации пересобираются из среза `paletteRows`:
 * группа, начатая выше окна, всё равно открывается — иначе её команды остались
 * бы прямыми потомками listbox'а, что роль запрещает.
 */
type RenderedGroup = {
  key: string
  groupIndex: number
  name: string | undefined
  labelVisible: boolean
  /** Позиция строки заголовка в `paletteRows` — по ней его замеряет виртуализатор. */
  labelRowIndex?: number
  items: { item: GrCommandItem, rowIndex: number, posInSet: number, setSize: number }[]
}

const renderedGroups = computed<RenderedGroup[]>(() => {
  const rows = paletteRows.value

  const from = props.virtual ? virtualizer.range.value.start : 0
  const to = props.virtual ? Math.min(rows.length, virtualizer.range.value.end) : rows.length

  const result: RenderedGroup[] = []
  let current: RenderedGroup | undefined

  for (let rowIndex = from; rowIndex < to; rowIndex++) {
    const row = rows[rowIndex]!
    const group = groups.value[row.groupIndex]

    if (!current || current.groupIndex !== row.groupIndex) {
      current = {
        key: group?.name ?? `__ungrouped-${row.groupIndex}`,
        groupIndex: row.groupIndex,
        name: group?.name,
        labelVisible: false,
        items: [],
      }
      result.push(current)
    }

    if (row.kind === 'label') {
      current.labelVisible = true
      current.labelRowIndex = rowIndex
      continue
    }

    current.items.push({ item: row.item, rowIndex, posInSet: row.posInSet, setSize: row.setSize })
  }

  return result
})

/** ARIA набора: объявляем только при виртуализации — иначе набор виден по DOM. */
function itemSetProps(entry: { posInSet: number, setSize: number }): Record<string, number> | undefined {
  if (!props.virtual) return undefined
  return { 'aria-setsize': entry.setSize, 'aria-posinset': entry.posInSet }
}


/** Сегменты подсветки: совпавшее с запросом рисуется `<mark>`. */
function matchSegments(text: string): ReturnType<typeof splitCommandMatch> {
  return splitCommandMatch(text, props.filterable ? query.value : '')
}

function isActive(item: GrCommandItem): boolean {
  return activeItem.value?.id === item.id
}

async function scrollActiveIntoView(): Promise<void> {
  const item = activeItem.value
  if (!item) return

  // Вне окна активной команды в DOM нет: `getElementById` вернул бы `null`,
  // прокрутка не случилась бы, а `aria-activedescendant` указал бы в пустоту.
  if (props.virtual) {
    const rowIndex = paletteRows.value.findIndex(row => row.kind === 'item' && row.item.id === item.id)
    if (rowIndex >= 0) virtualizer.scrollToIndex(rowIndex)
  }

  await nextTick()
  document.getElementById(itemDomId(item.id))?.scrollIntoView?.({ block: 'nearest' })
}

function setActive(index: number): void {
  const len = navigableItems.value.length
  activeIndex.value = len === 0 ? 0 : ((index % len) + len) % len
  void scrollActiveIntoView()
}

// Активной становится первая команда, когда список изменился **по содержимому**.
// Следить за идентичностью массива нельзя: родитель, отдающий `:items` инлайн-
// выражением, пересоздаёт его на каждый посторонний ререндер — и выбранная
// стрелками команда прыгала бы в начало.
// Разделитель — пробел, а не запятая: `id` вправе её содержать, и «a,b» + «c»
// дало бы тот же ключ, что «a» + «b,c».
watch(
  () => orderedItems.value.map(item => item.id).join(' '),
  () => { activeIndex.value = 0 },
)

// `id` — ключ рендера и цель `aria-activedescendant`: дубли дают одинаковые
// DOM-id, и фокус уезжает не на ту команду.
watch(
  itemsResolved,
  (items) => {
    if (process.env.NODE_ENV === 'production') return
    const duplicates = findDuplicateCommandIds(items)
    if (!duplicates.length) return

    console.warn(
      `[GrCommandPalette] повторяющиеся id команд: ${duplicates.join(', ')}. `
      + 'Из-за одинаковых DOM-id `aria-activedescendant` укажет не на ту команду.',
    )
  },
  { immediate: true },
)

function open(): void {
  emit('update:modelValue', true)
}

function close(): void {
  emit('update:modelValue', false)
}

function toggle(): void {
  emit('update:modelValue', !props.modelValue)
}

function selectItem(item: GrCommandItem): void {
  if (item.disabled) return
  emit('select', item)
  if (props.closeOnSelect) close()
}

function onItemHover(item: GrCommandItem): void {
  const index = navigableItems.value.indexOf(item)
  if (index >= 0) setActive(index)
}

function onInput(event: Event): void {
  query.value = (event.target as HTMLInputElement).value
  emit('search', query.value.trim())
}

function onKeydown(event: KeyboardEvent): void {
  // Клавиша во время IME-композиции принадлежит композиции: Enter коммитит её,
  // стрелки ходят по кандидатам.
  if (isComposingEvent(event)) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      setActive(activeIndex.value + 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      setActive(activeIndex.value - 1)
      break
    case 'Home':
      event.preventDefault()
      setActive(0)
      break
    case 'End':
      event.preventDefault()
      setActive(navigableItems.value.length - 1)
      break
    case 'Enter':
      if (!activeItem.value) break
      event.preventDefault()
      selectItem(activeItem.value)
      break
  }
}

// ————— Открытие: сброс запроса и выбора.
watch(
  () => props.modelValue,
  (open) => {
    if (!open) return

    query.value = ''
    activeIndex.value = 0
  },
)

// Фокус в поле — отдельным наблюдателем, и по появлению самого поля: содержимое
// панели рождается вместе с ней, и по одному лишь пропу фокусировать нечего.
// Ловушка фокуса `GrModal` этот выбор не перебивает — фокус, уже стоящий внутри
// слоя, она считает осознанным.
watch(
  [() => props.modelValue, inputEl],
  ([open]) => {
    if (open) inputEl.value?.focus()
  },
  { flush: 'post' },
)

// ————— Глобальное сочетание открытия.
const parsedHotkey = computed(() => (props.hotkey ? parseCommandHotkey(props.hotkey) : null))

// Платформа определяется только после монтирования: на сервере `navigator` нет,
// и первый рендер обязан совпасть с серверным. Иначе сервер отдаёт `Ctrl`,
// клиент на macOS рисует `⌘`, и гидрация расходится по тексту подсказки.
const isApple = ref(false)

const hotkeyHint = computed(() =>
  props.showHotkeyHint && parsedHotkey.value ? formatCommandHotkey(parsedHotkey.value, isApple.value) : [],
)

function onWindowKeydown(event: KeyboardEvent): void {
  const hotkey = parsedHotkey.value
  if (!hotkey || !matchesCommandHotkey(event, hotkey, isApple.value)) return
  event.preventDefault()
  toggle()
}

onMounted(() => {
  if (typeof window === 'undefined') return
  isApple.value = isAppleDevice()
  window.addEventListener('keydown', onWindowKeydown)
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') window.removeEventListener('keydown', onWindowKeydown)
})

// Эффективный размер: локальный проп → `GrConfigProvider` → дефолт компонента.
const resolvedSize = useGrComponentProp('GrCommandPalette', 'size', () => props.size, 'lg')

const modalSize = computed(() => commandPaletteModalSizeBySize[resolvedSize.value])
const listStyle = computed(() => ({ maxHeight: `var(--gr-command-list-max-height, ${props.maxHeight}px)` }))

const listStyleWithSpacers = computed(() => {
  const base = listStyle.value
  if (!props.virtual) return base

  return {
    ...base,
    ...virtualizer.spacerStyle.value,
  }
})

defineExpose({ open, close, toggle })
</script>

<template>
  <GrModal
    :model-value="modelValue"
    :size="modalSize"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div data-gr-command-palette :aria-label="resolvedAriaLabel">
      <div data-gr-command-palette-search :class="commandSearchRowClass">
        <span class="i-lucide-search block h-4 w-4 shrink-0 text-[var(--gr-muted-fg)]" aria-hidden="true" />

        <input
          ref="inputEl"
          data-gr-command-palette-input
          data-testid="gr-command-palette-input"
          type="text"
          autocomplete="off"
          spellcheck="false"
          role="combobox"
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-expanded="true"
          :aria-label="resolvedAriaLabel"
          :aria-controls="listboxId"
          :aria-activedescendant="activeDescendantId"
          :value="query"
          :placeholder="resolvedPlaceholder"
          :class="commandSearchInputClass"
          @input="onInput"
          @keydown="onKeydown"
        >

        <span v-if="loading" class="shrink-0 text-[var(--gr-muted-fg)]" aria-hidden="true">
          <span class="i-lucide-loader-2 block h-4 w-4 animate-spin" />
        </span>
        <span v-else-if="hotkeyHint.length" class="shrink-0" aria-hidden="true">
          <GrKbd :keys="hotkeyHint" separator="" size="sm" />
        </span>
      </div>

      <div
        :id="listboxId"
        ref="listEl"
        data-gr-command-palette-list
        data-testid="gr-command-palette-list"
        :data-gr-virtual="virtual ? '' : undefined"
        class="overflow-y-auto p-2"
        :style="listStyleWithSpacers"
        role="listbox"
        :aria-label="resolvedAriaLabel"
      >
        <!-- Прямыми потомками listbox могут быть только `role="group"`: заголовок
             группы лежит внутри неё и объявлен презентационным (имя группе он
             даёт через `aria-labelledby`), иначе ломается `aria-required-children`.

             При виртуализации окно может начаться ниже заголовка — тогда его в
             DOM нет, и имя группы идёт напрямую в `aria-label`. -->
        <div
          v-for="group in renderedGroups"
          :key="group.key"
          role="group"
          :aria-labelledby="group.name && group.labelVisible ? `${listboxId}-group-${group.groupIndex}` : undefined"
          :aria-label="group.name && !group.labelVisible ? group.name : undefined"
        >
          <div
            v-if="group.name && group.labelVisible"
            :id="`${listboxId}-group-${group.groupIndex}`"
            :ref="(el) => virtual && group.labelRowIndex !== undefined && virtualizer.measure(group.labelRowIndex, el as Element | null)"
            data-gr-command-palette-group
            role="presentation"
            :class="commandGroupLabelClass"
          >
            {{ group.name }}
          </div>

          <div>
            <div
              v-for="entry in group.items"
              :id="itemDomId(entry.item.id)"
              :key="entry.item.id"
              :ref="(el) => virtual && virtualizer.measure(entry.rowIndex, el as Element | null)"
              data-gr-command-palette-item
              :data-testid="`gr-command-palette-item-${entry.item.id}`"
              role="option"
              v-bind="itemSetProps(entry)"
              :aria-selected="isActive(entry.item) ? 'true' : 'false'"
              :aria-disabled="entry.item.disabled ? 'true' : undefined"
              :class="commandItemClass({ active: isActive(entry.item), disabled: Boolean(entry.item.disabled) })"
              @click="selectItem(entry.item)"
              @mousemove="onItemHover(entry.item)"
            >
              <slot name="item" :item="entry.item" :active="isActive(entry.item)">
                <span
                  v-if="entry.item.icon"
                  class="block h-4 w-4 shrink-0"
                  :class="[entry.item.icon, commandItemMutedClass(Boolean(entry.item.disabled))]"
                  aria-hidden="true"
                />
                <span class="min-w-0 flex-1">
                  <span class="block truncate">
                    <template v-for="(segment, index) in matchSegments(entry.item.label)" :key="index">
                      <mark v-if="segment.match" :class="commandMatchClass">{{ segment.text }}</mark>
                      <template v-else>{{ segment.text }}</template>
                    </template>
                  </span>
                  <span
                    v-if="entry.item.description"
                    :class="[commandItemDescriptionClass, commandItemMutedClass(Boolean(entry.item.disabled))]"
                  >
                    <template v-for="(segment, index) in matchSegments(entry.item.description)" :key="index">
                      <mark v-if="segment.match" :class="commandMatchClass">{{ segment.text }}</mark>
                      <template v-else>{{ segment.text }}</template>
                    </template>
                  </span>
                </span>
                <span v-if="entry.item.shortcut?.length" class="shrink-0">
                  <GrKbd :keys="entry.item.shortcut" separator="" size="sm" />
                </span>
              </slot>
            </div>
          </div>
        </div>
      </div>

      <!-- Состояния объявляются живым регионом: `aria-label` на generic-элементе
           большинство AT игнорируют, и загрузка осталась бы неозвученной. Регион
           один на оба состояния и лежит вне listbox — внутри он стал бы его
           недопустимым потомком. -->
      <div
        v-if="loading || !filteredItems.length"
        data-gr-command-palette-empty
        data-testid="gr-command-palette-empty"
        role="status"
        aria-live="polite"
        :class="commandEmptyClass"
      >
        <template v-if="loading">
          {{ loadingText }}
        </template>
        <slot v-else name="empty" :query="query">
          {{ resolvedEmptyText }}
        </slot>
      </div>

      <div v-if="$slots.footer" data-gr-command-palette-footer :class="commandFooterClass">
        <slot name="footer" />
      </div>
    </div>
  </GrModal>
</template>

<style scoped>
/*
 * Распорки виртуального списка.
 *
 * Не `padding` контейнера: `max-height` меряет ту же коробку. Не обёртка внутри
 * listbox'а: прямыми потомками роли обязаны быть только группы. Не отступы
 * крайних строк: при прыжке прокрутки строки заменяются целиком, и распорка
 * исчезла бы вместе с ними.
 *
 * `display: block` обязателен: список палитры — блочный поток, а псевдоэлемент
 * по умолчанию строчный, и строчная коробка игнорирует `height` — распорка
 * молча не создалась бы вовсе.
 */
[data-gr-virtual]::before,
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
}
</style>
