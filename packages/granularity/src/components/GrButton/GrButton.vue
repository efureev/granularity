<script setup lang="ts">
import { computed, markRaw, ref, Text, useAttrs, useSlots, type Component } from 'vue'

import IconExternal from '~icons/lucide/external-link'
import IconLoader from '~icons/lucide/loader-circle'

import { useGrComponentProp, useGrComponentSize } from '../shared/configContext'
import { useGrButtonGroup } from '../shared/buttonGroupContext'
import { useGrFormContext } from '../shared/formContext'
import { provideGrIconSizeHint } from '../shared/iconSizeHint'
import { definedAttrs } from '../shared/polymorphicRoot'
import { meaningfulSlotNodes } from '../shared/slotNodes'
import { titleWhenTruncated } from '../shared/truncationTitle'
import { useGranularityTranslations } from '../../internal/granularityI18n'

export type { GrButtonSize, GrButtonTone, GrButtonVariant } from './grButtonStyles'

import {
  grButtonLookAttrs,
  type GrButtonLoadingIndicator,
  type GrButtonSize,
  type GrButtonTone,
  type GrButtonVariant,
} from './grButtonStyles'

export interface GrButtonProps {
  /**
   * Вес кнопки: `primary` — заливка тона, `secondary` — мягкая подложка с
   * рамкой, `outline` — только рамка, `ghost` — только текст, `ghost-border` —
   * текст, рамка которого проявляется под указателем. По умолчанию `primary`;
   * глобально — `componentDefaults`.
   */
  variant?: GrButtonVariant
  /**
   * Смысл действия: цвет заливки, рамки и текста. `danger` — для необратимого,
   * `neutral` — для второстепенного. По умолчанию `primary`; внутри
   * `GrButtonGroup` — тон группы.
   */
  tone?: GrButtonTone
  /** Высота и кегль по шкале контролов. По умолчанию `md`; берётся из группы и `GrConfigProvider`. */
  size?: GrButtonSize
  /**
   * Действие выполняется: спиннер на месте префикса, а без него — поверх
   * подписи, ширина не меняется; `aria-busy` и перехват клика. Кнопка при этом
   * остаётся в фокусе — нативный `disabled` не ставится.
   */
  loading?: boolean
  /**
   * Вид загрузки. `spinner` — спиннер; `shimmer` — свет проходит по подписи, а
   * подпись, иконки и ширина остаются на месте. Без текстовой подписи (кнопка из
   * иконки) мерцать нечему — там спиннер. `track` — отрезок бежит по нижней
   * кромке, содержимое на месте. По умолчанию `spinner`; тема меняет его через
   * `componentDefaults` («Глина» — `shimmer`, «Чертёж» — `track`).
   */
  loadingIndicator?: GrButtonLoadingIndicator
  /**
   * Префикс в квадратной ячейке высотой с кнопку, за перегородкой. Только с
   * подписью: у квадратной кнопки ячейка и есть кнопка. По умолчанию `false`;
   * тема включает её через `componentDefaults` («Чертёж»).
   */
  prefixCell?: boolean
  /** i18n: что именно грузится. `aria-busy` сам по себе часть AT не объявляет. */
  loadingText?: string
  /**
   * Действие недоступно: нативный `disabled` у `<button>`, у кнопки-ссылки —
   * `aria-disabled` и снятый адрес. Цвета — из токенов, без прозрачности.
   */
  disabled?: boolean
  /** Равные стороны — кнопка из одной иконки. Без текста ей нужен `ariaLabel`. */
  square?: boolean
  /** Кнопка на всю ширину контейнера. */
  block?: boolean
  /** Нативный `type` у `<button>`. По умолчанию `button`: кнопка в форме не отправляет её сама. */
  type?: 'button' | 'submit' | 'reset'
  /** Доступное имя кнопки, когда текста нет: `square` с одной иконкой без него безымянна. */
  ariaLabel?: string
  /** Полиморфизм: кастомный корневой тег/компонент (например, RouterLink). */
  as?: string | Component
  /** Рендерит кнопку как `<a href>` (если не задан `as`). */
  href?: string
  /** `target` кнопки-ссылки. С `_blank` сам добавляется `rel="noopener noreferrer"`. */
  target?: string
  /** `rel` кнопки-ссылки. Без него при `target="_blank"` ставится `noopener noreferrer`. */
  rel?: string
  /**
   * Открывать ссылку в новой вкладке: `target="_blank"` и `rel="noopener noreferrer"`.
   * Уход объявляется заранее — значком справа и скрытым текстом в имени.
   */
  external?: boolean
}

const props = withDefaults(
  defineProps<GrButtonProps>(),
  {
    // `variant`/`tone`/`size`/`square` настраиваются через `GrConfigProvider`,
    // поэтому их дефолты живут в резолверах ниже, а не здесь: Vue подставил бы
    // дефолт до того, как компонент успеет заглянуть в конфиг.
    variant: undefined,
    tone: undefined,
    size: undefined,
    loading: false,
    loadingIndicator: undefined,
    prefixCell: undefined,
    loadingText: undefined,
    disabled: false,
    square: undefined,
    block: false,
    type: 'button',
    ariaLabel: undefined,
    as: undefined,
    href: undefined,
    target: undefined,
    rel: undefined,
    external: false,
  },
)

// Эффективные значения: проп кнопки → группа → `GrConfigProvider` → дефолт.
// Группа ближе к кнопке, чем глобальный провайдер, поэтому она подставляется
// как «локальное» значение — и побеждает конфиг, но не собственный проп.
const group = useGrButtonGroup()

