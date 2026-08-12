<script setup lang="ts">
/**
 * GrToaster — GR-примитив области уведомлений (toast).
 *
 * Модель состояния берётся из `useToast`, поэтому в приложении предполагается
 * **один активный `GrToaster`** на корень (или app-scoped через плагин).
 *
 * A11y:
 * - контейнер — `role="region"` с `aria-label` (i18n-проп `regionLabel`);
 * - объявляет каждый тост сам собой: `role="status"`, а критичные
 *   (`warning`/`danger`) — ассертивный `role="alert"`. Обёртки-live-region над
 *   ними нет намеренно: вложение регионов с разной ассертивностью
 *   спецификацией не определено, браузеры и SR расходятся вплоть до потери
 *   объявления;
 * - стек достижим с клавиатуры по `focusHotkey` (по умолчанию `F6`) — тосты
 *   телепортированы в конец `body`, и без хоткея кнопка «Отменить» лежала бы
 *   за пределами разумного числа нажатий `Tab`.
 *
 * UX:
 * - `maxVisible` ограничивает стек; лишние ждут в очереди (их таймеры на паузе);
 * - автозакрытие **останавливается под курсором/фокусом** (WCAG 2.2.1) и
 *   визуализируется прогресс-баром до закрытия;
 * - `placement` настраивает угол экрана; слой — `--gr-z-toast`.
 */
import { computed, nextTick, ref, useSlots, watchEffect } from 'vue'

import { usePortalTarget } from '../../composables/usePortalTarget'
import type { Component } from 'vue'

import { useDragGesture } from '../../composables/useDragGesture'
import { useToast } from '../../composables/useToast'
import { vHotkey } from '../../directives'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import type { GrToastTone, Toast, ToastAction } from '../../composables/useToast'
import GrButton from '../GrButton'
import GrIcon from '../GrIcon'
import {
  PLACEMENT_CLASS,
  SWIPE_DIRECTION,
  SWIPE_FLY_OUT_PX,
  SWIPE_RESISTANCE,
  SWIPE_THRESHOLD_MIN_PX,
  SWIPE_THRESHOLD_RATIO,
  swipeOpacity,
  type GrToasterPlacement,
} from './grToasterStyles'

import IconCheck from '~icons/lucide/check-circle'
import IconWarning from '~icons/lucide/alert-triangle'
import IconError from '~icons/lucide/x-circle'
import IconInfo from '~icons/lucide/info'
import IconClose from '~icons/lucide/x'

export type { GrToasterPlacement }

interface ToneMeta {
  icon: Component
  color: string
  role: 'status' | 'alert'
}

// Единый маппинг по tone'у: иконка, цвет, a11y-роль. На уровне модуля —
// чтобы не пересоздавать объект на каждый рендер.
const TONE_META: Record<GrToastTone, ToneMeta> = {
  primary: { icon: IconInfo, color: 'var(--gr-primary)', role: 'status' },
  neutral: { icon: IconInfo, color: 'var(--gr-muted-fg)', role: 'status' },
  info: { icon: IconInfo, color: 'var(--gr-info)', role: 'status' },
  success: { icon: IconCheck, color: 'var(--gr-success)', role: 'status' },
  warning: { icon: IconWarning, color: 'var(--gr-warning)', role: 'alert' },
  danger: { icon: IconError, color: 'var(--gr-danger)', role: 'alert' },
  slate: { icon: IconInfo, color: 'var(--gr-slate)', role: 'status' },
  azure: { icon: IconInfo, color: 'var(--gr-azure)', role: 'status' },
}

