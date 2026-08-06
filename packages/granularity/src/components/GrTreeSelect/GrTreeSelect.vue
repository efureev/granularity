<script setup lang="ts" generic="T extends Record<string, any> = any">
import { computed, nextTick, ref, useId, watch } from 'vue'

import { useTeleportEnabled } from '../../composables/internal/useTeleportEnabled'

import { vClickOutside } from '../../directives'
import { useFloating } from '../../composables/useFloating'
import { useOverlayLayer } from '../../composables/useOverlayLayer'
import { useGrComponentSize, useGrThemeAttrs } from '../GrConfigProvider/context'
import { useGrFormControl } from '../../composables/useGrFormControl'
import { useGrFormFieldContext } from '../GrFormField/context'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import GrInput from '../GrInput/GrInput.vue'
import GrTree, {
  type GrTreeInstance,
  type GrTreeKey,
  type GrTreeNode,
} from '../GrTree'
import type { GrTreeSelectModelValue, GrTreeSelectProps } from './grTreeSelectTypes'
import { grTreeSelectClass, grTreeSelectPanelClass } from './grTreeSelectStyles'

const props = withDefaults(
  defineProps<GrTreeSelectProps<T>>(),
  {
    props: () => ({
      children: 'children',
      label: 'label',
    }),
    nodeKey: 'id' as any,
    defaultExpandedKeys: () => [],
    disabled: false,
    placeholder: undefined,
    size: undefined,
    loading: false,
    invalid: false,
    readonly: false,
    required: false,
    ariaLabel: undefined,
    state: 'default',
    multiple: false,
    clearable: false,
    valueDisplay: 'label',
    filterable: false,
    filterPlaceholder: undefined,
    filterInputmode: undefined,
    filterNodeMethod: undefined,
    closeOnSelect: undefined,
    dropdownMaxHeight: 320,
  },
)

const { t } = useGranularityTranslations()

const emit = defineEmits<{
  (e: 'update:modelValue', value: GrTreeSelectModelValue): void
  (e: 'change', value: GrTreeSelectModelValue): void
  (e: 'visibleChange', visible: boolean): void
  (e: 'clear'): void
  (e: 'nodeClick', data: T, node: GrTreeNode<T>): void
}>()

defineSlots<{
  /** Рендер значения внутри триггера (вместо дефолтного текста). */
  value?: (props: { value: GrTreeSelectModelValue; labels: string[]; displayValue: string; pathLabels?: string[] }) => any
  /** Рендер строки дерева. */
  node?: (props: { node: GrTreeNode<T>; data: T; selected: boolean }) => any
  /** Содержимое пустого состояния (когда нет данных). */
  empty?: () => any
  /** Содержимое панели, пока данные едут. */
  loading?: () => any
}>()

const rootEl = ref<HTMLElement | null>(null)
const triggerEl = ref<HTMLInputElement | null>(null)
const treeId = `gr-tree-select-tree-${useId()}`

// Контекст `GrFormField` + общий контракт форм-контрола.
const field = useGrFormFieldContext()
const fieldId = computed(() => field?.id.value)
const describedBy = computed(() => field?.describedById.value)
const { invalid: isInvalid, required: isRequired, readonly: isReadonly } = useGrFormControl(() => props)

function focus(): void {
  triggerEl.value?.focus()
}

function blur(): void {
  triggerEl.value?.blur()
}

defineExpose({ focus, blur })
const filterInputRef = ref<InstanceType<typeof GrInput> | null>(null)
const treeRef = ref<GrTreeInstance | null>(null)
const panelEl = ref<HTMLElement | null>(null)

const clickOutsideExclude = [() => panelEl.value]

let hadPointerDownOnTrigger = false

const open = ref(false)
const filterValue = ref('')

const { floatingStyle } = useFloating(rootEl, panelEl, open, {
  placement: 'bottom-start',
  matchWidth: true,
  zIndexVar: '--gr-z-dropdown',
})

const closeOnSelectResolved = computed(() => {
  return props.closeOnSelect ?? !props.multiple
})

function getChildrenKey() {
  return props.props.children ?? 'children'
}

function getLabelKey() {
  return props.props.label ?? 'label'
}

function nodeLabel(data: T): string {
  const key = getLabelKey() as keyof T
  const v = data[key]
  return v == null ? '' : String(v)
}

function nodeChildren(data: T): T[] {
  const key = getChildrenKey() as keyof T
  const v = data[key]
  return Array.isArray(v) ? (v as any) : []
}