const resolvedSize = useGrComponentSize(() => props.size ?? group?.size.value, { component: 'GrButton' })
// В лотке звено — прозрачная кнопка, а выбранное (`aria-pressed`/`aria-current`)
// — лист поверх лотка: нейтральная плашка с рамкой. Свой вес кнопки сильнее.
const inTray = computed(() => group?.appearance?.value === 'tray')
const attrs = useAttrs()
const pressedInTray = computed(() => inTray.value && ['true', 'page', 'step', 'location', 'date', 'time'].includes(String(attrs['aria-pressed'] ?? attrs['aria-current'] ?? '')))
// Вне лотка вид нажатия — только у переключателя: `aria-current` у ссылки — это
// навигация, и её вид решает раскладка, а не кнопка.
const isToggledOn = computed(() => String(attrs['aria-pressed'] ?? '') === 'true')
const resolvedVariant = useGrComponentProp('GrButton', 'variant', () => props.variant ?? (inTray.value ? (pressedInTray.value ? 'secondary' : 'ghost') : group?.variant.value), 'primary')
const resolvedTone = useGrComponentProp('GrButton', 'tone', () => props.tone ?? group?.tone.value ?? (inTray.value ? 'neutral' : undefined), 'primary')
const isSquare = useGrComponentProp('GrButton', 'square', () => props.square, false)
const resolvedLoadingIndicator = useGrComponentProp('GrButton', 'loadingIndicator', () => props.loadingIndicator, 'spinner')
const resolvedPrefixCell = useGrComponentProp('GrButton', 'prefixCell', () => props.prefixCell, false)

const iconSizeBySize: Record<GrButtonSize, GrButtonSize> = { xs: 'xs', sm: 'sm', md: 'sm', lg: 'lg' }
provideGrIconSizeHint(computed(() => iconSizeBySize[resolvedSize.value]))

const { t } = useGranularityTranslations()
const resolvedLoadingText = computed(() => props.loadingText ?? t('gr.button.loading', 'Loading…'))

// Полиморфный корень: `as` → `<a href>` → `<button>`.
const isLink = computed(() => Boolean(props.as || props.href))
const renderAs = computed<string | Component>(() => {
  if (props.as)
    return typeof props.as === 'string' ? props.as : markRaw(props.as)
  return props.href ? 'a' : 'button'
})

/**
 * Кнопка отправки выключенной формы выключена и сама.
 *
 * `GrForm disabled` гасит контролы через контекст поля, а кнопка под полями
 * в `GrFormField` не живёт — и «выключенную» форму можно было отправить ещё
 * раз. Только `type="submit"`: «Отмена» и «Сбросить» остаются рабочими.
 */
const form = useGrFormContext()
const isDisabled = computed(() => props.disabled || (
  props.type === 'submit' && !props.as && !props.href && Boolean(form?.disabled?.value)
))

// Неинтерактивно при `disabled` ИЛИ во время `loading`.
const blocked = computed(() => isDisabled.value || props.loading)

// Нажатый переключатель вне лотка: в лотке выбранное несёт вес звена, а не нажатие.
const isPressed = computed(() => isToggledOn.value && !inTray.value && !isDisabled.value)

// Ключевое: `loading` НЕ ставит нативный `disabled` (элемент бы выпал из фокуса и
// скринридер потерял бы контекст) — вместо этого `aria-disabled` + перехват клика.
// Нативный `disabled` (только у `<button>`) оставляем лишь для явного `disabled`.
const nativeDisabled = computed(() => (renderAs.value === 'button' && isDisabled.value) ? true : undefined)
const ariaDisabled = computed(() => (props.loading || (isLink.value && isDisabled.value)) ? 'true' : undefined)

// `aria-disabled="true"` снаружи — кнопка, которую потребитель держит в фокусе,
// но объявляет недоступной (у `GrTransfer` — перенос, которому некуда ехать).
// Скринридер слышит «недоступна», значит и глаз должен видеть то же: вид
// отключённой, без нативного `disabled`. Раньше вид подправлял лист потребителя,
// но он живёт в слое `granum.components` и цветам варианта — утилитам из
// `granum.utilities` — проигрывал всегда.
const looksDisabled = computed(() => isDisabled.value || attrs['aria-disabled'] === 'true' || attrs['aria-disabled'] === true)

const resolvedTarget = computed(() => props.target ?? (props.external ? '_blank' : undefined))
const resolvedRel = computed(() => props.rel ?? (resolvedTarget.value === '_blank' ? 'noopener noreferrer' : undefined))

/**
 * Смена контекста объявляется заранее (WCAG 3.2.5) — так же, как у `GrLink`:
 * условие — ссылка реально уводит в новую вкладку, а не проп `external`.
 */
const opensInNewTab = computed(() => isLink.value && !isDisabled.value && resolvedTarget.value === '_blank')
const newTabHint = computed(() => t('gr.button.opensInNewTab', 'opens in a new tab'))

// `aria-label` перекрывает содержимое вместе со скрытой подсказкой — дописываем её к нему.
const resolvedAriaLabel = computed(() => {
  if (!props.ariaLabel)
    return undefined
  return opensInNewTab.value ? `${props.ariaLabel}, ${newTabHint.value}` : props.ariaLabel
})

const slots = useSlots()

// Слоты нереактивны, поэтому их разбор — функции, которые зовёт рендер, а не
// computed: кэш не узнал бы, что родитель убрал аддон.
function hasSlotContent(name: 'prefix' | 'suffix'): boolean {
  const slot = slots[name]
  return slot ? meaningfulSlotNodes(slot()).length > 0 : false
}

/**
 * Подпись из одного текста оборачивается — только так её можно обрезать
 * многоточием. Иконку или разметку в основном слоте не трогаем: обёртка
 * сдвинула бы их выравнивание.
 */
function labelIsText(): boolean {
  const nodes = slots.default ? meaningfulSlotNodes(slots.default()) : []
  return nodes.length > 0 && nodes.every(node => node.type === Text)
}

/**
 * Без префикса спиннеру некуда встать, и он ложится поверх содержимого — ширина
 * кнопки не меняется, соседи не едут. С префиксом спиннер занимает его место.
 */
function spinnerOverContent(): boolean {
  return props.loading && !shimmerLabel() && !trackLoading() && !hasSlotContent('prefix')
}

/** Загрузка мерцанием подписи — только у текстовой подписи: у иконки мерцать нечему. */
function shimmerLabel(): boolean {
  return props.loading && resolvedLoadingIndicator.value === 'shimmer' && labelIsText()
}

/** Загрузка отрезком по нижней кромке: содержимое на месте, кромка есть у любой кнопки. */
function trackLoading(): boolean {
  return props.loading && resolvedLoadingIndicator.value === 'track'
}