export interface GrToasterProps {
  /** Угол экрана для стека уведомлений. */
  placement?: GrToasterPlacement
  /** Максимум одновременно видимых тостов; остальные ждут в очереди. По умолчанию `4`. */
  maxVisible?: number
  /** A11y-лейбл кнопки закрытия (i18n). */
  dismissLabel?: string
  /** A11y-лейбл контейнера-региона (i18n). */
  regionLabel?: string
  /**
   * Ширина стека. Число — пиксели, строка — любая CSS-длина. Уезжает в
   * `--gr-toaster-width`, поэтому то же самое можно задать и темой.
   */
  width?: string | number
  /**
   * Клавиша перевода фокуса в стек уведомлений; `false` отключает хоткей.
   * `F6` — рекомендация APG для перехода между «регионами» страницы.
   */
  focusHotkey?: string | false
  /**
   * Смахивание тоста к своему краю экрана. Клавиатурный эквивалент — `Delete`
   * и `Backspace` на сфокусированном тосте — остаётся и при выключенном жесте.
   */
  swipeDismiss?: boolean
}

import { useGrThemeAttrs } from '../GrConfigProvider/context'

const props = withDefaults(defineProps<GrToasterProps>(), {
  placement: 'top-right',
  maxVisible: 4,
  dismissLabel: undefined,
  regionLabel: undefined,
  width: undefined,
  focusHotkey: 'F6',
  swipeDismiss: true,
})

/**
 * Слот `actions` полностью заменяет дефолтные action-кнопки тоста. Получает сам
 * `toast` и `dismiss` — функцию, закрывающую именно этот тост.
 */
defineSlots<{
  actions?: (props: { toast: Toast, dismiss: () => void }) => unknown
}>()

const { t } = useGranularityTranslations()
const slots = useSlots()
const resolvedDismissLabel = computed(() => props.dismissLabel ?? t('gr.toaster.dismiss', 'Dismiss'))
const resolvedRegionLabel = computed(() => props.regionLabel ?? t('gr.toaster.region', 'Notifications'))

const { list, dismiss, pause, resume } = useToast()

// Единый список кнопок тоста: `action` (шорткат) + массив `actions`.
function toastActions(toast: Toast): ToastAction[] {
  return [...(toast.action ? [toast.action] : []), ...(toast.actions ?? [])]
}

// Показываем блок действий, если есть кнопки или задан слот `actions`.
function hasActions(toast: Toast): boolean {
  return Boolean(slots.actions) || toastActions(toast).length > 0
}

// Клик по action-кнопке тоста: вызываем обработчик и (по умолчанию) закрываем тост.
function onAction(toast: Toast, action: ToastAction): void {
  action.onClick()
  if (action.dismissOnClick !== false)
    dismiss(toast.id)
}

// SSR-guard: на сервере `document.body` недоступен — отключаем `teleport`.
// Телепорт включается только ПОСЛЕ монтирования: иначе первый клиентский
// рендер не совпадает с серверным и ломается гидрация (см. композабл).
const { target: portalTarget, enabled: teleportEnabled } = usePortalTarget()

// Тема поддерева на телепортированную панель: в DOM она уезжает в `body`, то
// есть вне обёртки провайдера, и `data-theme` с неё не наследуется. В дереве
// компонентов панель остаётся внутри — `inject` доходит, и тему она ставит себе
// сама.
const themeAttrs = useGrThemeAttrs()

// Видимые тосты (не больше `maxVisible`); остальные ждут в очереди. Список
// хранится новейшими вперёд, поэтому «видимые дожинают, новые ждут» — это
// хвост: старейшие N. Взяв голову, стек показывал бы новейшие, и каждый пуш
// вытеснял бы с экрана тост, который пользователь ещё читает.
const visibleToasts = computed(() => list.value.slice(-Math.max(1, props.maxVisible)))
const visibleIds = computed(() => new Set(visibleToasts.value.map(toast => toast.id)))

// Пауза под курсором/фокусом (WCAG 2.2.1). Флага два и они независимы: один
// `paused` терялся на «фокус внутри + мышь прошла насквозь» — `mouseleave`
// возобновлял отсчёт под клавиатурным фокусом.
const hovered = ref(false)
const focusWithin = ref(false)

// Контейнер стека: по нему ищутся тосты — и для фокуса, и для жеста.
const containerEl = ref<HTMLElement | null>(null)