function nodeKeyOf(data: T, index: number, parentKey: GrTreeKey | undefined): GrTreeKey {
  const keyName = props.nodeKey as keyof T
  const v = data[keyName]
  if (v != null)
    return v as GrTreeKey

  return parentKey == null ? index : `${String(parentKey)}:${index}`
}

const labelByKey = computed(() => {
  const map = new Map<GrTreeKey, string>()

  const walk = (items: T[], parentKey: GrTreeKey | undefined) => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const key = nodeKeyOf(item, i, parentKey)
      map.set(key, nodeLabel(item))
      walk(nodeChildren(item), key)
    }
  }

  walk(props.data ?? [], undefined)
  return map
})

const pathLabelsByKey = computed(() => {
  const map = new Map<GrTreeKey, string[]>()

  const walk = (items: T[], parentKey: GrTreeKey | undefined, parentPath: string[]) => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const key = nodeKeyOf(item, i, parentKey)
      const label = nodeLabel(item)
      const path = [...parentPath, label]
      map.set(key, path)
      walk(nodeChildren(item), key, path)
    }
  }

  walk(props.data ?? [], undefined, [])
  return map
})

const selectedKeys = computed<GrTreeKey[]>(() => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) ? props.modelValue : []
  }

  const v = props.modelValue
  if (v == null || Array.isArray(v))
    return []
  return [v]
})

const selectedKeySet = computed(() => new Set(selectedKeys.value))

const selectedLabels = computed(() => {
  const map = labelByKey.value
  return selectedKeys.value.map((k) => map.get(k) ?? String(k))
})

const selectedPathLabels = computed<string[] | undefined>(() => {
  if (props.multiple)
    return undefined

  const key = selectedKeys.value[0]
  if (key == null)
    return undefined

  const path = pathLabelsByKey.value.get(key)
  if (path?.length)
    return path

  const labels = selectedLabels.value
  return labels.length ? [labels[0]] : undefined
})

const displayValue = computed(() => {
  const labels = selectedLabels.value
  if (labels.length === 0)
    return ''

  if (!props.multiple) {
    if (props.valueDisplay === 'path') {
      const path = selectedPathLabels.value
      if (path?.length)
        return path.join(' / ')
    }
    return labels[0]
  }

  if (labels.length === 1)
    return labels[0]
  return `${labels[0]} +${labels.length - 1}`
})

const hasSelection = computed(() => selectedKeys.value.length > 0)

/** Дерево рендерится только когда есть что показать — ссылаться иначе не на что. */
const hasTree = computed(() => !props.loading && (props.data?.length ?? 0) > 0)

const resolvedFilterPlaceholder = computed(() => {
  return props.filterPlaceholder ?? t('gr.treeSelect.filterPlaceholder', 'Search…')
})

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrTreeSelect' })

const className = computed(() => {
  return grTreeSelectClass({
    size: resolvedSize.value,
    state: props.state,
    invalid: isInvalid.value,
    disabled: props.disabled,
  })
})

const panelClasses = computed(() => {
  return grTreeSelectPanelClass
})

function setOpen(next: boolean) {
  if (props.disabled || isReadonly.value)
    return

  if (open.value === next)
    return

  open.value = next
  emit('visibleChange', next)
}

function onClickOutside(): void {
  setOpen(false)
}

function openDropdown(): void {
  setOpen(true)
}

/**
 * Стек слоёв возвращает фокус на триггер сразу после закрытия, а у триггера
 * открытие висит на `focus`. Без флага `Escape` из дерева закрывал бы панель и
 * тем же движением открывал её заново.
 */
let suppressFocusOpen = false

function closeDropdown(): void {
  suppressFocusOpen = true
  setOpen(false)
  setTimeout(() => {
    suppressFocusOpen = false
  }, 0)
}

function toggleDropdown(): void {
  setOpen(!open.value)
}

// Клик по триггеру сам переключает панель через `@click`; флаг гасит открытие
// по приходящему следом `focus`, иначе один клик открыл бы и тут же закрыл.
function onTriggerPointerDown(): void {
  hadPointerDownOnTrigger = true
  setTimeout(() => {
    hadPointerDownOnTrigger = false
  }, 0)
}

function onTriggerFocus(): void {
  if (hadPointerDownOnTrigger || suppressFocusOpen)
    return
  openDropdown()
}

// Возврат фокуса на триггер — из контракта слоя, а не руками через `nextTick`.
useOverlayLayer(open, closeDropdown, { root: panelEl })