/** Спиннер на месте префикса: две иконки рядом читались бы как ошибка. */
function spinnerInPrefix(): boolean {
  return props.loading && !shimmerLabel() && !trackLoading() && !spinnerOverContent()
}

function prefixInCell(): boolean {
  return resolvedPrefixCell.value && !isSquare.value && hasSlotContent('prefix')
}

const rootAttrs = computed(() => {
  const liveLink = isLink.value && !isDisabled.value
  const own = definedAttrs({
    'type': renderAs.value === 'button' ? props.type : undefined,
    'disabled': nativeDisabled.value,
    'href': liveLink ? props.href : undefined,
    'target': liveLink ? resolvedTarget.value : undefined,
    'rel': liveLink ? resolvedRel.value : undefined,
    'aria-busy': props.loading ? 'true' : undefined,
    'aria-disabled': ariaDisabled.value,
    'aria-label': resolvedAriaLabel.value,
    'tabindex': isLink.value && isDisabled.value ? -1 : undefined,
  })

  // Выключенная ссылка остаётся без адреса и у компонента-ссылки: `undefined`
  // здесь нарочно ложится поверх `href`, который тот вычислил сам. С адресом
  // средняя кнопка и «открыть в новой вкладке» обошли бы перехват клика.
  return isLink.value && isDisabled.value ? { ...own, href: undefined } : own
})

function onClickCapture(e: MouseEvent): void {
  // Блокируем и дефолт (submit/навигация), и внешние обработчики (в т.ч. по Enter/Space),
  // сохраняя фокус на элементе.
  if (blocked.value) {
    e.preventDefault()
    e.stopImmediatePropagation()
  }
}

// Корень динамический (`as` принимает и тег, и компонент), поэтому ref может
// оказаться как элементом, так и инстансом — например роутерной ссылкой.
const rootEl = ref<HTMLElement | { $el?: HTMLElement } | null>(null)

/**
 * Фокус на кнопку из кода. Нужен там, где окно обязано открываться с фокусом
 * на конкретном действии (`GrConfirmDialog`), и потребителю не должно быть
 * важно, тегом или компонентом отрисован корень.
 */
function focus(): void {
  const root = rootEl.value
  const el = root instanceof HTMLElement ? root : root?.$el
  el?.focus?.()
}

function blur(): void {
  const root = rootEl.value
  const el = root instanceof HTMLElement ? root : root?.$el
  el?.blur?.()
}

defineExpose({
  /** Поставить фокус на кнопку — и когда корень тег, и когда компонент из `as`. */
  focus,
  /** Снять фокус с кнопки. */
  blur,
})

function lookAttrs(): Record<string, string | undefined> {
  const square = isSquare.value

  return grButtonLookAttrs({
    variant: resolvedVariant.value,
    tone: resolvedTone.value,
    size: resolvedSize.value,
    square,
    block: props.block,
    off: looksDisabled.value,
    prefix: !square && hasSlotContent('prefix'),
    prefixCell: prefixInCell(),
    suffix: !square && (hasSlotContent('suffix') || opensInNewTab.value),
  })
}

defineSlots<{
  /** Содержимое кнопки. */
  default?: () => any
  /** Аддон слева: иконка, счётчик. В состоянии загрузки уступает место спиннеру. */
  prefix?: () => any
  /** Аддон справа: шеврон, счётчик. */
  suffix?: () => any
}>()
</script>

<template>
  <component
    :is="renderAs"
    ref="rootEl"
    data-gr-button
    :data-gr-pressed="isPressed ? '' : undefined"
    :data-gr-busy-overlay="spinnerOverContent() ? '' : undefined"
    :data-gr-busy-shimmer="shimmerLabel() ? '' : undefined"
    :data-gr-busy-track="trackLoading() ? '' : undefined"
    v-bind="{ ...lookAttrs(), ...rootAttrs }"
    @click.capture="onClickCapture"
  >
    <span v-if="prefixInCell()" data-gr-button-cell>
      <IconLoader v-if="spinnerInPrefix()" class="animate-spin" data-gr-button-glyph aria-hidden="true" />
      <slot v-else name="prefix" />
    </span>
    <IconLoader v-else-if="spinnerInPrefix()" class="animate-spin" data-gr-button-glyph aria-hidden="true" />
    <slot v-else-if="!props.loading || shimmerLabel() || trackLoading()" name="prefix" />

    <span v-if="labelIsText()" data-gr-button-label @mouseenter="titleWhenTruncated">
      <slot />
    </span>
    <slot v-else />

    <slot name="suffix" />

    <!--
      Необязательное — двумя группами: каждая ложная ветка `v-if` оставляет в разметке
      комментарий-якорь, а кнопок на странице десятки. Загрузка идёт раньше стрелки: её
      части лежат поверх (`position: absolute`) и в раскладку не встают, а скрытый текст
      загрузки в имени кнопки звучит раньше подсказки о новой вкладке.
    -->
    <template v-if="props.loading">
      <span v-if="spinnerOverContent()" data-gr-button-spinner aria-hidden="true">
        <IconLoader class="animate-spin" data-gr-button-glyph />
      </span>
      <span v-else-if="trackLoading()" data-gr-button-track aria-hidden="true"><span /></span>
      <span class="sr-only">{{ resolvedLoadingText }}</span>
    </template>

    <template v-if="opensInNewTab">
      <IconExternal v-if="!isSquare" data-gr-button-glyph aria-hidden="true" />
      <span v-if="!props.ariaLabel" class="sr-only">({{ newTabHint }})</span>
    </template>
  </component>
</template>

<style>
/*
 * Вид кнопки — лист по атрибутам, а не утилиты: вес (`data-gr-variant`), тон
 * (`data-gr-tone`), ступень (`data-gr-size`) и флаги ставит компонент. Кнопок на
 * странице десятки, и вид, записанный в разметку каждой, умножался бы на них.
 * Утилиты потребителя живут в слое `granum.utilities`, лист — в
 * `granum.components`, поэтому класс на кнопке перекрывает её вид предсказуемо.
 *
 * Фокус — `outline` с отступом, а не кольцо: кольцо вплотную к заливке того же
 * тона читалось утолщением кнопки, а `box-shadow` в forced-colors выключается
 * целиком; `outline` там остаётся и перекрашивается в системный цвет.
 *
 * Радиус углов — ручка приложения `--gr-button-radius`, иначе радиус ступени.
 */