// ————— Смахивание.

const swipingId = ref<string | null>(null)
const swipeOffset = ref(0)
let swipeStartX = 0
let swipeThreshold = SWIPE_THRESHOLD_MIN_PX

// Тост, который тянут, тоже держит таймеры: иначе уведомление сгорало бы прямо
// под пальцем, посреди жеста.
const paused = computed(() => hovered.value || focusWithin.value || swipingId.value !== null)

function toastElement(id: string): HTMLElement | null {
  return containerEl.value?.querySelector<HTMLElement>(`[data-gr-toast][data-toast-id="${id}"]`) ?? null
}

/** Жест отпущен и тост закрывается: переход снова разрешён (см. `releaseSwiped`). */
const swipeReleased = ref(false)

function resetSwipe(): void {
  swipingId.value = null
  swipeOffset.value = 0
  swipeReleased.value = false
}

/**
 * Отпущенный тост уезжает за свой край и только потом закрывается.
 *
 * Два кадра здесь обязательны, и оба по одной причине: уходящий элемент Vue
 * больше не перерисовывает — он уезжает с тем стилем, что был на последнем
 * рендере. Значит и разрешение перехода, и конечную точку нужно успеть отдать
 * до закрытия: первый кадр снимает инлайновый `transition: none` (во время
 * жеста он нужен, иначе переходы группы борются с пальцем), второй задаёт точку
 * отлёта — с этого момента анимация уже идёт, и `leave` подхватывает её на ходу.
 *
 * Закрыв тост сразу, получили бы не отлёт, а мгновенное исчезновение: элемент
 * ушёл бы в `leave` с запрещённым переходом.
 */
async function releaseSwiped(id: string): Promise<void> {
  swipeReleased.value = true
  await nextTick()

  swipeOffset.value = SWIPE_DIRECTION[props.placement] * SWIPE_FLY_OUT_PX
  await nextTick()

  dismiss(id)
  resetSwipe()
}

/**
 * Движение к своему краю идёт один к одному, в обратную сторону — с
 * сопротивлением: тост едет за пальцем, но закрыть его «наоборот» нельзя.
 */
function resistOffset(delta: number): number {
  const toEdge = SWIPE_DIRECTION[props.placement]

  return Math.sign(delta) === toEdge ? delta : delta / SWIPE_RESISTANCE
}

const swipe = useDragGesture({
  disabled: () => !props.swipeDismiss,
  onStart: (event) => {
    const target = event.target as HTMLElement | null
    // Нажатие на кнопке — это нажатие на кнопке: закрытие и действия тоста не
    // должны превращаться в протяжку.
    if (target?.closest('button, a[href]')) return false

    const host = target?.closest<HTMLElement>('[data-gr-toast]')
    const id = host?.dataset.toastId
    if (!host || !id) return false

    swipingId.value = id
    swipeOffset.value = 0
    swipeStartX = event.clientX
    swipeThreshold = Math.max(SWIPE_THRESHOLD_MIN_PX, host.getBoundingClientRect().width * SWIPE_THRESHOLD_RATIO)
  },
  onMove: (event) => {
    // Против выделения текста тоста во время протяжки.
    event.preventDefault()
    swipeOffset.value = resistOffset(event.clientX - swipeStartX)
  },
  onEnd: () => {
    const id = swipingId.value
    const passed = id !== null
      && Math.sign(swipeOffset.value) === SWIPE_DIRECTION[props.placement]
      && Math.abs(swipeOffset.value) >= swipeThreshold

    if (passed) void releaseSwiped(id)
    else resetSwipe()
  },
  // Обрыв возвращает тост на место, а не дожимает смахивание: указатель забрал
  // браузер, а не пользователь довёл жест.
  onCancel: resetSwipe,
})

