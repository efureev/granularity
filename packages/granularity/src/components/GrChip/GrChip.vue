<script setup lang="ts">
import { computed, inject, onBeforeUnmount, ref } from 'vue'

import IconClose from '~icons/lucide/x'

import { useGranularityTranslations } from '../../internal/granularityI18n'
import { useGrComponentProp, useGrComponentSize } from '../GrConfigProvider/context'

import type { GrChipValue } from './grChipGroupContext'
import { GR_CHIP_GROUP_CONTEXT } from './grChipGroupContext'
import type { GrChipRadius, GrChipSize, GrChipTone } from './grChipStyles'
import {
  chipCloseButtonClass,
  chipCloseClass,
  chipIconClass,
  chipIconSizeClassBySize,
  chipLabelClass,
  grChipClass,
} from './grChipStyles'

/**
 * Интерактивный тег: снимаемый, выбираемый, с иконкой.
 *
 * От `GrBadge` отличается не видом, а природой: бейдж — метка, чип — виджет.
 * Поэтому цвета и радиусы взяты у бейджа как есть (в одном ряду они обязаны
 * совпадать), а роль, клавиатура и размеры — свои.
 */
export interface GrChipProps {
  /** Значение чипа в группе. Вне `GrChipGroup` не используется. */
  value?: GrChipValue
  /**
   * Подпись. Нужна отдельно от слота: из неё собирается имя кнопки снятия —
   * «Убрать» на двадцати кнопках подряд не даёт выбрать нужную.
   */
  label?: string
  tone?: GrChipTone
  dark?: boolean
  size?: GrChipSize
  radius?: GrChipRadius
  /** Чип становится переключателем: `aria-pressed`, `Enter`/`Space`. */
  selectable?: boolean
  /** Состояние переключателя вне группы. Внутри группы значение ведёт группа. */
  selected?: boolean
  /** Крестик. Внутри виджета он не кнопка — см. блок про роли ниже. */
  closable?: boolean
  disabled?: boolean
  /** Доступное имя, когда подпись не объясняет назначения. */
  ariaLabel?: string
  /** Имя кнопки снятия целиком. Перебивает собранное из `label`. */
  removeLabel?: string
}

export interface GrChipEmits {
  (e: 'update:selected', value: boolean): void
  (e: 'remove'): void
}

const props = withDefaults(defineProps<GrChipProps>(), {
  value: undefined,
  label: undefined,
  // Дефолты живут в резолверах ниже: Vue подставил бы свой раньше, чем
  // компонент заглянет в `GrConfigProvider`.
  tone: undefined,
  dark: undefined,
  size: undefined,
  radius: undefined,
  selectable: false,
  selected: false,
  closable: false,
  disabled: false,
  ariaLabel: undefined,
  removeLabel: undefined,
})

const emit = defineEmits<GrChipEmits>()

defineSlots<{
  /** Подпись чипа. Внутри выбираемого чипа — только фразовое содержимое. */
  default?: () => unknown
  /** Иконка перед подписью. */
  icon?: () => unknown
}>()

const { t } = useGranularityTranslations()

const group = inject(GR_CHIP_GROUP_CONTEXT, null)
const rootEl = ref<HTMLElement | null>(null)

const inGroup = computed(() => group !== null && props.value !== undefined)

const isDisabled = computed(() => props.disabled || (group?.disabled.value ?? false))
const isReadonly = computed(() => group?.readonly.value ?? false)

/**
 * Чип — виджет ровно тогда, когда по нему кликают.
 *
 * От этого зависит вся разметка: у виджета роль, `tabindex` и клавиатура, а
 * крестик внутри него перестаёт быть кнопкой.
 */
const isInteractive = computed(() => inGroup.value || props.selectable)

const isSelected = computed(() => {
  if (inGroup.value && props.value !== undefined) return group!.isSelected(props.value)
  return props.selected
})

const isClosable = computed(() => {
  if (isReadonly.value || isDisabled.value) return false
  return props.closable || (inGroup.value ? group!.closable.value : false)
})

// Приоритет: локальный проп → значение группы → `GrConfigProvider` → дефолт.
// Группа специфичнее конфига, поэтому её значение подаётся как «локальное».
const resolvedSize = useGrComponentSize<GrChipSize>(
  () => props.size ?? (inGroup.value ? group!.size.value : undefined),
  { component: 'GrChip' },
)
const resolvedTone = useGrComponentProp(
  'GrChip',
  'tone',
  () => props.tone ?? (inGroup.value ? group!.tone.value : undefined),
  'neutral',
)
const resolvedRadius = useGrComponentProp(
  'GrChip',
  'radius',
  () => props.radius ?? (inGroup.value ? group!.radius.value : undefined),
  'round',
)
const resolvedDark = useGrComponentProp(
  'GrChip',
  'dark',
  () => props.dark ?? (inGroup.value ? group!.dark.value : undefined),
  false,
)

const rootClass = computed(() => grChipClass({
  tone: resolvedTone.value,
  dark: resolvedDark.value,
  size: resolvedSize.value,
  radius: resolvedRadius.value,
  interactive: isInteractive.value && !isReadonly.value,
  selected: isSelected.value,
  disabled: isDisabled.value,
}))