[data-gr-button] {
  --gr-button-corner-radius: var(--gr-button-radius, var(--gr-button-step-radius));
  position: relative;
  isolation: isolate;
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  justify-content: center;
  -webkit-user-select: none;
  user-select: none;
  white-space: nowrap;
  font-weight: var(--gr-button-font-weight);
  border-start-start-radius: var(--gr-button-radius-ss, var(--gr-button-corner-radius));
  border-start-end-radius: var(--gr-button-radius-se, var(--gr-button-corner-radius));
  border-end-end-radius: var(--gr-button-radius-ee, var(--gr-button-corner-radius));
  border-end-start-radius: var(--gr-button-radius-es, var(--gr-button-corner-radius));
  transition-property: color, background-color, border-color, box-shadow, transform, outline-offset;
  transition-timing-function: var(--gr-button-motion-ease);
  transition-duration: var(--gr-button-motion-duration);
  outline: 2px solid transparent;
  outline-offset: var(--gr-button-focus-offset-from);
}

@media (prefers-reduced-motion: reduce) {
  [data-gr-button] {
    outline-offset: var(--gr-button-focus-offset);
  }
}

[data-gr-button]:focus-visible {
  outline-style: solid;
  outline-width: 2px;
  outline-offset: var(--gr-button-focus-offset);
  outline-color: var(--gr-ring);
}

[data-gr-button]:disabled,
[data-gr-button][data-gr-off] {
  cursor: not-allowed;
}

/* Ждущая сервер кнопка не запрещена, а занята — курсор говорит именно это. */
[data-gr-button][aria-busy='true']:not([data-gr-off]) {
  cursor: progress;
}

[data-gr-button][data-gr-block] {
  width: 100%;
}

[data-gr-button][data-gr-square] {
  padding: 0;
}

/*
 * Ступени: высота, кегль и зазор — без боковых отступов у квадрата. Квадрат —
 * через `--gr-button-square-size` с размерным дефолтом: потребитель подгоняет
 * кнопку под свою сетку переменной. Аддон сбоку снимает 2px отступа, чтобы глиф
 * стоял оптически по центру. Свои глифы — спиннер и стрелка внешней ссылки —
 * растут со ступенью, как иконка: 14 / 16 / 16 / 20.
 */
[data-gr-button][data-gr-size='xs'] {
  --gr-button-step-radius: var(--gr-button-radius-xs);
}

[data-gr-button][data-gr-size='xs']:not([data-gr-square]) {
  height: 1.75rem;
  gap: .25rem;
  padding-inline: .625rem;
  font-size: var(--gr-text-xs);
  line-height: var(--gr-leading-xs);
}

[data-gr-button][data-gr-size='xs'][data-gr-pre] {
  padding-inline-start: .5rem;
}

[data-gr-button][data-gr-size='xs'][data-gr-post] {
  padding-inline-end: .5rem;
}

[data-gr-button][data-gr-size='xs'][data-gr-square] {
  width: var(--gr-button-square-size, 1.75rem);
  min-width: var(--gr-button-square-size, 1.75rem);
  height: var(--gr-button-square-size, 1.75rem);
}

[data-gr-button][data-gr-size='xs'] [data-gr-button-glyph] {
  width: .875rem;
  height: .875rem;
}

[data-gr-button][data-gr-size='sm'] {
  --gr-button-step-radius: var(--gr-button-radius-sm);
}

[data-gr-button][data-gr-size='sm']:not([data-gr-square]) {
  height: 2rem;
  gap: .375rem;
  padding-inline: .75rem;
  font-size: var(--gr-text-sm);
  line-height: var(--gr-leading-sm);
}

[data-gr-button][data-gr-size='sm'][data-gr-pre] {
  padding-inline-start: .625rem;
}

[data-gr-button][data-gr-size='sm'][data-gr-post] {
  padding-inline-end: .625rem;
}

[data-gr-button][data-gr-size='sm'][data-gr-square] {
  width: var(--gr-button-square-size, 2rem);
  min-width: var(--gr-button-square-size, 2rem);
  height: var(--gr-button-square-size, 2rem);
}

[data-gr-button][data-gr-size='sm'] [data-gr-button-glyph] {
  width: 1rem;
  height: 1rem;
}

[data-gr-button][data-gr-size='md'] {
  --gr-button-step-radius: var(--gr-button-radius-md);
}

[data-gr-button][data-gr-size='md']:not([data-gr-square]) {
  height: 2.5rem;
  gap: .5rem;
  padding-inline: 1rem;
  font-size: var(--gr-text-sm);
  line-height: var(--gr-leading-sm);
}

[data-gr-button][data-gr-size='md'][data-gr-pre] {
  padding-inline-start: .875rem;
}

[data-gr-button][data-gr-size='md'][data-gr-post] {
  padding-inline-end: .875rem;
}

[data-gr-button][data-gr-size='md'][data-gr-square] {
  width: var(--gr-button-square-size, 2.5rem);
  min-width: var(--gr-button-square-size, 2.5rem);
  height: var(--gr-button-square-size, 2.5rem);
}

[data-gr-button][data-gr-size='md'] [data-gr-button-glyph] {
  width: 1rem;
  height: 1rem;
}

[data-gr-button][data-gr-size='lg'] {
  --gr-button-step-radius: var(--gr-button-radius-lg);
}

[data-gr-button][data-gr-size='lg']:not([data-gr-square]) {
  height: 2.75rem;
  gap: .5rem;
  padding-inline: 1.25rem;
  font-size: var(--gr-text-base);
  line-height: var(--gr-leading-base);
}

[data-gr-button][data-gr-size='lg'][data-gr-pre] {
  padding-inline-start: 1.125rem;
}

[data-gr-button][data-gr-size='lg'][data-gr-post] {
  padding-inline-end: 1.125rem;
}

[data-gr-button][data-gr-size='lg'][data-gr-square] {
  width: var(--gr-button-square-size, 2.75rem);
  min-width: var(--gr-button-square-size, 2.75rem);
  height: var(--gr-button-square-size, 2.75rem);
}

