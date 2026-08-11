<script setup lang="ts" generic="T extends Record<string, any> = any">
import { computed, nextTick, ref, useId, useSlots, watch } from 'vue'

import { usePortalTarget } from '../../composables/usePortalTarget'

import { vClickOutside } from '../../directives'
import { useFloating } from '../../composables/useFloating'
import { useOverlayLayer } from '../../composables/useOverlayLayer'
import { useControlAddons } from '../../composables/internal/useControlAddons'
import { useControlledOpen } from '../../composables/internal/useControlledOpen'
import { useGrComponentSize, useGrThemeAttrs } from '../GrConfigProvider/context'
import { useGrFormControl } from '../../composables/useGrFormControl'
import { useFocusWithin } from '../../composables/internal/useFocusWithin'
import { useGrFormFieldContext } from '../GrFormField/context'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import GrInput from '../GrInput/GrInput.vue'
import GrTree, {
  type GrTreeInstance,
  type GrTreeKey,
  type GrTreeNode,
} from '../GrTree'
import type { GrInputSize } from '../GrInput/GrInput.vue'
import type { GrTreeSelectModelValue, GrTreeSelectProps } from './grTreeSelectTypes'
import { grTreeSelectClass, grTreeSelectPanelClass, grTreeSelectStateClass, paddingX, trailingZoneWidth } from './grTreeSelectStyles'

export interface GrTreeSelectEmits<T extends Record<string, any> = any> {
  (e: 'update:modelValue', value: GrTreeSelectModelValue): void
  (e: 'change', value: GrTreeSelectModelValue): void
  /** Панель открылась/закрылась (`v-model:open`). */
  (e: 'update:open', value: boolean): void
  /**
   * Панель открылась/закрылась.
   * @deprecated Используйте `update:open` (`v-model:open`); алиас будет снят после 1.0.
   */
  (e: 'visibleChange', visible: boolean): void
  (e: 'clear'): void
  (e: 'nodeClick', data: T, node: GrTreeNode<T>): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}

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
    showCheckbox: false,
    checkStrictly: false,
    clearable: false,
    open: undefined,
    name: undefined,
    valueDisplay: 'label',
    filterable: false,
    filterPlaceholder: undefined,
    filterInputmode: undefined,
    filterNodeMethod: undefined,
    closeOnSelect: undefined,
    dropdownMaxHeight: 320,
    virtual: false,
    prefixMinWidth: undefined,
    prefixMaxWidth: undefined,
    suffixMinWidth: undefined,
    suffixMaxWidth: undefined,
    prefixFixed: false,
    suffixFixed: false,
  },
)

const { t } = useGranularityTranslations()

const emit = defineEmits<GrTreeSelectEmits<T>>()

defineSlots<{
  /** Рендер значения внутри триггера (вместо дефолтного текста). */
  value?: (props: { value: GrTreeSelectModelValue; labels: string[]; displayValue: string; pathLabels?: string[] }) => any
  /** Рендер строки дерева. */
  node?: (props: { node: GrTreeNode<T>; data: T; selected: boolean }) => any
  /** Содержимое пустого состояния (когда нет данных). */
  empty?: () => any
  /** Содержимое панели, пока данные едут. */
  loading?: () => any
  /** Аддон слева от значения: иконка, код валюты, метка. */
  prefix?: () => any
  /** Аддон справа от значения, перед крестиком и шевроном. */
  suffix?: () => any
}>()

const rootEl = ref<HTMLElement | null>(null)
const triggerEl = ref<HTMLInputElement | null>(null)
const treeId = `gr-tree-select-tree-${useId()}`

// Контекст `GrFormField` + общий контракт форм-контрола.
const field = useGrFormFieldContext()
const fieldId = computed(() => field?.id.value)
const describedBy = computed(() => field?.describedById.value)
const {
  disabled: isDisabled,
  invalid: isInvalid, required: isRequired, readonly: isReadonly } = useGrFormControl(() => props)

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