function swipeStyle(toast: Toast): Record<string, string> | undefined {
  if (swipingId.value !== toast.id) return undefined

  return {
    transform: `translateX(${swipeOffset.value}px)`,
    opacity: String(swipeOpacity(swipeOffset.value, swipeThreshold)),
    // Переходы группы во время жеста борются с пальцем: тост едет с задержкой
    // и «догоняет» курсор после отпускания. После отпускания запрет снимается —
    // уходящему тосту переход нужен, иначе он не уедет вовсе.
    ...(swipeReleased.value ? {} : { transition: 'none' }),
  }
}

/**
 * Клавиатурный эквивалент смахивания. `Escape` намеренно не берём: тостер не
 * модальный слой, и перехват закрывал бы уведомление вместо диалога под ним.
 */
function onToastKeydown(event: KeyboardEvent, toast: Toast): void {
  if (event.key !== 'Delete' && event.key !== 'Backspace') return

  event.preventDefault()

  const index = visibleToasts.value.findIndex(item => item.id === toast.id)
  const next = visibleToasts.value[index + 1] ?? visibleToasts.value[index - 1]

  dismiss(toast.id)

  // Фокус не должен упасть на `body`: дальше по стеку есть что читать.
  if (next) void nextTick(() => toastElement(next.id)?.focus())
}

// Единый источник правды по таймерам: тост тикает, только если он видим И стек не на
// паузе. Очередь и hover — на паузе. Реагирует на изменения списка/hover.
//
// `timeoutMs` читается ради зависимости, а не ради значения: `toast.promise` и
// `update` перезапускают таймер уже существующего тоста, не трогая ни список, ни
// паузу. Без этой зависимости эффект не просыпался бы, и заново заведённый
// таймер тикал бы под курсором или у тоста, который ещё ждёт в очереди, — тот
// сгорал бы, ни разу не показавшись.
watchEffect(() => {
  for (const toast of list.value) {
    const shouldTick = toast.timeoutMs > 0 && visibleIds.value.has(toast.id) && !paused.value

    if (shouldTick)
      resume(toast.id)
    else
      pause(toast.id)
  }
})

function metaFor(tone: GrToastTone): ToneMeta {
  return TONE_META[tone] ?? TONE_META.info
}

const containerClass = computed(() => PLACEMENT_CLASS[props.placement])

const containerStyle = computed(() => {
  if (props.width === undefined) return undefined

  return { '--gr-toaster-width': typeof props.width === 'number' ? `${props.width}px` : props.width }
})


/**
 * Переводит фокус на верхний тост. Тост фокусируем только программно
 * (`tabindex="-1"`): собственной остановкой `Tab` стек быть не должен, иначе
 * всплывающее уведомление перехватывало бы обход страницы.
 */
function focus(): boolean {
  const target = containerEl.value?.querySelector<HTMLElement>('[data-gr-toast]')
  if (!target) return false

  target.focus()
  return true
}

const hotkeyBinding = computed(() => ({
  enabled: props.focusHotkey !== false && visibleToasts.value.length > 0,
  handlers: { [props.focusHotkey || 'F6']: { handler: onFocusHotkey, allowInEditable: true } },
}))

function onFocusHotkey(event: KeyboardEvent): void {
  if (focus()) event.preventDefault()
}

defineExpose({ focus })
</script>

