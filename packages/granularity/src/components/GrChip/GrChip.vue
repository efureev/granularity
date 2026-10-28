<script setup lang="ts">
import type { VNode } from 'vue'
import { computed, inject, onBeforeUnmount, ref, useAttrs } from 'vue'

import IconClose from '~icons/lucide/x'

import { useGranularityTranslations } from '../../internal/granularityI18n'
import { useGrComponentProp, useGrComponentSize } from '../shared/configContext'

import type { GrChipValue } from '../shared/chipGroupContext'

import { warnRenamedProp } from '../shared/renamedProp'
import { hasMeaningfulSlotContent } from '../shared/slotNodes'
import { GR_CHIP_GROUP_CONTEXT } from '../shared/chipGroupContext'
import type { GrChipRadius, GrChipSize, GrChipTone } from './grChipStyles'
import { grChipLookAttrs } from './grChipStyles'

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
  /**
   * Тон чипа — те же цвета, что у `GrBadge`, чтобы в одном ряду они не расходились.
   * Не задан — из группы и `GrConfigProvider`, иначе `neutral`.
   */
  tone?: GrChipTone
  /** Заливка тоном вместо мягкой подложки — для чипа, который обязан выделяться. По умолчанию `false`. */
  dark?: boolean
  /**
   * Ступень контрольной шкалы: цель нажатия той же высоты, что у соседних полей.
   * Не задан — из группы и `GrConfigProvider`, иначе `md`.
   */
  size?: GrChipSize
  /**
   * Форма: `round` — таблетка, `semi` — ярлык, `square` — штамп.
   * Не задан — из группы и `GrConfigProvider`, иначе `round`.
   */
  radius?: GrChipRadius
  /** Чип становится переключателем: `aria-pressed`, `Enter`/`Space`. */
  selectable?: boolean
  /** Состояние переключателя вне группы. Внутри группы значение ведёт группа. */
  selected?: boolean
  /** Крестик. Внутри виджета он не кнопка — см. блок про роли ниже. */
  closable?: boolean
  /** Чип недоступен: не выбирается и не снимается, крестик скрыт. Внутри группы — и от её `disabled`. */
  disabled?: boolean
  /** Доступное имя, когда подпись не объясняет назначения. */
  ariaLabel?: string
  /** Имя кнопки снятия целиком. Перебивает собранное из `label`. */
  removeLabel?: string
  /**
   * `tabindex` кнопки снятия — для чипа внутри поля ввода.
   *
   * Там таб-стоп принадлежит `<input>`, а ряд чипов ходит стрелками: у
   * `GrInputTag` кольцо оставляет ровно один `0`, у `GrAutocomplete` их нет
   * вовсе. Проп нужен потому, что кольцом управляет родитель — он знает и
   * порядок чипов, и что стоит за краем ряда.
   */
  removeTabindex?: number
}

export interface GrChipEmits {
  /** Переключатель вне группы сменил состояние (`v-model:selected`); в группе выбор ведёт она. */
  (e: 'update:selected', value: boolean): void
  /** Чип просят снять — крестиком или `Delete`/`Backspace`. Удалить его из списка — забота родителя. */
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
  removeTabindex: undefined,
})

const emit = defineEmits<GrChipEmits>()

// `variant` переименован в `tone`: незнакомый атрибут Vue сажает на корневой
// узел, поэтому старое имя не роняет ни типы, ни рантайм — компонент молча
// рисуется дефолтным тоном.
warnRenamedProp('GrChip', useAttrs(), { variant: 'tone' })

const slots = defineSlots<{
  /** Подпись чипа. Внутри выбираемого чипа — только фразовое содержимое. */
  default?: () => unknown
  /** Иконка перед подписью. */
  icon?: () => unknown
}>()

/**
 * Подпись есть, если её дали пропом или слот что-то рисует. Чип из одного
 * значка (`aria-label` вместо подписи) пустого узла не получает: тот занимал
 * зазор `gap` после значка, и значок стоял левее середины.
 */
const hasLabel = computed(() => Boolean(props.label) || hasMeaningfulSlotContent((slots.default?.() ?? []) as VNode[]))

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
  if (inGroup.value && props.value !== undefined)
    return group!.isSelected(props.value)
  return props.selected
})