[data-gr-button][data-gr-size='lg'] [data-gr-button-glyph] {
  width: 1.25rem;
  height: 1.25rem;
}

/* Префикс в ячейке: отступа с начала нет, его место — у ячейки. После ступеней — иначе их отступ перебил бы. */
[data-gr-button][data-gr-size][data-gr-cell] {
  padding-inline-start: 0;
}

/*
 * Тон — переменные, которые читают веса: так весу не нужно правило на каждый
 * тон. Значения — токены темы `--gr-button-<тон>-*` и роли текста тона.
 */
[data-gr-button][data-gr-tone='primary'] {
  --gr-button-tone-bg: var(--gr-button-primary-bg);
  --gr-button-tone-bg-hover: var(--gr-button-primary-bg-hover);
  --gr-button-tone-bg-active: var(--gr-button-primary-bg-active);
  --gr-button-tone-fg: var(--gr-button-primary-fg);
  --gr-button-tone-text: var(--gr-accent-fg);
  --gr-button-tone-soft-bg: var(--gr-button-primary-soft-bg);
  --gr-button-tone-soft-bg-hover: var(--gr-button-primary-soft-bg-hover);
  --gr-button-tone-soft-bg-active: var(--gr-button-primary-soft-bg-active);
  --gr-button-tone-soft-fg: var(--gr-accent-fg);
  --gr-button-tone-ghost-bg-hover: var(--gr-button-primary-ghost-bg-hover);
  --gr-button-tone-ghost-bg-active: var(--gr-button-primary-ghost-bg-active);
  --gr-button-tone-border: var(--gr-button-primary-border);
  --gr-button-tone-border-hover: var(--gr-button-primary-border-hover);
  --gr-button-tone-border-active: var(--gr-button-primary-border-active);
  --gr-button-tone-border-soft: var(--gr-button-primary-border-soft);
  --gr-button-tone-border-soft-hover: var(--gr-button-primary-border-soft-hover);
  --gr-button-tone-glow: var(--gr-button-primary-glow);
}

[data-gr-button][data-gr-tone='neutral'] {
  --gr-button-tone-bg: var(--gr-button-neutral-bg);
  --gr-button-tone-bg-hover: var(--gr-button-neutral-bg-hover);
  --gr-button-tone-bg-active: var(--gr-button-neutral-bg-active);
  --gr-button-tone-fg: var(--gr-button-neutral-fg);
  --gr-button-tone-text: var(--gr-fg);
  --gr-button-tone-soft-bg: var(--gr-button-neutral-soft-bg);
  --gr-button-tone-soft-bg-hover: var(--gr-button-neutral-soft-bg-hover);
  --gr-button-tone-soft-bg-active: var(--gr-button-neutral-soft-bg-active);
  --gr-button-tone-soft-fg: var(--gr-secondary-fg);
  --gr-button-tone-ghost-bg-hover: var(--gr-button-neutral-ghost-bg-hover);
  --gr-button-tone-ghost-bg-active: var(--gr-button-neutral-ghost-bg-active);
  --gr-button-tone-border: var(--gr-button-neutral-border);
  --gr-button-tone-border-hover: var(--gr-button-neutral-border-hover);
  --gr-button-tone-border-active: var(--gr-button-neutral-border-active);
  --gr-button-tone-border-soft: var(--gr-button-neutral-border-soft);
  --gr-button-tone-border-soft-hover: var(--gr-button-neutral-border-soft-hover);
  --gr-button-tone-glow: var(--gr-button-neutral-glow);
}

[data-gr-button][data-gr-tone='success'] {
  --gr-button-tone-bg: var(--gr-button-success-bg);
  --gr-button-tone-bg-hover: var(--gr-button-success-bg-hover);
  --gr-button-tone-bg-active: var(--gr-button-success-bg-active);
  --gr-button-tone-fg: var(--gr-button-success-fg);
  --gr-button-tone-text: var(--gr-success-text);
  --gr-button-tone-soft-bg: var(--gr-button-success-soft-bg);
  --gr-button-tone-soft-bg-hover: var(--gr-button-success-soft-bg-hover);
  --gr-button-tone-soft-bg-active: var(--gr-button-success-soft-bg-active);
  --gr-button-tone-soft-fg: var(--gr-success-text);
  --gr-button-tone-ghost-bg-hover: var(--gr-button-success-ghost-bg-hover);
  --gr-button-tone-ghost-bg-active: var(--gr-button-success-ghost-bg-active);
  --gr-button-tone-border: var(--gr-button-success-border);
  --gr-button-tone-border-hover: var(--gr-button-success-border-hover);
  --gr-button-tone-border-active: var(--gr-button-success-border-active);
  --gr-button-tone-border-soft: var(--gr-button-success-border-soft);
  --gr-button-tone-border-soft-hover: var(--gr-button-success-border-soft-hover);
  --gr-button-tone-glow: var(--gr-button-success-glow);
}

[data-gr-button][data-gr-tone='warning'] {
  --gr-button-tone-bg: var(--gr-button-warning-bg);
  --gr-button-tone-bg-hover: var(--gr-button-warning-bg-hover);
  --gr-button-tone-bg-active: var(--gr-button-warning-bg-active);
  --gr-button-tone-fg: var(--gr-button-warning-fg);
  --gr-button-tone-text: var(--gr-warning-text);
  --gr-button-tone-soft-bg: var(--gr-button-warning-soft-bg);
  --gr-button-tone-soft-bg-hover: var(--gr-button-warning-soft-bg-hover);
  --gr-button-tone-soft-bg-active: var(--gr-button-warning-soft-bg-active);
  --gr-button-tone-soft-fg: var(--gr-warning-text);
  --gr-button-tone-ghost-bg-hover: var(--gr-button-warning-ghost-bg-hover);
  --gr-button-tone-ghost-bg-active: var(--gr-button-warning-ghost-bg-active);
  --gr-button-tone-border: var(--gr-button-warning-border);
  --gr-button-tone-border-hover: var(--gr-button-warning-border-hover);
  --gr-button-tone-border-active: var(--gr-button-warning-border-active);
  --gr-button-tone-border-soft: var(--gr-button-warning-border-soft);
  --gr-button-tone-border-soft-hover: var(--gr-button-warning-border-soft-hover);
  --gr-button-tone-glow: var(--gr-button-warning-glow);
}

