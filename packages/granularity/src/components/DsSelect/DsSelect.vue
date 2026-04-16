<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'

import DsInput from '../DsInput/DsInput.vue'
import { vClickOutside } from '../../directives'
export type {
  DsSelectModelValue,
  DsSelectOption,
  DsSelectOptionsView,
  DsSelectSize,
  DsSelectUnderline,
  DsSelectVariant,
  DsSelectView,
} from './dsSelectStyles'

import {
  dsSelectNativeClass,
  dsSelectPanelClasses,
  dsSelectTriggerClass,
  type DsSelectModelValue,
  type DsSelectOption,
  type DsSelectOptionsView,
  type DsSelectSize,
  type DsSelectUnderline,
  type DsSelectVariant,
  type DsSelectView,
} from './dsSelectStyles'

const props = withDefaults(
  defineProps<{
    modelValue: DsSelectModelValue
    options?: DsSelectOption[]
    disabled?: boolean
    ariaLabel?: string
    view?: DsSelectView
    size?: DsSelectSize

    /** Placeholder (показывается, когда значение не выбрано). */
    placeholder?: string

    /** Multiple selection. */
    multiple?: boolean

    /** Как отображать список опций: нативный `<select>` или кастомная панель. */
    optionsView?: DsSelectOptionsView

    /** Разрешает ввод/выбор значения, которого нет в `options`. */
    allowCustomValue?: boolean

    /** Placeholder для инпута кастомного значения (только в `optionsView="panel"`). */
    customValuePlaceholder?: string

    /** Максимальная высота панели (только в `optionsView="panel"`). */
    dropdownMaxHeight?: number

    /** Закрывать панель после выбора (только в `optionsView="panel"`). */
    closeOnSelect?: boolean

    /** Разрешает очистку выбранного значения. */
    clearable?: boolean

    /**
     * Цвет/вариант ссылки для `view="link"` (аналогично `DsLink`).
     * В `view="default"` не используется.
     */
    variant?: DsSelectVariant

    /**
     * Подчёркивание для `view="link"` (аналогично `DsLink`).
     * В `view="default"` не используется.
     */
    underline?: DsSelectUnderline
  }>(),
  {
    options: undefined,
    disabled: false,
    ariaLabel: undefined,
    view: 'default',
    size: 'md',

    placeholder: undefined,
    multiple: false,

    optionsView: 'native',
    allowCustomValue: false,
    customValuePlaceholder: 'Add value…',
    dropdownMaxHeight: 280,
    closeOnSelect: true,
    clearable: false,
    variant: 'primary',
    underline: 'auto',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: DsSelectModelValue): void
}>()

const optionsResolved = computed(() => props.options ?? [])

function modelToArray(value: DsSelectModelValue): string[] {
  if (Array.isArray(value)) return value
  if (!value) return []
  return [value]
}

const modelSingle = computed(() => {
  return Array.isArray(props.modelValue) ? (props.modelValue[0] ?? '') : props.modelValue
})

const modelMultiple = computed(() => modelToArray(props.modelValue))

const selectedValues = computed(() => {
  return props.multiple ? modelMultiple.value : (modelSingle.value ? [modelSingle.value] : [])
})

const hasSelection = computed(() => selectedValues.value.length > 0)

const selectedOptions = computed<DsSelectOption[]>(() => {
  const byValue = new Map(optionsResolved.value.map(o => [o.value, o]))
  return selectedValues.value.map((v) => byValue.get(v) ?? { value: v, label: v })
})

const hasModelInOptions = computed(() => {
  if (props.multiple) return false
  return optionsResolved.value.some((o) => o.value === modelSingle.value)
})

const displayLabel = computed(() => {
  if (props.multiple) {
    if (!selectedValues.value.length) return ''
    return selectedValues.value
      .map((v) => optionsResolved.value.find((o) => o.value === v)?.label ?? v)
      .join(', ')
  }

  return optionsResolved.value.find((o) => o.value === modelSingle.value)?.label ?? modelSingle.value
})

const displayText = computed(() => {
  if (hasSelection.value) return displayLabel.value
  return props.placeholder ?? ''
})

const nativeCustomOptionVisible = computed(() => {
  if (!props.allowCustomValue) return false
  if (props.optionsView !== 'native') return false
  if (props.multiple) return false
  if (!props.options) return false
  if (modelSingle.value === '') return false
  return !hasModelInOptions.value
})

const customValue = ref('')
const open = ref(false)
const rootEl = ref<HTMLElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)
const customInputRef = ref<InstanceType<typeof DsInput> | null>(null)
const clickOutsideExclude = [() => panelEl.value]
const panelStyle = ref<Record<string, string>>({
  left: '0px',
  top: '0px',
  width: '0px',
  zIndex: '2147483647',
})

function syncPanelPosition(): void {
  if (typeof window === 'undefined') return

  const root = rootEl.value
  if (!root) return

  const rect = root.getBoundingClientRect()

  panelStyle.value = {
    left: `${rect.left}px`,
    top: `${rect.bottom + 8}px`,
    width: `${rect.width}px`,
    zIndex: '2147483647',
  }
}