const iconSizeClass = computed(() => chipIconSizeClassBySize[resolvedSize.value])

const removeTitle = computed(() => {
  if (props.removeLabel) return props.removeLabel
  if (props.label) return t('gr.chip.removeNamed', 'Remove {label}', { label: props.label })
  return t('gr.chip.remove', 'Remove')
})

/**
 * Роль чипа задаёт группа, а не потребитель.
 *
 * Одиночный переключатель — кнопка с `aria-pressed`; в группе роль зависит от
 * множественности выбора: `radio` в одиночной (образец — `GrSegmented`),
 * `option` во множественной, где контейнер объявлен `listbox` c
 * `aria-multiselectable`.
 */
const chipRole = computed(() => {
  if (!inGroup.value) return undefined
  return group!.selection.value === 'single' ? 'radio' : 'option'
})

const tabindex = computed(() => {
  if (!isInteractive.value) return undefined
  if (isDisabled.value) return -1
  if (!inGroup.value || props.value === undefined) return 0
  return group!.rovingValue.value === props.value ? 0 : -1
})

function toggle(): void {
  if (isDisabled.value || isReadonly.value) return

  if (inGroup.value && props.value !== undefined) {
    group!.toggle(props.value)
    return
  }

  if (props.selectable) emit('update:selected', !props.selected)
}

function requestRemove(): void {
  if (!isClosable.value) return

  emit('remove')
  if (inGroup.value && props.value !== undefined) group!.requestRemove(props.value)
}

/**
 * Крестик внутри виджета — не кнопка, поэтому его клик приходит сюда же и
 * разбирается по цели. Тот же приём у `GrTabs`: внутрь роли-виджета вложенная
 * кнопка запрещена (axe: `nested-interactive`), а `<button>` внутри `<button>`
 * невалиден и по контент-модели HTML.
 */
function onRootClick(event: MouseEvent): void {
  if (isDisabled.value) return

  if (event.target instanceof Element && event.target.closest('[data-gr-chip-close]')) {
    requestRemove()
    return
  }

  toggle()
}

function onRootKeydown(event: KeyboardEvent): void {
  if (isDisabled.value) return

  // Навигация принадлежит группе: состав знает только она.
  if (inGroup.value && group!.handleNavigationKeys(event)) return

  if (event.key === 'Delete' || event.key === 'Backspace') {
    if (!isClosable.value) return
    event.preventDefault()
    requestRemove()
  }
}

if (group) {
  const unregister = group.register({
    value: () => props.value as GrChipValue,
    disabled: () => isDisabled.value,
    el: () => rootEl.value,
  })
  onBeforeUnmount(unregister)
}

defineExpose({
  focus: () => rootEl.value?.focus(),
  blur: () => rootEl.value?.blur(),
})
</script>

<template>
  <component
    :is="isInteractive ? 'button' : 'span'"
    ref="rootEl"
    data-gr-chip
    :type="isInteractive ? 'button' : undefined"
    :class="rootClass"
    :role="chipRole"
    :data-value="value"
    :aria-label="ariaLabel"
    :aria-checked="chipRole === 'radio' ? (isSelected ? 'true' : 'false') : undefined"
    :aria-selected="chipRole === 'option' ? (isSelected ? 'true' : 'false') : undefined"
    :aria-pressed="isInteractive && !chipRole ? (isSelected ? 'true' : 'false') : undefined"
    :aria-disabled="isDisabled ? 'true' : undefined"
    :disabled="isInteractive && isDisabled ? true : undefined"
    :aria-keyshortcuts="isInteractive && isClosable ? 'Delete' : undefined"
    :tabindex="tabindex"
    @click="isInteractive ? onRootClick($event) : undefined"
    @keydown="isInteractive ? onRootKeydown($event) : undefined"
  >
    <span v-if="$slots.icon" data-gr-chip-icon :class="[chipIconClass, iconSizeClass]">
      <slot name="icon" />
    </span>

    <span data-gr-chip-label :class="chipLabelClass">
      <slot>{{ label }}</slot>
    </span>

    <!--
      Крестик существует в двух видах, и различитель — роль самого чипа.
      Виджет: `<span aria-hidden>` вне таб-порядка, снятие идёт `Delete`/`Backspace`.
      Не виджет: настоящая кнопка со своей остановкой `Tab` и своим именем.
    -->
    <span
      v-if="isClosable && isInteractive"
      data-gr-chip-close
      :class="[chipCloseClass, iconSizeClass]"
      :title="removeTitle"
      aria-hidden="true"
    >
      <IconClose class="h-full w-full" />
    </span>

    <button
      v-else-if="isClosable"
      data-gr-chip-close
      type="button"
      :class="[chipCloseButtonClass, iconSizeClass]"
      :aria-label="removeTitle"
      @mousedown.prevent.stop
      @click.stop="requestRemove()"
    >
      <IconClose class="h-full w-full" />
    </button>
  </component>
</template>