[data-gr-button][data-gr-tone='danger'] {
  --gr-button-tone-bg: var(--gr-button-danger-bg);
  --gr-button-tone-bg-hover: var(--gr-button-danger-bg-hover);
  --gr-button-tone-bg-active: var(--gr-button-danger-bg-active);
  --gr-button-tone-fg: var(--gr-button-danger-fg);
  --gr-button-tone-text: var(--gr-danger-text);
  --gr-button-tone-soft-bg: var(--gr-button-danger-soft-bg);
  --gr-button-tone-soft-bg-hover: var(--gr-button-danger-soft-bg-hover);
  --gr-button-tone-soft-bg-active: var(--gr-button-danger-soft-bg-active);
  --gr-button-tone-soft-fg: var(--gr-danger-text);
  --gr-button-tone-ghost-bg-hover: var(--gr-button-danger-ghost-bg-hover);
  --gr-button-tone-ghost-bg-active: var(--gr-button-danger-ghost-bg-active);
  --gr-button-tone-border: var(--gr-button-danger-border);
  --gr-button-tone-border-hover: var(--gr-button-danger-border-hover);
  --gr-button-tone-border-active: var(--gr-button-danger-border-active);
  --gr-button-tone-border-soft: var(--gr-button-danger-border-soft);
  --gr-button-tone-border-soft-hover: var(--gr-button-danger-border-soft-hover);
  --gr-button-tone-glow: var(--gr-button-danger-glow);
}

[data-gr-button][data-gr-tone='info'] {
  --gr-button-tone-bg: var(--gr-button-info-bg);
  --gr-button-tone-bg-hover: var(--gr-button-info-bg-hover);
  --gr-button-tone-bg-active: var(--gr-button-info-bg-active);
  --gr-button-tone-fg: var(--gr-button-info-fg);
  --gr-button-tone-text: var(--gr-info-text);
  --gr-button-tone-soft-bg: var(--gr-button-info-soft-bg);
  --gr-button-tone-soft-bg-hover: var(--gr-button-info-soft-bg-hover);
  --gr-button-tone-soft-bg-active: var(--gr-button-info-soft-bg-active);
  --gr-button-tone-soft-fg: var(--gr-info-text);
  --gr-button-tone-ghost-bg-hover: var(--gr-button-info-ghost-bg-hover);
  --gr-button-tone-ghost-bg-active: var(--gr-button-info-ghost-bg-active);
  --gr-button-tone-border: var(--gr-button-info-border);
  --gr-button-tone-border-hover: var(--gr-button-info-border-hover);
  --gr-button-tone-border-active: var(--gr-button-info-border-active);
  --gr-button-tone-border-soft: var(--gr-button-info-border-soft);
  --gr-button-tone-border-soft-hover: var(--gr-button-info-border-soft-hover);
  --gr-button-tone-glow: var(--gr-button-info-glow);
}

[data-gr-button][data-gr-tone='slate'] {
  --gr-button-tone-bg: var(--gr-button-slate-bg);
  --gr-button-tone-bg-hover: var(--gr-button-slate-bg-hover);
  --gr-button-tone-bg-active: var(--gr-button-slate-bg-active);
  --gr-button-tone-fg: var(--gr-button-slate-fg);
  --gr-button-tone-text: var(--gr-slate-text);
  --gr-button-tone-soft-bg: var(--gr-button-slate-soft-bg);
  --gr-button-tone-soft-bg-hover: var(--gr-button-slate-soft-bg-hover);
  --gr-button-tone-soft-bg-active: var(--gr-button-slate-soft-bg-active);
  --gr-button-tone-soft-fg: var(--gr-slate-text);
  --gr-button-tone-ghost-bg-hover: var(--gr-button-slate-ghost-bg-hover);
  --gr-button-tone-ghost-bg-active: var(--gr-button-slate-ghost-bg-active);
  --gr-button-tone-border: var(--gr-button-slate-border);
  --gr-button-tone-border-hover: var(--gr-button-slate-border-hover);
  --gr-button-tone-border-active: var(--gr-button-slate-border-active);
  --gr-button-tone-border-soft: var(--gr-button-slate-border-soft);
  --gr-button-tone-border-soft-hover: var(--gr-button-slate-border-soft-hover);
  --gr-button-tone-glow: var(--gr-button-slate-glow);
}

[data-gr-button][data-gr-tone='azure'] {
  --gr-button-tone-bg: var(--gr-button-azure-bg);
  --gr-button-tone-bg-hover: var(--gr-button-azure-bg-hover);
  --gr-button-tone-bg-active: var(--gr-button-azure-bg-active);
  --gr-button-tone-fg: var(--gr-button-azure-fg);
  --gr-button-tone-text: var(--gr-azure-text);
  --gr-button-tone-soft-bg: var(--gr-button-azure-soft-bg);
  --gr-button-tone-soft-bg-hover: var(--gr-button-azure-soft-bg-hover);
  --gr-button-tone-soft-bg-active: var(--gr-button-azure-soft-bg-active);
  --gr-button-tone-soft-fg: var(--gr-azure-text);
  --gr-button-tone-ghost-bg-hover: var(--gr-button-azure-ghost-bg-hover);
  --gr-button-tone-ghost-bg-active: var(--gr-button-azure-ghost-bg-active);
  --gr-button-tone-border: var(--gr-button-azure-border);
  --gr-button-tone-border-hover: var(--gr-button-azure-border-hover);
  --gr-button-tone-border-active: var(--gr-button-azure-border-active);
  --gr-button-tone-border-soft: var(--gr-button-azure-border-soft);
  --gr-button-tone-border-soft-hover: var(--gr-button-azure-border-soft-hover);
  --gr-button-tone-glow: var(--gr-button-azure-glow);
}

/*
 * Веса. Нажатая кнопка-переключатель (`data-gr-pressed`) держит вид своего
 * нажатого состояния: иначе включённое и выключенное различались бы только для
 * AT. Без тона (недоступное радио-«кнопка») вес не включается.
 *
 * Объём solid: тень темы, под ней — тень цвета тона, в нажатии тень уходит
 * внутрь. `--gr-button-divider` — шов между соседними solid-звеньями, его ставит
 * `GrButtonGroup` переменной.
 */
