<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

import { useGranularityTranslations } from '../../internal/granularityI18n'
import GrKbd from '../GrKbd/GrKbd.vue'
import GrModal from '../GrModal/GrModal.vue'

import {
  filterCommandItems,
  groupCommandItems,
  matchCommandItem,
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
  /** Показывать подсказку сочетания в поле ввода. */
  showHotkeyHint?: boolean
  emptyText?: string
  ariaLabel?: string
}

const props = withDefaults(
  defineProps<GrCommandPaletteProps>(),
  {
    items: undefined,
    placeholder: undefined,
    size: 'lg',
    hotkey: 'mod+k',
    filterable: true,
    filter: undefined,
    loading: false,
    closeOnSelect: true,
    maxHeight: 360,
    showHotkeyHint: true,
    emptyText: undefined,
    ariaLabel: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  /** Команда выбрана (клик или Enter). */
  (e: 'select', item: GrCommandItem): void
  /** Поисковый запрос изменился — точка входа для remote-поиска. */
  (e: 'search', query: string): void
}>()

const { t } = useGranularityTranslations()

const resolvedPlaceholder = computed(() => props.placeholder ?? t('gr.commandPalette.placeholder', 'Type a command or search…'))
const resolvedEmptyText = computed(() => props.emptyText ?? t('gr.commandPalette.empty', 'Nothing found'))
const resolvedAriaLabel = computed(() => props.ariaLabel ?? t('gr.commandPalette.label', 'Command palette'))
const loadingText = computed(() => t('gr.commandPalette.loading', 'Loading…'))

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

const groups = computed(() => groupCommandItems(filteredItems.value))

/** Плоский список того, что реально выбирается — по нему ходят стрелки. */
const navigableItems = computed(() => filteredItems.value.filter(item => !item.disabled))

const activeItem = computed<GrCommandItem | undefined>(() => navigableItems.value[activeIndex.value])

function itemDomId(id: string): string {
  return `${listboxId}-item-${id}`
}

const activeDescendantId = computed(() =>
  activeItem.value ? itemDomId(activeItem.value.id) : undefined,
)

function isActive(item: GrCommandItem): boolean {
  return activeItem.value?.id === item.id
}

async function scrollActiveIntoView(): Promise<void> {
  await nextTick()
  const item = activeItem.value
  if (!item) return
  document.getElementById(itemDomId(item.id))?.scrollIntoView?.({ block: 'nearest' })
}

function setActive(index: number): void {
  const len = navigableItems.value.length
  activeIndex.value = len === 0 ? 0 : ((index % len) + len) % len
  void scrollActiveIntoView()
}

// Список пересобрался (ввод запроса / remote-загрузка) — активной становится первая команда.
watch(filteredItems, () => { activeIndex.value = 0 })

function close(): void {
  emit('update:modelValue', false)
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

// ————— Открытие/закрытие: сброс запроса и фокус в поле.
let focusTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.modelValue,
  (open) => {
    if (!open) {
      if (focusTimer) clearTimeout(focusTimer)
      return
    }

    query.value = ''
    activeIndex.value = 0
    // `GrModal` отдаёт первичный фокус своей панели, поэтому переносим фокус в
    // поле ввода следующим тиком макрозадачи — иначе HeadlessUI перебьёт его.
    if (focusTimer) clearTimeout(focusTimer)
    focusTimer = setTimeout(() => { inputEl.value?.focus() }, 0)
  },
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
  emit('update:modelValue', !props.modelValue)
}

onMounted(() => {
  if (typeof window === 'undefined') return
  isApple.value = isAppleDevice()
  window.addEventListener('keydown', onWindowKeydown)
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') window.removeEventListener('keydown', onWindowKeydown)
  if (focusTimer) clearTimeout(focusTimer)
})

const modalSize = computed(() => commandPaletteModalSizeBySize[props.size])
const listStyle = computed(() => ({ maxHeight: `var(--gr-command-list-max-height, ${props.maxHeight}px)` }))
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

        <span v-if="loading" class="shrink-0 text-[var(--gr-muted-fg)]">
          <span class="i-lucide-loader-2 block h-4 w-4 animate-spin" :aria-label="loadingText" />
        </span>
        <span v-else-if="hotkeyHint.length" class="shrink-0" aria-hidden="true">
          <GrKbd :keys="hotkeyHint" separator="" size="sm" />
        </span>
      </div>

      <div
        :id="listboxId"
        data-gr-command-palette-list
        data-testid="gr-command-palette-list"
        class="overflow-y-auto p-2"
        :style="listStyle"
        role="listbox"
        :aria-label="resolvedAriaLabel"
      >
        <template v-for="(group, groupIndex) in groups" :key="group.name ?? `__ungrouped-${groupIndex}`">
          <div
            v-if="group.name"
            :id="`${listboxId}-group-${groupIndex}`"
            data-gr-command-palette-group
            :class="commandGroupLabelClass"
          >
            {{ group.name }}
          </div>

          <div role="group" :aria-labelledby="group.name ? `${listboxId}-group-${groupIndex}` : undefined">
            <div
              v-for="item in group.items"
              :id="itemDomId(item.id)"
              :key="item.id"
              data-gr-command-palette-item
              :data-testid="`gr-command-palette-item-${item.id}`"
              role="option"
              :aria-selected="isActive(item) ? 'true' : 'false'"
              :aria-disabled="item.disabled ? 'true' : undefined"
              :class="commandItemClass({ active: isActive(item), disabled: Boolean(item.disabled) })"
              @click="selectItem(item)"
              @mousemove="onItemHover(item)"
            >
              <slot name="item" :item="item" :active="isActive(item)">
                <span
                  v-if="item.icon"
                  class="block h-4 w-4 shrink-0 text-[var(--gr-muted-fg)]"
                  :class="item.icon"
                  aria-hidden="true"
                />
                <span class="min-w-0 flex-1">
                  <span class="block truncate">{{ item.label }}</span>
                  <span v-if="item.description" class="block truncate text-[12px] text-[var(--gr-muted-fg)]">
                    {{ item.description }}
                  </span>
                </span>
                <span v-if="item.shortcut?.length" class="shrink-0">
                  <GrKbd :keys="item.shortcut" separator="" size="sm" />
                </span>
              </slot>
            </div>
          </div>
        </template>

        <div
          v-if="!filteredItems.length"
          data-gr-command-palette-empty
          data-testid="gr-command-palette-empty"
          :class="commandEmptyClass"
        >
          <slot name="empty" :query="query">
            {{ resolvedEmptyText }}
          </slot>
        </div>
      </div>

      <div v-if="$slots.footer" data-gr-command-palette-footer :class="commandFooterClass">
        <slot name="footer" />
      </div>
    </div>
  </GrModal>
</template>