// Панель телепортирована в `body`, то есть лежит вне корня, но для пользователя
// она часть контрола: без неё уход фокуса в панель читался бы как `blur`.
const { onFocusIn, onFocusOut } = useFocusWithin(rootEl, {
  enter: event => emit('focus', event),
  leave: event => emit('blur', event),
  containers: () => [panelEl.value],
})

const clickOutsideExclude = [() => panelEl.value]

let hadPointerDownOnTrigger = false

// Имя `open` сохранено: читатели работают с computed-Ref.
const { open, setOpen: setOpenState } = useControlledOpen(
  () => props.open,
  (next) => {
    emit('update:open', next)
    emit('visibleChange', next)
  },
)
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
    disabled: isDisabled.value,
  })
})

const panelClasses = computed(() => {
  return grTreeSelectPanelClass
})

const ADDON_MIN_WIDTH_BY_SIZE: Record<GrInputSize, string> = {
  xs: '2rem',
  sm: '2.25rem',
  md: '2.5rem',
  lg: '3rem',
}

const slots = useSlots()

const {
  hasPrefix,
  hasSuffix,
  prefixEl,
  suffixEl,
  prefixStyle,
  suffixStyle,
  fieldPadding: triggerStyle,
} = useControlAddons(() => props, {
  defaultMinWidth: () => ADDON_MIN_WIDTH_BY_SIZE[resolvedSize.value],
  paddingX: () => paddingX[resolvedSize.value],
  // Место под крестик и шеврон уже отдано классом `pr-9`, но инлайн-паддинг
  // перекрывает класс целиком — с суффиксом эту зону приходится вернуть числом.
  trailingReserve: () => (slots.suffix ? trailingZoneWidth : '0px'),
})

// Слот `value` рисуется поверх поля и обязан жить в тех же границах, что и
// текст под ним. Без аддонов границы задаёт класс — стиль остаётся пустым.
const valueOverlayStyle = computed(() => ({
  left: hasPrefix.value ? triggerStyle.value.paddingLeft : undefined,
  right: hasSuffix.value ? triggerStyle.value.paddingRight : undefined,
}))