watch(
  open,
  async (isOpen) => {
    if (!isOpen) {
      if (filterValue.value.trim().length > 0)
        filterValue.value = ''
      return
    }

    // Подсветка дерева идёт за значением: панель могли открыть после того, как
    // значение сменили снаружи.
    if (!props.multiple) {
      const v = props.modelValue
      if (v != null && !Array.isArray(v))
        treeRef.value?.setCurrentKey(v)
    }

    if (props.filterable) {
      await nextTick()
      filterInputRef.value?.focus()
    }
  },
  { immediate: true },
)

watch(
  () => props.modelValue,
  (v) => {
    if (props.multiple)
      return
    if (v == null || Array.isArray(v)) {
      treeRef.value?.setCurrentKey(undefined)
      return
    }
    treeRef.value?.setCurrentKey(v)
  },
)

watch(
  filterValue,
  (v) => {
    treeRef.value?.filter(v)
  },
)

function emitModel(next: GrTreeSelectModelValue) {
  emit('update:modelValue', next)
  emit('change', next)
}

function clear(): void {
  if (props.disabled || isReadonly.value)
    return

  const next: GrTreeSelectModelValue = props.multiple ? [] : null
  emitModel(next)
  emit('clear')
  if (!props.multiple)
    treeRef.value?.setCurrentKey(undefined)
}

/**
 * Отдаёт клавиатуру дереву. Панель под `v-show`, поэтому дерево уже в DOM, но
 * скрытый элемент сфокусировать нельзя — сначала открытие, потом кадр, потом
 * фокус. Дальше работают клавиши `GrTree`, а `Escape` возвращает фокус на
 * триггер силами общего стека слоёв.
 */
async function focusTree(): Promise<boolean> {
  if (!open.value)
    return false

  await nextTick()
  return treeRef.value?.focus() ?? false
}

function onTriggerKeydown(e: KeyboardEvent): void {
  if (props.disabled)
    return

  if (e.key === 'Escape') {
    e.preventDefault()
    closeDropdown()
    return
  }

  if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    openDropdown()

    // При `filterable` фокус уходит в поле поиска (см. watch на `open`), и
    // дальше в дерево ведёт стрелка уже оттуда.
    if (!props.filterable)
      void focusTree()
  }
}

/** Стрелка из поля поиска — единственный путь из фильтра в дерево. */
function onFilterKeydown(e: KeyboardEvent): void {
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')
    return

  e.preventDefault()
  void focusTree()
}

/** `Tab` уводит из панели — оставлять её открытой за спиной незачем. */
function onPanelKeydown(e: KeyboardEvent): void {
  if (e.key === 'Tab')
    closeDropdown()
}

function onNodeClick(data: T, node: GrTreeNode<T>): void {
  emit('nodeClick', data, node)

  if (props.disabled)
    return

  if (props.multiple) {
    const next = new Set(selectedKeySet.value)
    if (next.has(node.key))
      next.delete(node.key)
    else
      next.add(node.key)
    emitModel([...next])

    if (closeOnSelectResolved.value) {
      closeDropdown()
    }
    return
  }

  emitModel(node.key)
  if (closeOnSelectResolved.value) {
    closeDropdown()
  }
}

// Телепорт включается только ПОСЛЕ монтирования: иначе первый клиентский
// рендер не совпадает с серверным и ломается гидрация (см. композабл).
const teleportEnabled = useTeleportEnabled()

// Тема поддерева на телепортированную панель: в DOM она уезжает в `body`, то
// есть вне обёртки провайдера, и `data-theme` с неё не наследуется. В дереве
// компонентов панель остаётся внутри — `inject` доходит, и тему она ставит себе
// сама.
const themeAttrs = useGrThemeAttrs()
</script>

