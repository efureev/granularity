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
  glyphSizes,
  grButtonBaseClass,
  grButtonClass,
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

function rootClass(): string[] {
  const suffix = hasSlotContent('suffix') || (opensInNewTab.value && !isSquare.value)

  return [
    grButtonBaseClass,
    grButtonClass({
      variant: resolvedVariant.value,
      tone: resolvedTone.value,
      size: resolvedSize.value,
      square: isSquare.value,
      disabled: looksDisabled.value,
      block: props.block,
      loading: props.loading,
      prefix: hasSlotContent('prefix'),
      prefixCell: prefixInCell(),
      suffix,
    }),
    // Ждущая сервер кнопка не запрещена, а занята — курсор говорит именно это.
    looksDisabled.value ? 'cursor-not-allowed' : props.loading ? 'cursor-progress' : '',
  ]
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
    :data-gr-variant="resolvedVariant"
    :data-gr-tone="resolvedTone"
    :data-gr-pressed="isToggledOn && !inTray && !isDisabled ? '' : undefined"
    :data-gr-busy-overlay="spinnerOverContent() ? '' : undefined"
    :data-gr-busy-shimmer="shimmerLabel() ? '' : undefined"
    :data-gr-busy-track="trackLoading() ? '' : undefined"
    v-bind="rootAttrs"
    :class="rootClass()"
    @click.capture="onClickCapture"
  >
    <span v-if="prefixInCell()" data-gr-button-cell class="flex aspect-square items-center justify-center self-stretch border-e border-[color-mix(in_srgb,currentColor_24%,transparent)]">
      <IconLoader v-if="spinnerInPrefix()" class="animate-spin" :class="glyphSizes[resolvedSize]" aria-hidden="true" />
      <slot v-else name="prefix" />
    </span>
    <IconLoader v-else-if="spinnerInPrefix()" class="animate-spin" :class="glyphSizes[resolvedSize]" aria-hidden="true" />
    <slot v-else-if="!props.loading || shimmerLabel() || trackLoading()" name="prefix" />

    <span v-if="labelIsText()" data-gr-button-label class="min-w-0 truncate" @mouseenter="titleWhenTruncated">
      <slot />
    </span>
    <slot v-else />

    <slot name="suffix" />

    <IconExternal v-if="opensInNewTab && !isSquare" :class="glyphSizes[resolvedSize]" aria-hidden="true" />

    <span v-if="spinnerOverContent()" data-gr-button-spinner class="absolute inset-0 flex items-center justify-center" aria-hidden="true">
      <IconLoader class="animate-spin" :class="glyphSizes[resolvedSize]" />
    </span>

    <span v-if="trackLoading()" data-gr-button-track aria-hidden="true"><span /></span>

    <span v-if="props.loading" class="sr-only">{{ resolvedLoadingText }}</span>
    <span v-if="opensInNewTab && !props.ariaLabel" class="sr-only">({{ newTabHint }})</span>
  </component>
</template>

<style>
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
 * Радиус углов кнопки: ручка приложения, иначе радиус ступени. В склеенной
 * `GrButtonGroup` впереди — её ручка `--gr-button-group-radius`; внутренние углы
 * группа гасит сама. Здесь, а не в листе группы: радиус ступени знает только
 * кнопка.
 */
[data-gr-button] {
  --gr-button-corner-radius: var(--gr-button-radius, var(--gr-button-step-radius));
}

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