<template>
  <teleport :to="portalTarget" :disabled="!teleportEnabled">
    <div
        ref="containerEl"
        v-hotkey="hotkeyBinding"
        v-bind="themeAttrs"
        data-gr-toaster
        data-gr-overlay-root
        role="region"
        :aria-label="resolvedRegionLabel"
        class="fixed z-[var(--gr-z-toast)] w-[var(--gr-toaster-width,360px)] max-w-[calc(100vw-2rem)]"
        :class="containerClass"
        :style="containerStyle"
        @mouseenter="hovered = true"
        @mouseleave="hovered = false"
        @focusin="focusWithin = true"
        @focusout="focusWithin = false"
    >
      <TransitionGroup
          tag="div"
          class="grid gap-3"
          enter-active-class="transition duration-[var(--gr-duration-base)] ease-[var(--gr-ease-out)]"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-in)] absolute"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-2"
          move-class="transition-transform duration-[var(--gr-duration-base)] ease-[var(--gr-ease-out)]"
      >
        <div
            v-for="toast in visibleToasts"
            :key="toast.id"
            data-gr-toast
            :data-tone="toast.tone"
            :data-toast-id="toast.id"
            :role="metaFor(toast.tone).role"
            aria-atomic="true"
            tabindex="-1"
            class="relative overflow-hidden rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] px-4 py-3 shadow-[var(--gr-shadow-2)] focus-visible:outline-none focus-visible:shadow-[var(--gr-shadow-2),0_0_0_2px_var(--gr-ring)]"
            :class="swipeDismiss ? '[touch-action:pan-y]' : ''"
            :style="swipeStyle(toast)"
            @pointerdown="swipe.start"
            @keydown="onToastKeydown($event, toast)"
        >
          <div class="flex items-start gap-3">
            <GrIcon size="md" class="mt-0.5" :style="{ color: metaFor(toast.tone).color }">
              <component :is="metaFor(toast.tone).icon" />
            </GrIcon>
            <div class="min-w-0 flex-1">
              <div class="text-[length:var(--gr-text-sm)] font-700">
                {{ toast.title }}
              </div>
              <div v-if="toast.message" class="mt-0.5 text-[length:var(--gr-text-sm)] text-[var(--gr-muted-fg)]">
                {{ toast.message }}
              </div>

              <!-- Action-кнопки тоста: например «Отменить»/«Повторить». Можно
                   задать массивом (`actions`) или переопределить слотом. -->
              <div v-if="hasActions(toast)" class="mt-2 flex flex-wrap gap-2">
                <slot name="actions" :toast="toast" :dismiss="() => dismiss(toast.id)">
                  <GrButton
                      v-for="(action, index) in toastActions(toast)"
                      :key="index"
                      :variant="action.variant ?? 'outline'"
                      :size="action.size ?? 'sm'"
                      data-gr-toast-action
                      @click="onAction(toast, action)"
                  >
                    {{ action.label }}
                  </GrButton>
                </slot>
              </div>
            </div>
            <GrButton
                variant="ghost"
                size="sm"
                square
                :aria-label="resolvedDismissLabel"
                @click="dismiss(toast.id)"
            >
              <GrIcon size="sm">
                <IconClose />
              </GrIcon>
            </GrButton>
          </div>

          <!-- Прогресс до автозакрытия; замирает вместе с таймером на паузе. -->
          <div
              v-if="toast.timeoutMs > 0"
              data-gr-toast-progress
              aria-hidden="true"
              class="gr-toast-progress absolute bottom-0 left-0 h-[2px] w-full origin-left"
              :style="{
                backgroundColor: metaFor(toast.tone).color,
                animationDuration: `${toast.timeoutMs}ms`,
                animationPlayState: paused ? 'paused' : 'running',
              }"
          />
        </div>
      </TransitionGroup>
    </div>
  </teleport>
</template>

<style scoped>
.gr-toast-progress {
  animation-name: gr-toast-progress;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

@keyframes gr-toast-progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/*
 * Единственная анимация пакета, которую глобальный кламп чинит неверно.
 *
 * У полосы `animation-fill-mode: forwards`, поэтому сжатая до `0.01ms` она не
 * возвращается в исходное состояние, а фиксируется на `scaleX(0)`: таймер
 * выглядит истёкшим, пока тост ещё висит на экране. Полоса — единственный
 * носитель этого смысла, и статичной её оставить нельзя, поэтому под reduce она
 * убирается совсем. Автозакрытие ведёт JS-таймер, оно не страдает, а сам элемент
 * и так `aria-hidden`.
 */
@media (prefers-reduced-motion: reduce) {
  .gr-toast-progress {
    display: none;
  }
}
</style>