<template>
  <div
    ref="rootEl"
    v-click-outside="{ handler: onClickOutside, enabled: open, exclude: clickOutsideExclude }"
    data-gr-tree-select
    class="relative"
  >
    <div class="relative">
      <input
        :id="fieldId"
        ref="triggerEl"
        data-testid="gr-tree-select-trigger"
        data-gr-tree-select-trigger
        type="text"
        :value="displayValue"
        :placeholder="placeholder"
        :disabled="disabled"
        readonly
        role="combobox"
        aria-readonly="true"
        aria-haspopup="tree"
        :aria-expanded="open ? 'true' : 'false'"
        :aria-controls="open && hasTree ? treeId : undefined"
        :aria-invalid="isInvalid ? 'true' : undefined"
        :aria-required="isRequired ? 'true' : undefined"
        :aria-describedby="describedBy"
        :aria-label="ariaLabel"
        class="w-full rounded-md border placeholder:text-[var(--gr-muted-fg)] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
        :class="[className, $slots.value ? 'text-transparent placeholder:text-transparent' : '']"
        @pointerdown="onTriggerPointerDown"
        @click="toggleDropdown"
        @focus="onTriggerFocus"
        @keydown="onTriggerKeydown"
      >

      <button
        v-if="clearable && hasSelection && !disabled && !isReadonly"
        data-testid="gr-tree-select-clear"
        data-gr-tree-select-clear
        type="button"
        class="absolute top-1/2 -translate-y-1/2 right-3 h-6 w-6 inline-flex items-center justify-center rounded-md text-[var(--gr-muted-fg)] hover:text-[var(--gr-fg)] hover:bg-[color-mix(in_srgb,var(--gr-muted)_25%,transparent)]"
        :aria-label="t('gr.common.clear', 'Clear')"
        @click.stop="clear"
      >
        <span class="i-lucide-x inline-block h-4 w-4" />
      </button>

      <span
        v-else
        data-testid="gr-tree-select-chevron"
        data-gr-tree-select-chevron
        class="absolute top-1/2 -translate-y-1/2 right-3 text-[var(--gr-muted-fg)] pointer-events-none"
      >
        <span
          class="i-lucide-chevron-down inline-block h-4 w-4 transition-transform duration-150"
          :class="open ? 'rotate-180' : ''"
        />
      </span>

      <div
        v-if="$slots.value"
        class="absolute inset-y-0 left-3 right-9 flex items-center pointer-events-none"
      >
        <slot
          name="value"
          :value="modelValue"
          :labels="selectedLabels"
          :display-value="displayValue"
          :path-labels="selectedPathLabels"
        />
      </div>
    </div>

    <teleport to="body" :disabled="!teleportEnabled">
      <transition
        enter-active-class="transition ease-out duration-150"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-show="open"
          ref="panelEl"
          data-testid="gr-tree-select-panel"
          v-bind="themeAttrs"
          data-gr-tree-select-panel
          :style="floatingStyle"
          @keydown="onPanelKeydown"
        >
          <div :class="panelClasses">
          <div v-if="filterable" class="p-2 border-b border-[var(--gr-brd)]">
            <GrInput
              ref="filterInputRef"
              v-model="filterValue"
              data-testid="gr-tree-select-filter"
              data-gr-tree-select-filter
              type="search"
              :inputmode="filterInputmode"
              :placeholder="resolvedFilterPlaceholder"
              size="sm"
              @keydown="onFilterKeydown"
            />
          </div>

          <div
            class="p-1 overflow-auto"
            :style="{ maxHeight: `${dropdownMaxHeight}px` }"
          >
            <div
              v-if="loading"
              data-gr-tree-select-loading
              role="status"
              class="flex items-center gap-2 px-3 py-2 text-[13px] text-[var(--gr-muted-fg)]"
            >
              <slot name="loading">
                <span class="i-lucide-loader-circle block h-4 w-4 animate-spin" aria-hidden="true" />
                <span>{{ t('gr.treeSelect.loading', 'Loading…') }}</span>
              </slot>
            </div>

            <div v-else-if="(data?.length ?? 0) === 0" class="px-3 py-2 text-[13px] text-[var(--gr-muted-fg)]">
              <slot name="empty">
                {{ t('gr.treeSelect.empty', 'No data') }}
              </slot>
            </div>

            <GrTree
              v-else
              :id="treeId"
              ref="treeRef"
              :size="resolvedSize"
              :data="data"
              :props="props.props"
              :node-key="nodeKey as any"
              :default-expanded-keys="defaultExpandedKeys"
              :filter-node-method="filterNodeMethod"
              :highlight-current="!multiple"
              @node-click="onNodeClick"
            >
              <template #default="{ node, data }">
                <slot
                  name="node"
                  :node="node"
                  :data="data"
                  :selected="selectedKeySet.has(node.key)"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <span
                      class="inline-block h-4 w-4 shrink-0"
                      :class="selectedKeySet.has(node.key) ? 'i-lucide-check text-[var(--gr-primary)]' : ''"
                      aria-hidden="true"
                    />
                    <span class="truncate">{{ node.label }}</span>
                  </div>
                </slot>
              </template>
            </GrTree>
          </div>
        </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>