const isClosable = computed(() => {
  if (isReadonly.value || isDisabled.value)
    return false
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

const lookAttrs = computed(() => grChipLookAttrs({
  tone: resolvedTone.value,
  dark: resolvedDark.value,
  size: resolvedSize.value,
  radius: resolvedRadius.value,
  interactive: isInteractive.value && !isReadonly.value,
  selected: isSelected.value,
  disabled: isDisabled.value,
}))

/**
 * Группа с ошибкой — рамка невыбранных чипов ролью ошибки, как у полей ввода.
 * Инлайном, а не правилом листа: рамка ошибки обязана перебить и цвет тона, и
 * отклик нейтрального чипа на указатель, а правила тона лежат в листе `GrBadge`.
 */
const invalidStyle = computed(() => (
  inGroup.value && group!.invalid?.value && !isSelected.value && !isDisabled.value
    ? { borderColor: 'var(--gr-invalid-brd)' }
    : undefined
))

const removeTitle = computed(() => {
  if (props.removeLabel)
    return props.removeLabel
  if (props.label)
    return t('gr.chip.removeNamed', 'Remove {label}', { label: props.label })
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
  if (!inGroup.value)
    return undefined
  return group!.selection.value === 'single' ? 'radio' : 'option'
})

const tabindex = computed(() => {
  if (!isInteractive.value)
    return undefined
  if (isDisabled.value)
    return -1
  if (!inGroup.value || props.value === undefined)
    return 0
  return group!.rovingValue.value === props.value ? 0 : -1
})

function toggle(): void {
  if (isDisabled.value || isReadonly.value)
    return

  if (inGroup.value && props.value !== undefined) {
    group!.toggle(props.value)
    return
  }

  if (props.selectable)
    emit('update:selected', !props.selected)
}

function requestRemove(): void {
  if (!isClosable.value)
    return

  emit('remove')
  if (inGroup.value && props.value !== undefined)
    group!.requestRemove(props.value)
}

/**
 * Крестик внутри виджета — не кнопка, поэтому его клик приходит сюда же и
 * разбирается по цели. Тот же приём у `GrTabs`: внутрь роли-виджета вложенная
 * кнопка запрещена (axe: `nested-interactive`), а `<button>` внутри `<button>`
 * невалиден и по контент-модели HTML.
 */
function onRootClick(event: MouseEvent): void {
  if (isDisabled.value)
    return

  if (event.target instanceof Element && event.target.closest('[data-gr-chip-close]')) {
    requestRemove()
    return
  }

  toggle()
}

function onRootKeydown(event: KeyboardEvent): void {
  if (isDisabled.value)
    return

  // Навигация принадлежит группе: состав знает только она.
  if (inGroup.value && group!.handleNavigationKeys(event))
    return

  if (event.key === 'Delete' || event.key === 'Backspace') {
    if (!isClosable.value)
      return
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

const removeEl = ref<HTMLButtonElement | null>(null)

defineExpose({
  /** Фокус на чип из кода. Действует на интерактивный чип: простой чип — `span` без таб-стопа. */
  focus: () => rootEl.value?.focus(),
  /** Снять фокус с чипа. */
  blur: () => rootEl.value?.blur(),
  /**
   * Кнопка снятия — цель roving-фокуса у родителя. Отдаётся элементом, а не
   * методом `focusRemove`: кольцу нужен сам узел, оно само решает, когда и
   * куда переносить фокус.
   */
  removeEl,
})
</script>

<template>
  <component
    :is="isInteractive ? 'button' : 'span'"
    ref="rootEl"
    data-gr-chip
    :type="isInteractive ? 'button' : undefined"
    v-bind="lookAttrs"
    :style="invalidStyle"
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
    <span v-if="$slots.icon" data-gr-chip-icon>
      <slot name="icon" />
    </span>

    <span v-if="hasLabel" data-gr-chip-label>
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
      :title="removeTitle"
      aria-hidden="true"
    >
      <IconClose />
    </span>

    <button
      v-else-if="isClosable"
      ref="removeEl"
      data-gr-chip-close
      type="button"
      :aria-label="removeTitle"
      :tabindex="removeTabindex"
      @mousedown.prevent.stop
      @click.stop="requestRemove()"
    >
      <IconClose />
    </button>
  </component>
</template>

<style>
/*
 * Вид чипа — лист по атрибутам (`docs/markup-weight.md`). Цвета тона и радиусы
 * задаёт лист `GrBadge` по тем же атрибутам: чип стоит с бейджем в одном ряду и не
 * расходится с ним по цвету. Здесь — то, что у чипа своё.
 *
 * Размеры у чипа свои: по нему кликают, и цель нажатия обязана совпадать с
 * соседним контролом, а не с подписью. Отсюда контрольная шкала кегля и явная
 * высота — у метки её нет вовсе.
 */
[data-gr-chip] {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  border-width: 1px;
  vertical-align: middle;
  white-space: nowrap;
}

/*
 * Недоступный гасится токенами, а не `opacity`: прозрачность разбавляет выверенные
 * на AA токены текста и роняет контраст. Цвета тона под ним не остаются.
 */
[data-gr-chip][data-gr-off] {
  border-color: var(--gr-chip-disabled-brd, var(--gr-brd));
  background-color: var(--gr-chip-disabled-bg, var(--gr-muted));
  color: var(--gr-chip-disabled-fg, var(--gr-disabled-fg));
  cursor: not-allowed;
}

[data-gr-chip][data-gr-interactive] {
  cursor: pointer;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-duration: var(--gr-duration-fast);
  transition-timing-function: var(--gr-ease-out);
}

/* Нажимаемый нейтральный чип — не нейтральная метка: тема может поставить его на бумагу с рамкой поля. */
[data-gr-chip][data-gr-tone='neutral'][data-gr-interactive]:not([data-gr-dark]) {
  border-color: var(--gr-chip-neutral-brd);
  background-color: var(--gr-chip-neutral-bg);
  color: var(--gr-chip-neutral-fg);
}

[data-gr-chip][data-gr-tone='neutral'][data-gr-interactive]:not([data-gr-dark]):hover {
  border-color: var(--gr-chip-neutral-hover-brd);
  background-color: var(--gr-chip-neutral-hover-bg);
}

[data-gr-chip][data-gr-interactive]:focus,
[data-gr-chip-close]:is(button):focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

[data-gr-chip][data-gr-interactive]:focus-visible {
  box-shadow: 0 0 0 1px var(--gr-bg), 0 0 0 3px var(--gr-ring);
}

/*
 * Одной заливки выбранному мало: начертание — второй, нецветовой канал (WCAG 1.4.1).
 * Он же вытягивает набор, которому потребитель поставил `dark` целиком: заливка у
 * выбранного и невыбранного там совпадает.
 */
[data-gr-chip][data-gr-selected] {
  font-weight: 600;
}

[data-gr-chip][data-gr-size='xs'] {
  height: 1.5rem;
  gap: 0.25rem;
  padding-inline: 0.5rem;
  font-size: var(--gr-control-text-xs);
  line-height: var(--gr-control-leading-xs);
}

[data-gr-chip][data-gr-size='xs'] :is([data-gr-chip-icon], [data-gr-chip-close]) {
  width: 0.75rem;
  height: 0.75rem;
}

[data-gr-chip][data-gr-size='sm'] {
  height: 1.75rem;
  gap: 0.25rem;
  padding-inline: 0.625rem;
  font-size: var(--gr-control-text-sm);
  line-height: var(--gr-control-leading-sm);
}

[data-gr-chip][data-gr-size='sm'] :is([data-gr-chip-icon], [data-gr-chip-close]) {
  width: 0.875rem;
  height: 0.875rem;
}

[data-gr-chip][data-gr-size='md'] {
  height: 2rem;
  gap: 0.375rem;
  padding-inline: 0.75rem;
  font-size: var(--gr-control-text-md);
  line-height: var(--gr-control-leading-md);
}

[data-gr-chip][data-gr-size='md'] :is([data-gr-chip-icon], [data-gr-chip-close]) {
  width: 1rem;
  height: 1rem;
}

[data-gr-chip][data-gr-size='lg'] {
  height: 2.25rem;
  gap: 0.375rem;
  padding-inline: 0.875rem;
  font-size: var(--gr-control-text-lg);
  line-height: var(--gr-control-leading-lg);
}

[data-gr-chip][data-gr-size='lg'] :is([data-gr-chip-icon], [data-gr-chip-close]) {
  width: 1rem;
  height: 1rem;
}

/* Крестик и иконка не растут вместе с кеглем один в один — плитка бы разъехалась. */
[data-gr-chip-icon] {
  flex-shrink: 0;
}

/* Подпись жмётся, а не ломает ряд: чип с длинным тегом не должен рвать раскладку. */
[data-gr-chip-label] {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Крестик наследует цвет тона: своей роли у него нет, он часть плитки. */
[data-gr-chip-close] {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: var(--gr-radius-full);
  color: currentColor;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-duration: var(--gr-duration-fast);
  transition-timing-function: var(--gr-ease-out);
}

[data-gr-chip-close]:hover {
  background-color: color-mix(in srgb, currentColor 18%, transparent);
}

[data-gr-chip-close] > svg {
  width: 100%;
  height: 100%;
}

/*
 * Крестик-кнопка стоит в таб-порядке и обязана показывать фокус сама: она есть
 * только там, где чип не виджет, то есть кольца на корне нет.
 */
[data-gr-chip-close]:is(button) {
  cursor: pointer;
}

[data-gr-chip-close]:is(button):focus-visible {
  box-shadow: 0 0 0 2px var(--gr-ring);
}
</style>