function setOpen(next: boolean) {
  if (isDisabled.value || isReadonly.value)
    return

  setOpenState(next)
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
  if (isDisabled.value || isReadonly.value)
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
  if (isDisabled.value)
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

// Чекбоксы осмысленны только в множественном выборе: одиночный уже подсвечен
// текущим узлом.
const checkboxMode = computed(() => props.multiple && props.showCheckbox)

// В режиме чекбоксов каскад по родителям и детям считает `GrTree`, а не копия
// его логики здесь: значение приходит обратно одним `update:checkedKeys`.
function onCheckedKeys(keys: GrTreeKey[]): void {
  if (isDisabled.value || isReadonly.value)
    return

  emitModel([...keys])
}

function onNodeClick(data: T, node: GrTreeNode<T>): void {
  emit('nodeClick', data, node)

  if (isDisabled.value)
    return

  if (checkboxMode.value) {
    // Клик по строке — тот же переключатель отметки, что и сам чекбокс;
    // значение придёт через `update:checkedKeys`, поэтому здесь не эмитим.
    treeRef.value?.setChecked(node.key, !selectedKeySet.value.has(node.key))
    return
  }

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
const { target: portalTarget, enabled: teleportEnabled } = usePortalTarget()

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
     @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <!-- Нативная форма: hidden на каждый выбранный ключ. -->
    <template v-if="name">
      <input
        v-for="key in selectedKeys"
        :key="`hidden-${String(key)}`"
        type="hidden"
        :name="name"
        :value="String(key)"
      >
    </template>
    <div class="relative">
      <div
        v-if="hasPrefix"
        ref="prefixEl"
        data-gr-tree-select-prefix
        class="absolute inset-y-px left-px flex items-center justify-center rounded-l-[var(--gr-radius-control)] border-r border-[var(--gr-brd)] px-2 text-[var(--gr-muted-fg)] pointer-events-none select-none truncate"
        :style="prefixStyle"
        aria-hidden="true"
      >
        <slot name="prefix" />
      </div>

      <input
        :id="fieldId"
        ref="triggerEl"
        data-testid="gr-tree-select-trigger"
        data-gr-tree-select-trigger
        type="text"
        :value="displayValue"
        :placeholder="placeholder"
        :disabled="isDisabled"
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
        class="w-full rounded-[var(--gr-radius-control)] border placeholder:text-[var(--gr-muted-fg)] transition-colors duration-[var(--gr-duration-fast)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
        :class="[className, $slots.value ? 'text-transparent placeholder:text-transparent' : '']"
        :style="triggerStyle"
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
        class="absolute top-1/2 -translate-y-1/2 right-3 h-6 w-6 inline-flex items-center justify-center rounded-[var(--gr-radius-control)] text-[var(--gr-muted-fg)] hover:text-[var(--gr-fg)] hover:bg-[color-mix(in_srgb,var(--gr-muted)_25%,transparent)]"
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
          class="i-lucide-chevron-down inline-block h-4 w-4 transition-transform duration-[var(--gr-duration-fast)]"
          :class="open ? 'rotate-180' : ''"
        />
      </span>

      <div
        v-if="hasSuffix"
        ref="suffixEl"
        data-gr-tree-select-suffix
        class="absolute inset-y-px right-9 flex items-center justify-center border-l border-[var(--gr-brd)] px-2 text-[var(--gr-muted-fg)] pointer-events-none select-none truncate"
        :class="suffixFixed ? '[direction:rtl]' : ''"
        :style="suffixStyle"
        aria-hidden="true"
      >
        <slot name="suffix" />
      </div>

      <div
        v-if="$slots.value"
        class="absolute inset-y-0 left-3 right-9 flex items-center pointer-events-none"
        :style="valueOverlayStyle"
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

    <teleport :to="portalTarget" :disabled="!teleportEnabled">
      <transition
        enter-active-class="transition ease-[var(--gr-ease-out)] duration-[var(--gr-duration-fast)]"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-[var(--gr-ease-in)] duration-[var(--gr-duration-fast)]"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-show="open"
          ref="panelEl"
          data-testid="gr-tree-select-panel"
          v-bind="themeAttrs"
          data-gr-tree-select-panel
          data-gr-overlay-root
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

          <!--
            Скроллер один. При виртуализации его берёт на себя дерево: своя
            высота нужна ему, чтобы посчитать окно, а вложенный скроллер поверх
            дал бы вторую полосу прокрутки на том же списке.
          -->
          <div
            class="p-1"
            :class="virtual ? '' : 'overflow-auto'"
            :style="virtual ? undefined : { maxHeight: `${dropdownMaxHeight}px` }"
          >
            <div
              v-if="loading"
              data-gr-tree-select-loading
              role="status"
              :class="grTreeSelectStateClass"
            >
              <slot name="loading">
                <span class="i-lucide-loader-circle block h-4 w-4 animate-spin" aria-hidden="true" />
                <span>{{ t('gr.treeSelect.loading', 'Loading…') }}</span>
              </slot>
            </div>

            <div v-else-if="(data?.length ?? 0) === 0" :class="grTreeSelectStateClass">
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
              :virtual="virtual"
              :max-height="dropdownMaxHeight"
              :show-checkbox="checkboxMode"
              :check-strictly="checkStrictly"
              :checked-keys="selectedKeys"
              @node-click="onNodeClick"
              @update:checked-keys="onCheckedKeys"
            >
              <template #default="{ node, data }">
                <slot
                  name="node"
                  :node="node"
                  :data="data"
                  :selected="selectedKeySet.has(node.key)"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <!-- Чекбокс дерева уже показывает отметку: вторая галочка
                         рядом читалась бы как ошибка. -->
                    <span
                      v-if="!checkboxMode"
                      data-gr-tree-select-check
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