[data-gr-button][data-gr-tone]:not([data-gr-off])[data-gr-variant='primary'] {
  border-width: 1px;
  border-color: var(--gr-button-tone-bg);
  background-color: var(--gr-button-tone-bg);
  background-image: var(--gr-button-solid-image);
  color: var(--gr-button-tone-fg);
  box-shadow: var(--gr-button-divider, 0 0 transparent), var(--gr-button-shadow), var(--gr-button-glow) var(--gr-button-tone-glow);
}

[data-gr-button][data-gr-tone]:not([data-gr-off])[data-gr-variant='primary']:hover {
  border-color: var(--gr-button-tone-bg-hover);
  background-color: var(--gr-button-tone-bg-hover);
  box-shadow: var(--gr-button-divider, 0 0 transparent), var(--gr-button-shadow), var(--gr-button-glow-hover) var(--gr-button-tone-glow);
}

[data-gr-button][data-gr-tone]:not([data-gr-off])[data-gr-variant='primary']:active,
[data-gr-button][data-gr-tone]:not([data-gr-off])[data-gr-variant='primary'][data-gr-pressed] {
  border-color: var(--gr-button-tone-bg-active);
  background-color: var(--gr-button-tone-bg-active);
  box-shadow: var(--gr-button-divider, 0 0 transparent), var(--gr-button-shadow-active);
}

/* «Обычная» нейтральная кнопка лежит на поверхности карточки и чуть приподнята над ней. */
[data-gr-button][data-gr-tone]:not([data-gr-off])[data-gr-variant='secondary'] {
  border-width: 1px;
  border-color: var(--gr-button-tone-border-soft);
  background-color: var(--gr-button-tone-soft-bg);
  color: var(--gr-button-tone-soft-fg);
}

[data-gr-button][data-gr-tone]:not([data-gr-off])[data-gr-variant='secondary'][data-gr-tone='neutral'] {
  box-shadow: var(--gr-button-surface-shadow);
}

[data-gr-button][data-gr-tone]:not([data-gr-off])[data-gr-variant='secondary']:hover {
  border-color: var(--gr-button-tone-border-soft-hover);
  background-color: var(--gr-button-tone-soft-bg-hover);
}

[data-gr-button][data-gr-tone]:not([data-gr-off])[data-gr-variant='secondary']:active,
[data-gr-button][data-gr-tone]:not([data-gr-off])[data-gr-variant='secondary'][data-gr-pressed] {
  border-color: var(--gr-button-tone-border-hover);
  background-color: var(--gr-button-tone-soft-bg-active);
}

/*
 * Прозрачные веса под указателем берут подложку темы на тон; хук
 * `--gr-button-ghost-bg-*` поверх — одна подложка на все тоны от приложения.
 */
[data-gr-button][data-gr-tone]:not([data-gr-off]):is([data-gr-variant='outline'], [data-gr-variant='ghost'], [data-gr-variant='ghost-border']) {
  border-width: 1px;
  border-color: transparent;
  background-color: transparent;
  color: var(--gr-button-tone-text);
}

[data-gr-button][data-gr-tone]:not([data-gr-off]):is([data-gr-variant='outline'], [data-gr-variant='ghost'], [data-gr-variant='ghost-border']):hover {
  background-color: var(--gr-button-ghost-bg-hover, var(--gr-button-tone-ghost-bg-hover));
}

[data-gr-button][data-gr-tone]:not([data-gr-off]):is([data-gr-variant='outline'], [data-gr-variant='ghost'], [data-gr-variant='ghost-border']):is(:active, [data-gr-pressed]) {
  background-color: var(--gr-button-ghost-bg-active, var(--gr-button-tone-ghost-bg-active));
}

[data-gr-button][data-gr-tone]:not([data-gr-off])[data-gr-variant='outline'] {
  border-color: var(--gr-button-tone-border);
}

[data-gr-button][data-gr-tone]:not([data-gr-off])[data-gr-variant='outline']:hover {
  border-color: var(--gr-button-tone-border-hover);
}

[data-gr-button][data-gr-tone]:not([data-gr-off])[data-gr-variant='ghost-border']:hover {
  border-color: var(--gr-button-tone-border);
}

[data-gr-button][data-gr-tone]:not([data-gr-off]):is([data-gr-variant='outline'], [data-gr-variant='ghost-border']):is(:active, [data-gr-pressed]) {
  border-color: var(--gr-button-tone-border-active);
}

/*
 * Недоступная — токенами, а не `opacity`: прозрачность разбавляет выверенные на AA
 * цвета. У прозрачных весов заливки нет и в недоступном виде — иначе стрелка
 * пагинации превращалась бы в залитую плашку.
 */
[data-gr-button][data-gr-off] {
  border-width: 1px;
  border-color: transparent;
  background-color: transparent;
  color: var(--gr-button-disabled-fg);
}

[data-gr-button][data-gr-off]:is([data-gr-variant='primary'], [data-gr-variant='secondary']) {
  border-color: var(--gr-button-disabled-brd);
  border-style: var(--gr-button-disabled-border-style);
  background-color: var(--gr-button-disabled-bg);
  background-image: var(--gr-button-disabled-image);
}

[data-gr-button][data-gr-off][data-gr-variant='outline'] {
  border-color: var(--gr-button-disabled-outline-brd);
  border-style: var(--gr-button-disabled-border-style);
}

/*
 * Нажатие — вдавливание темы (`--gr-button-press-scale`), наведение — подъём
 * (`--gr-button-lift`). Только у живой кнопки: недоступная и ждущая сервер на
 * указатель не отвечают, и движение соврало бы. С reduced-motion остаётся одна
 * смена цвета.
 */
