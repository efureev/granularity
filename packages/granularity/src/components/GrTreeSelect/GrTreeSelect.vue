<script setup lang="ts" generic="T extends Record<string, any> = any">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'

import { vClickOutside } from '../../directives'
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
    size: 'md',
    invalid: false,
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
}>()

const rootEl = ref<HTMLElement | null>(null)
const triggerEl = ref<HTMLInputElement | null>(null)
const filterInputRef = ref<InstanceType<typeof GrInput> | null>(null)
const treeRef = ref<GrTreeInstance | null>(null)
const panelEl = ref<HTMLElement | null>(null)

const clickOutsideExclude = [() => panelEl.value]

let hadPointerDownOnTrigger = false

const open = ref(false)
const filterValue = ref('')

const panelStyle = ref<Record<string, string>>({
  left: '0px',
  top: '0px',
  width: '0px',
  zIndex: '2147483647',
})

function syncPanelPosition(): void {
  if (typeof window === 'undefined')
    return

  const root = rootEl.value
  if (!root)
    return

  const rect = root.getBoundingClientRect()

  panelStyle.value = {
    left: `${rect.left}px`,
    top: `${rect.bottom + 8}px`,
    width: `${rect.width}px`,
    zIndex: '2147483647',
  }
}

function bindPanelPositionListeners(): void {
  if (typeof window === 'undefined')
    return
  window.addEventListener('resize', syncPanelPosition)
  window.addEventListener('scroll', syncPanelPosition, true)
}

function unbindPanelPositionListeners(): void {
  if (typeof window === 'undefined')
    return
  window.removeEventListener('resize', syncPanelPosition)
  window.removeEventListener('scroll', syncPanelPosition, true)
}

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

const resolvedFilterPlaceholder = computed(() => {
  return props.filterPlaceholder ?? t('gr.treeSelect.filterPlaceholder', 'Search…')
})

const className = computed(() => {
  return grTreeSelectClass({
    size: props.size,
    state: props.state,
    invalid: props.invalid,
  })
})

const panelClasses = computed(() => {
  return grTreeSelectPanelClass
})

function setOpen(next: boolean) {
  if (props.disabled)
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

function closeDropdown(): void {
  setOpen(false)
}

function toggleDropdown(): void {
  setOpen(!open.value)
}

function onTriggerPointerDown(): void {
  hadPointerDownOnTrigger = true
  if (typeof window !== 'undefined') {
    window.setTimeout(() => {
      hadPointerDownOnTrigger = false
    }, 0)
  }
  else {
    // SSR / no window: reset sync
    hadPointerDownOnTrigger = false
  }
}

function onTriggerFocus(): void {
  if (hadPointerDownOnTrigger)
    return
  openDropdown()
}

function closeOnEscape(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    closeDropdown()
    nextTick(() => triggerEl.value?.focus())
  }
}

watch(
  open,
  async (isOpen) => {
    if (typeof document === 'undefined')
      return

    document.removeEventListener('keydown', closeOnEscape)
    unbindPanelPositionListeners()

    if (isOpen)
      document.addEventListener('keydown', closeOnEscape)

    if (!isOpen)
      return

    bindPanelPositionListeners()
    await nextTick()
    syncPanelPosition()

    // sync tree highlight
    if (!props.multiple) {
      const v = props.modelValue
      if (v != null && !Array.isArray(v))
        treeRef.value?.setCurrentKey(v)
    }

    // focus filter input
    if (props.filterable) {
      await nextTick()
      filterInputRef.value?.focus()
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  if (typeof document === 'undefined')
    return
  document.removeEventListener('keydown', closeOnEscape)
  unbindPanelPositionListeners()
})

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

watch(
  open,
  (isOpen) => {
    if (isOpen)
      return
    if (filterValue.value.trim().length > 0)
      filterValue.value = ''
  },
)

function emitModel(next: GrTreeSelectModelValue) {
  emit('update:modelValue', next)
  emit('change', next)
}

function clear(): void {
  if (props.disabled)
    return

  const next: GrTreeSelectModelValue = props.multiple ? [] : null
  emitModel(next)
  emit('clear')
  if (!props.multiple)
    treeRef.value?.setCurrentKey(undefined)
}

function onTriggerKeydown(e: KeyboardEvent): void {
  if (props.disabled)
    return

  if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    openDropdown()
  }
  if (e.key === 'Escape') {
    e.preventDefault()
    closeDropdown()
  }
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
</script>

<template>
  <div
    ref="rootEl"
    v-click-outside="{ handler: onClickOutside, enabled: open, exclude: clickOutsideExclude }"
    data-ds-tree-select
    class="relative"
  >
    <div class="relative">
      <input
        ref="triggerEl"
        data-testid="ds-tree-select-trigger"
        data-ds-tree-select-trigger
        type="text"
        :value="displayValue"
        :placeholder="placeholder"
        :disabled="disabled"
        readonly
        role="combobox"
        aria-readonly="true"
        :aria-expanded="open ? 'true' : 'false'"
        :aria-invalid="invalid ? 'true' : undefined"
        class="w-full rounded-md border bg-[var(--bg)] text-[var(--fg)] placeholder:text-[var(--muted-fg)] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-50 disabled:cursor-not-allowed"
        :class="[className, $slots.value ? 'text-transparent placeholder:text-transparent' : '']"
        @pointerdown="onTriggerPointerDown"
        @click="toggleDropdown"
        @focus="onTriggerFocus"
        @keydown="onTriggerKeydown"
      >

      <button
        v-if="clearable && hasSelection"
        data-testid="ds-tree-select-clear"
        data-ds-tree-select-clear
        type="button"
        class="absolute top-1/2 -translate-y-1/2 right-3 h-6 w-6 inline-flex items-center justify-center rounded-md text-[var(--muted-fg)] hover:text-[var(--fg)] hover:bg-[color-mix(in_srgb,var(--muted)_25%,transparent)] disabled:opacity-50"
        :disabled="disabled"
        :aria-label="t('gr.common.clear', 'Clear')"
        @click.stop="clear"
      >
        <span class="i-lucide-x h-4 w-4" />
      </button>

      <span
        v-else
        data-testid="ds-tree-select-chevron"
        data-ds-tree-select-chevron
        class="absolute top-1/2 -translate-y-1/2 right-3 text-[var(--muted-fg)] pointer-events-none"
      >
        <span
          class="i-lucide-chevron-down h-4 w-4 transition-transform duration-150"
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

    <teleport to="body">
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
          data-testid="ds-tree-select-panel"
          data-ds-tree-select-panel
          class="fixed w-full"
          :style="panelStyle"
        >
          <div :class="panelClasses">
          <div v-if="filterable" class="p-2 border-b border-[var(--brd)]">
            <GrInput
              ref="filterInputRef"
              v-model="filterValue"
              data-testid="ds-tree-select-filter"
              data-ds-tree-select-filter
              type="search"
              :inputmode="filterInputmode"
              :placeholder="resolvedFilterPlaceholder"
              size="sm"
            />
          </div>

          <div
            class="p-1 overflow-auto"
            :style="{ maxHeight: `${dropdownMaxHeight}px` }"
          >
            <div v-if="(data?.length ?? 0) === 0" class="px-3 py-2 text-[13px] text-[var(--muted-fg)]">
              <slot name="empty">
                {{ t('gr.treeSelect.empty', 'No data') }}
              </slot>
            </div>

            <GrTree
              v-else
              ref="treeRef"
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
                      class="h-4 w-4 shrink-0"
                      :class="selectedKeySet.has(node.key) ? 'i-lucide-check text-[var(--primary)]' : ''"
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