function bindPanelPositionListeners(): void {
  if (typeof window === 'undefined') return
  window.addEventListener('resize', syncPanelPosition)
  window.addEventListener('scroll', syncPanelPosition, true)
}

function unbindPanelPositionListeners(): void {
  if (typeof window === 'undefined') return
  window.removeEventListener('resize', syncPanelPosition)
  window.removeEventListener('scroll', syncPanelPosition, true)
}

function closeDropdown(): void {
  open.value = false
}

function toggleDropdown(): void {
  if (props.disabled) return
  open.value = !open.value
}

function closeOnEscape(e: KeyboardEvent): void {
  if (e.key === 'Escape') closeDropdown()
}

watch(
  open,
  async (isOpen) => {
    if (typeof document === 'undefined') return

    document.removeEventListener('keydown', closeOnEscape)
    unbindPanelPositionListeners()

    if (isOpen) document.addEventListener('keydown', closeOnEscape)

    if (!isOpen) {
      customValue.value = ''
      return
    }

    bindPanelPositionListeners()
    await nextTick()
    syncPanelPosition()

    if (props.allowCustomValue) {
      customInputRef.value?.focus()
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  if (typeof document === 'undefined') return
  document.removeEventListener('keydown', closeOnEscape)
  unbindPanelPositionListeners()
})

const panelClasses = computed(() => {
  return dsSelectPanelClasses
})

const visibleOptions = computed(() => {
  const base = optionsResolved.value

  const withCustom = (() => {
    if (!props.allowCustomValue) return base
    if (props.multiple) return base
    if (modelSingle.value === '') return base
    if (hasModelInOptions.value) return base
    return [{ value: modelSingle.value, label: modelSingle.value }, ...base]
  })()

  if (!props.allowCustomValue) return withCustom

  const q = customValue.value.trim().toLowerCase()
  if (!q) return withCustom

  return withCustom.filter((o) => {
    return o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
  })
})

const canAddCustom = computed(() => {
  if (!props.allowCustomValue) return false
  if (props.optionsView !== 'panel') return false
  const v = customValue.value.trim()
  if (!v) return false

  if (props.multiple) {
    if (selectedValues.value.includes(v)) return false
    return !optionsResolved.value.some((o) => o.value === v)
  }

  if (v === modelSingle.value) return false
  return !optionsResolved.value.some((o) => o.value === v)
})

function emitValue(value: DsSelectModelValue): void {
  emit('update:modelValue', value)
}

function isSelected(value: string): boolean {
  return selectedValues.value.includes(value)
}

function selectValue(value: string): void {
  emitValue(value)
  if (props.closeOnSelect) {
    closeDropdown()
  }
}

function toggleValue(value: string): void {
  if (!props.multiple) {
    selectValue(value)
    return
  }

  const next = selectedValues.value.slice()
  const idx = next.indexOf(value)
  if (idx >= 0) {
    next.splice(idx, 1)
  }
  else {
    next.push(value)
  }

  emitValue(next)
  if (props.closeOnSelect) {
    closeDropdown()
  }
}

function addCustom(): void {
  const v = customValue.value.trim()
  if (!v) return
  toggleValue(v)
}

const showNativeChevron = computed(() => {
  return props.optionsView === 'native' && props.view !== 'link' && !props.multiple
})

const nativeClearOptionVisible = computed(() => {
  if (!props.clearable) return false
  if (props.optionsView !== 'native') return false
  if (props.multiple) return false
  if (!props.options) return true
  return !props.options.some(o => o.value === '')
})

const panelClearVisible = computed(() => {
  if (!props.clearable) return false
  if (props.optionsView !== 'panel') return false
  if (props.view === 'link') return false
  return hasSelection.value
})

const nativeClassName = computed(() => {
  return dsSelectNativeClass({
    view: props.view,
    size: props.size,
    disabled: props.disabled,
    variant: props.variant,
    underline: props.underline,
    showNativeChevron: showNativeChevron.value,
  })
})

const triggerClassName = computed(() => {
  return dsSelectTriggerClass({
    view: props.view,
    optionsView: props.optionsView,
    size: props.size,
    disabled: props.disabled,
    variant: props.variant,
    underline: props.underline,
  })
})

function onChange(e: Event): void {
  const el = e.target as HTMLSelectElement

  if (props.multiple) {
    const values = Array.from(el.selectedOptions, o => o.value)
    emit('update:modelValue', values)
    return
  }

  emit('update:modelValue', el.value)
}

function clearSelection(): void {
  if (props.disabled) return
  emitValue(props.multiple ? [] : '')
}
</script>

<template>
  <div
    v-if="props.optionsView === 'native'"
    :class="props.view === 'link' ? 'relative inline-block align-baseline' : 'relative w-full'"
  >
    <select
      :value="props.multiple ? modelMultiple : modelSingle"
      :multiple="props.multiple"
      :disabled="props.disabled"
      :aria-label="props.ariaLabel"
      :class="[
        props.view === 'link'
          ? 'cursor-pointer inline-block w-auto align-baseline appearance-none bg-transparent border border-transparent px-0 py-0 rounded-[6px] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]'
          : 'w-full rounded-md border border-[var(--brd)] bg-[var(--bg)] text-[var(--fg)] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
        nativeClassName,
      ]"
      @change="onChange"
    >
      <option v-if="nativeClearOptionVisible" value="" />

      <slot>
        <option v-if="nativeCustomOptionVisible" :value="modelSingle">
          {{ modelSingle }}
        </option>
        <option v-for="opt in props.options" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </slot>
    </select>

    <span
      v-if="showNativeChevron"
      data-testid="ds-select-chevron"
      class="absolute top-1/2 -translate-y-1/2 right-3 text-[var(--muted-fg)] pointer-events-none"
    >
      <span class="i-lucide-chevron-down h-4 w-4" aria-hidden="true" />
    </span>
  </div>

  <div
    v-else
    ref="rootEl"
    v-click-outside="{ handler: closeDropdown, enabled: open, exclude: clickOutsideExclude }"
    :class="props.view === 'link' ? 'relative inline-block align-baseline' : 'relative w-full'"
  >
    <button
      data-testid="ds-select-trigger"
      type="button"
      :disabled="props.disabled"
      :aria-label="props.ariaLabel"
      role="combobox"
      aria-readonly="true"
      :aria-expanded="open ? 'true' : 'false'"
      :class="[
        props.view === 'link'
          ? 'cursor-pointer inline-block w-auto align-baseline appearance-none bg-transparent border border-transparent px-0 py-0 rounded-[6px] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]'
          : 'w-full rounded-md border border-[var(--brd)] bg-[var(--bg)] text-[var(--fg)] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
        triggerClassName,
      ]"
      @click="toggleDropdown"
    >
      <span class="min-w-0 flex-1">
        <slot
          name="value"
          :selected-options="selectedOptions"
          :selected-values="selectedValues"
          :display-label="displayLabel"
          :placeholder="props.placeholder"
          :has-selection="hasSelection"
        >
          <span
            class="block truncate"
            :class="!hasSelection ? 'text-[var(--muted-fg)]' : ''"
          >
            {{ displayText }}
          </span>
        </slot>
      </span>

      <span
        v-if="panelClearVisible"
        class="shrink-0 h-4 w-4"
        aria-hidden="true"
      />

      <span
        v-else
        data-testid="ds-select-chevron"
        class="shrink-0 text-[var(--muted-fg)] pointer-events-none"
      >
        <span class="i-lucide-chevron-down h-4 w-4" aria-hidden="true" />
      </span>
    </button>

    <button
      v-if="panelClearVisible"
      data-testid="ds-select-clear"
      type="button"
      class="absolute top-1/2 -translate-y-1/2 right-3 h-6 w-6 inline-flex items-center justify-center rounded-md text-[var(--muted-fg)] hover:text-[var(--fg)] hover:bg-[color-mix(in_srgb,var(--muted)_25%,transparent)] disabled:opacity-50"
      :disabled="props.disabled"
      aria-label="Clear"
      @click.stop="clearSelection"
    >
      <span class="i-lucide-x h-4 w-4" aria-hidden="true" />
    </button>

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
          data-testid="ds-select-panel"
          class="fixed w-full"
          :style="panelStyle"
        >
          <div :class="panelClasses">
            <div v-if="props.allowCustomValue" class="p-2 border-b border-[var(--brd)]">
              <DsInput
                ref="customInputRef"
                v-model="customValue"
                data-testid="ds-select-custom-input"
                type="text"
                :placeholder="props.customValuePlaceholder"
                size="sm"
                @keydown.enter.prevent="addCustom"
              />
            </div>

            <div
              class="p-1 overflow-auto"
              :style="{ maxHeight: `${props.dropdownMaxHeight}px` }"
              role="listbox"
              :aria-multiselectable="props.multiple ? 'true' : undefined"
            >
              <button
                v-if="canAddCustom"
                data-testid="ds-select-add-option"
                type="button"
                class="w-full rounded-[10px] px-3 py-2 text-left text-[13px] hover:bg-[color-mix(in_srgb,var(--muted)_30%,transparent)]"
                @click="addCustom"
              >
                Add “{{ customValue.trim() }}”
              </button>

              <button
                v-for="opt in visibleOptions"
                :key="opt.value"
                type="button"
                role="option"
                :aria-selected="isSelected(opt.value) ? 'true' : 'false'"
                class="w-full rounded-[10px] px-3 py-2 text-left text-[13px] hover:bg-[color-mix(in_srgb,var(--muted)_30%,transparent)]"
                @click="toggleValue(opt.value)"
              >
                <slot name="option" :option="opt" :selected="isSelected(opt.value)">
                  <span class="flex items-center gap-2 min-w-0">
                    <span
                      class="h-4 w-4 shrink-0"
                      :class="isSelected(opt.value) ? 'i-lucide-check text-[var(--primary)]' : ''"
                      aria-hidden="true"
                    />
                    <span class="truncate">{{ opt.label }}</span>
                  </span>
                </slot>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>