@media (prefers-reduced-motion: no-preference) {
  [data-gr-button]:not([data-gr-off], [aria-busy='true'], [aria-disabled='true']):hover {
    transform: translateY(var(--gr-button-lift));
  }

  [data-gr-button]:not([data-gr-off], [aria-busy='true'], [aria-disabled='true']):active {
    transform: scale(var(--gr-button-press-scale));
  }

  [data-gr-button]:not([data-gr-off], [aria-busy='true'], [aria-disabled='true']):hover:active {
    transform: translateY(var(--gr-button-lift)) scale(var(--gr-button-press-scale));
  }
}

/* Подпись из одного текста обрезается многоточием. */
[data-gr-button-label] {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Префикс в квадратной ячейке высотой с кнопку, за перегородкой. */
[data-gr-button-cell] {
  display: flex;
  aspect-ratio: 1;
  align-items: center;
  align-self: stretch;
  justify-content: center;
  border-inline-end-width: 1px;
  border-color: color-mix(in srgb, currentColor 24%, transparent);
}

/* Спиннер без префикса лежит поверх содержимого: ширина кнопки не меняется. */
[data-gr-button-spinner] {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/*
 * Загрузка без префикса: спиннер лежит поверх содержимого, а содержимое гаснет.
 * Прозрачностью, а не `visibility` — иначе подпись выпала бы из доступного
 * имени. Голый текстовый узел селектором не достать, поэтому текст гасится
 * заливкой глифов: `color` остаётся прежним, и спиннер рисуется цветом подписи.
 */
[data-gr-button][data-gr-busy-overlay] {
  -webkit-text-fill-color: transparent;
}

[data-gr-button][data-gr-busy-overlay] > :not([data-gr-button-spinner]) {
  opacity: 0;
}

/*
 * Загрузка мерцанием подписи: свет проходит по тексту, подпись и ширина на месте.
 * Градиент кладётся на глифы самой подписи (`background-clip: text`), а не на
 * корень — там он срезал бы заливку кнопки. `color` не трогается: иконки
 * аддонов рисуются им и не мерцают.
 */
[data-gr-button][data-gr-busy-shimmer] [data-gr-button-label] {
  background-image: linear-gradient(100deg, currentColor 35%, color-mix(in srgb, currentColor 35%, transparent) 50%, currentColor 65%);
  background-size: 250% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gr-button-shimmer var(--gr-button-shimmer-duration) linear infinite;
}

@keyframes gr-button-shimmer {
  from {
    background-position: 100% 0;
  }

  to {
    background-position: -150% 0;
  }
}

/* Без движения сигналом остаётся приглушённая подпись. */
@media (prefers-reduced-motion: reduce) {
  [data-gr-button][data-gr-busy-shimmer] [data-gr-button-label] {
    animation: none;
    background-image: none;
    -webkit-text-fill-color: color-mix(in srgb, currentColor 70%, transparent);
  }
}

/*
 * Загрузка отрезком: он бежит по нижней кромке поверх рамки, содержимое на месте
 * и чуть приглушено. С reduced-motion отрезок не выключается, а замедляется:
 * другого сигнала у загрузки нет.
 */
[data-gr-button][data-gr-busy-track] > :not([data-gr-button-track]) {
  opacity: 0.86;
}

/* Дорожка — во всю кнопку по рамке и со скруглением кнопки: отрезок обрезается по её углам. */
[data-gr-button-track] {
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  overflow: hidden;
  pointer-events: none;
}

[data-gr-button-track] > span {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 36%;
  height: 2px;
  background-color: currentColor;
  animation: gr-button-track var(--gr-button-track-duration) linear infinite;
}

[dir='rtl'] [data-gr-button-track] {
  transform: scaleX(-1);
}

@keyframes gr-button-track {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(280%);
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-gr-button-track] > span {
    animation-duration: calc(var(--gr-button-track-duration) * 2.4);
  }
}

/*
 * В склеенной `GrButtonGroup` впереди — её ручка `--gr-button-group-radius`;
 * внутренние углы группа гасит сама. Здесь, а не в листе группы: радиус ступени
 * знает только кнопка.
 */
[data-gr-button-group][data-attached] [data-gr-button] {
  --gr-button-corner-radius: var(--gr-button-group-radius, var(--gr-button-radius, var(--gr-button-step-radius)));
}

/*
 * Слой отклика под указателем — `::before`: `::after` занят зоной касания. Тема
 * задаёт его геометрию и цвет: у «Тактильной» — подложка прозрачных весов,
 * растущая из центра, у «Чертежа» — линия хода по нижней кромке; у «Сланца» он
 * прозрачен. Цвет считается от `currentColor` кнопки, поэтому формула темы
 * знает тон без токена на тон. Под содержимым — за счёт `isolate` у кнопки.
 */
[data-gr-button]::before {
  content: '';
  position: absolute;
  inset: var(--gr-button-response-inset);
  height: var(--gr-button-response-height);
  border-radius: inherit;
  background-color: var(--gr-button-response-color);
  opacity: var(--gr-button-response-opacity);
  transform: var(--gr-button-response-from);
  transform-origin: var(--gr-button-response-origin) 50%;
  transition:
    transform var(--gr-button-response-duration) var(--gr-button-response-ease),
    opacity var(--gr-button-response-duration) var(--gr-button-response-ease);
  pointer-events: none;
  z-index: -1;
}

/* Точка роста считается от начала строки: в RTL — от правого края. */
[dir='rtl'] [data-gr-button]::before {
  transform-origin: calc(100% - var(--gr-button-response-origin)) 50%;
}

[data-gr-button][data-gr-variant='primary']::before {
  background-color: var(--gr-button-response-solid-color);
}

[data-gr-button][data-gr-variant='secondary']::before {
  background-color: var(--gr-button-response-soft-color);
}

[data-gr-button]:hover:not(:disabled, [aria-disabled='true'])::before {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  [data-gr-button]::before {
    transition: none;
  }
}

/*
 * Зона касания: на грубом указателе низкая кнопка добирает высоту до
 * `--gr-button-touch-size` невидимым `::after`. Вид и плотность ряда прежние;
 * кнопка выше порога ничего не получает — `min()` обнуляет вылет.
 */
@media (pointer: coarse) {
  [data-gr-button]::after {
    content: '';
    position: absolute;
    inset-inline: 0;
    inset-block: min(0px, calc((100% - var(--gr-button-touch-size, 2.75rem)) / 2));
  }
}
</style>
