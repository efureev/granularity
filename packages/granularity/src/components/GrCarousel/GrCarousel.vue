<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, watch, watchEffect } from 'vue'
import type { ComponentPublicInstance } from 'vue'

import { useAnnouncer } from '../../composables/useAnnouncer'
import { useFocusWithin } from '../../composables/internal/useFocusWithin'
import { useRovingFocus } from '../../composables/useRovingFocus'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import { useGrComponentProp } from '../GrConfigProvider/context'
import { resolveScrollOverflow } from '../shared/scrollOverflow'
import type { GrScrollOverflow } from '../shared/scrollOverflow'
import { clampIndex, stepIndex, stripScrollLeft } from './carouselNavigation'
import { useCarouselAutoplay } from './composables/useCarouselAutoplay'
import { useCarouselSwipe } from './composables/useCarouselSwipe'
import { GR_CAROUSEL_CONTEXT } from './grCarouselContext'
import type { GrCarouselSlideEntry } from './grCarouselContext'
import {
  carouselIconClass,
  carouselRootAxis,
  carouselRootBase,
  carouselThumbFallbackClass,
  carouselThumbImageClass,
  carouselToggleClass,
  carouselTrackAxis,
  carouselTrackBase,
  carouselViewportAxis,
  carouselViewportBase,
  carouselViewportSwipeClass,
  carouselViewportTouchAction,
  grCarouselControlClass,
  grCarouselIndicatorClass,
  grCarouselIndicatorsClass,
} from './grCarouselStyles'
import type {
  GrCarouselActivationMode,
  GrCarouselIndicators,
  GrCarouselOrientation,
} from './grCarouselStyles'
import type { GrTone } from '../shared/tones'

import IconChevronDown from '~icons/lucide/chevron-down'
import IconChevronLeft from '~icons/lucide/chevron-left'
import IconChevronRight from '~icons/lucide/chevron-right'
import IconChevronUp from '~icons/lucide/chevron-up'
import IconPause from '~icons/lucide/pause'
import IconPlay from '~icons/lucide/play'

export interface GrCarouselProps {
  /** Индекс текущего кадра. Не передан — лента ведёт позицию сама. */
  modelValue?: number
  /** Запустить показ. Под `prefers-reduced-motion` не стартует — тумблер остаётся. */
  autoplay?: boolean
  /** Пауза между кадрами, мс. */
  autoplayInterval?: number
  /** Замкнуть ленту. Выключено — стрелки на краях гаснут. */
  loop?: boolean
  /**
   * Ось движения ленты. По вертикали вьюпорту нужна **определённая высота**:
   * шаг считается от неё, и без высоты лента вырождается в столбец кадров.
   */
  orientation?: GrCarouselOrientation
  /**
   * Не рисовать содержимое кадров вдали от текущего.
   *
   * Виртуализируется **нутро кадра, а не кадр**: кадры приходят слотом, и не
   * отрисовать чужой узел лента не может. Пустая обёртка держит место в ряду и
   * почти ничего не весит, а картинки и карточки из DOM уходят.
   */
  virtual?: boolean
  /**
   * Сколько кадров по обе стороны от текущего рисовать сверх него. Меньше
   * единицы ставить нельзя: следующий кадр обязан быть готов **до** перехода,
   * иначе лента поедет на пустоту, а содержимое проявится уже на месте.
   */
  virtualOverscan?: number
  /** Вид переключателя кадров. `none` меняет и роль самих слайдов. */
  indicators?: GrCarouselIndicators
  /** Тон текущего переключателя по общей шкале пакета. */
  tone?: GrTone
  /** Листает ли стрелка по переключателям сразу или только двигает фокус. */
  activationMode?: GrCarouselActivationMode
  /** Стрелки «назад/вперёд». */
  arrows?: boolean
  /** Листание протяжкой указателя. */
  swipe?: boolean
  /** Сделать карусель ориентиром страницы (`role="region"`). */
  landmark?: boolean
  /** Имя карусели. APG требует его: `aria-roledescription` именем не считается. */
  ariaLabel?: string
  /** Имя из заголовка на странице. Сильнее `ariaLabel`. */
  ariaLabelledby?: string
  prevLabel?: string
  nextLabel?: string
  playLabel?: string
  pauseLabel?: string
  /** Имя полосы переключателей. */
  indicatorsLabel?: string
}

export interface GrCarouselEmits {
  (e: 'update:modelValue', index: number): void
}

const props = withDefaults(defineProps<GrCarouselProps>(), {
  modelValue: undefined,
  autoplay: false,
  autoplayInterval: 5000,
  loop: true,
  orientation: 'horizontal',
  virtual: false,
  virtualOverscan: 1,
  // Дефолт живёт в резолвере: Vue подставил бы свой раньше `GrConfigProvider`,
  // и «пользователь передал» стало бы неотличимо от «сработал дефолт».
  indicators: undefined,
  tone: undefined,
  activationMode: undefined,
  arrows: true,
  swipe: true,
  landmark: false,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  prevLabel: undefined,
  nextLabel: undefined,
  playLabel: undefined,
  pauseLabel: undefined,
  indicatorsLabel: undefined,
})

const emit = defineEmits<GrCarouselEmits>()

defineSlots<{
  /** Кадры ленты — `GrCarouselSlide`. */
  default?: () => unknown
  /**
   * Своя иконка кнопки «назад». Заменяет содержимое кнопки, но не её саму:
   * имя, `aria-disabled` и поведение на краю остаются за компонентом.
   */
  prev?: (props: { disabled: boolean }) => unknown
  /** Своя иконка кнопки «вперёд». */
  next?: (props: { disabled: boolean }) => unknown
}>()

const { t } = useGranularityTranslations()
const { announce } = useAnnouncer()

const resolvedIndicators = useGrComponentProp('GrCarousel', 'indicators', () => props.indicators, 'dots')
const resolvedActivation = useGrComponentProp('GrCarousel', 'activationMode', () => props.activationMode, 'automatic')
const resolvedTone = useGrComponentProp('GrCarousel', 'tone', () => props.tone, 'primary')

const rootEl = ref<HTMLElement | null>(null)
const viewportEl = ref<HTMLElement | null>(null)
const indicatorsEl = ref<HTMLElement | null>(null)
const tabRefs = ref<(HTMLElement | null)[]>([])

const entries = ref<GrCarouselSlideEntry[]>([])
const total = computed(() => entries.value.length)

let reorderScheduled = false

/**
 * Порядок регистрации совпадает с документом только при первом монтировании:
 * кадр, появившийся посреди ленты позже, встал бы в конец, и переключатели
 * разъехались бы с лентой. Пересортировка откладывается на такт — к этому
 * моменту узлы уже в DOM.
 */
function scheduleReorder(): void {
  if (reorderScheduled || typeof document === 'undefined')
    return

  reorderScheduled = true
  void nextTick(() => {
    reorderScheduled = false
    entries.value = [...entries.value].sort((left, right) => {
      const a = left.el()
      const b = right.el()
      if (!a || !b)
        return 0
      return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
    })
  })
}

function register(entry: GrCarouselSlideEntry): () => void {
  entries.value.push(entry)
  scheduleReorder()

  return () => {
    // Поиск по `id`, а не по ссылке: пересортировка выше пересобирает массив
    // через spread реактивного прокси, и элементы в нём — уже прокси, а не те
    // объекты, что пришли в `register`. `indexOf` по исходной ссылке вернул бы
    // `-1`, и кадр остался бы в полосе после размонтирования.
    const index = entries.value.findIndex(item => item.id === entry.id)
    if (index >= 0)
      entries.value.splice(index, 1)
    scheduleReorder()
  }
}

/**
 * Потолок ожидания конца перехода ленты. `--gr-duration-base` — 240ms; запас
 * нужен на прерванный переход и на среду, где переходов нет вовсе.
 */
const WRAP_FALLBACK_MS = 600

const internalIndex = ref(0)
const currentIndex = computed(() => clampIndex(props.modelValue ?? internalIndex.value, total.value))

/**
 * Замыкание кольца: `1` — идём с последнего кадра на первый, `-1` — обратно,
 * `0` — обычный шаг.
 *
 * Раньше `loop` просто сбрасывал индекс, и лента **прокручивалась назад через
 * все кадры**: на десятикадровой карусели с автопрокруткой каждый десятый шаг
 * был длинным обратным ходом. Теперь крайний слайд временно переезжает на
 * противоположный конец, лента доезжает до него как до соседа, и уже после
 * перехода индекс снимается без анимации.
 */
const wrapStep = ref<-1 | 0 | 1>(0)

/** Сама лента: по ней делается принудительная перерисовка при снятии кольца. */
const trackEl = ref<HTMLElement | null>(null)

/** На время снятия индекса переход выключается — иначе снятие само поедет. */
const suppressTransition = ref(false)

let wrapFallback: ReturnType<typeof setTimeout> | undefined

/** Позиция ленты: при замыкании она уезжает на один кадр за край. */
const trackIndex = computed(() => {
  if (wrapStep.value === 1)
    return total.value
  if (wrapStep.value === -1)
    return -1
  return currentIndex.value
})

/**
 * Смещение слайда, изображающего соседа за краем. Вперёд — первый кадр уезжает
 * за последний, назад — последний встаёт перед первым.
 */
function displacementOf(id: string): number {
  if (wrapStep.value === 0 || total.value < 2)
    return 0

  const index = entries.value.findIndex(entry => entry.id === id)
  if (wrapStep.value === 1)
    return index === 0 ? total.value * 100 : 0

  return index === total.value - 1 ? total.value * -100 : 0
}

/**
 * Попадает ли кадр в окно отрисовки. Окно замкнуто вместе с лентой: при `loop`
 * соседи последнего кадра — первые, и не нарисовать их значит показать пустоту
 * ровно в момент замыкания кольца.
 */
function shouldRender(id: string): boolean {
  if (!props.virtual)
    return true

  const count = total.value
  if (count === 0)
    return true

  const index = entries.value.findIndex(entry => entry.id === id)
  if (index < 0)
    return true

  const overscan = Math.max(1, Math.trunc(props.virtualOverscan))
  const distance = Math.abs(index - currentIndex.value)

  return props.loop
    ? Math.min(distance, count - distance) <= overscan
    : distance <= overscan
}

/**
 * Конец замыкания: лента возвращается с позиции «за краем» на настоящий индекс.
 *
 * Модель здесь уже давно на новом кадре — её обновил `startWrap`. Отложи мы её
 * до этого момента, `update:modelValue` опаздывал бы на длительность перехода,
 * а там, где переходов нет вовсе, — на страховочный таймер.
 */
function finishWrap(): void {
  if (wrapStep.value === 0)
    return

  clearTimeout(wrapFallback)
  wrapFallback = undefined

  suppressTransition.value = true
  wrapStep.value = 0

  /*
   * Переход возвращается после **принудительной перерисовки**, а не через
   * `requestAnimationFrame`: в фоновой вкладке кадры не идут вовсе, и лента
   * осталась бы с выключенным переходом навсегда — то есть дальше дёргалась бы
   * вместо движения. Чтение `offsetHeight` фиксирует новое положение
   * синхронно, и это работает в любой вкладке.
   */
  void nextTick().then(() => {
    void trackEl.value?.offsetHeight
    suppressTransition.value = false
  })
}

/**
 * Замкнуть кольцо в сторону `direction`. Возвращает `false`, если шаг обычный
 * и его надо выполнить как раньше.
 */
function startWrap(direction: 1 | -1): boolean {
  if (!props.loop || total.value < 2)
    return false

  const atLast = currentIndex.value === total.value - 1
  const atFirst = currentIndex.value === 0
  if (!(direction === 1 ? atLast : atFirst))
    return false

  finishWrap()
  wrapStep.value = direction
  // Модель — сразу: она про то, какой кадр показан, а не про то, доехала ли
  // лента. Смещение и позиция «за краем» держатся до конца перехода.
  setIndex(direction === 1 ? 0 : total.value - 1)

  // `transitionend` в jsdom не наступает вовсе, а в живом браузере может не
  // прийти при прерванном переходе. Страховка возвращает ленту сама.
  wrapFallback = setTimeout(finishWrap, WRAP_FALLBACK_MS)
  return true
}

onBeforeUnmount(() => clearTimeout(wrapFallback))

function setIndex(next: number): void {
  const value = clampIndex(next, total.value)
  if (value === currentIndex.value)
    return

  internalIndex.value = value
  emit('update:modelValue', value)
}

const showIndicators = computed(() => resolvedIndicators.value !== 'none' && total.value > 1)
const showArrows = computed(() => props.arrows && total.value > 1)
const isThumbnails = computed(() => resolvedIndicators.value === 'thumbnails')

const atStart = computed(() => !props.loop && currentIndex.value <= 0)
const atEnd = computed(() => !props.loop && currentIndex.value >= total.value - 1)

const reducedMotion = ref(false)
const hovered = ref(false)
const documentHidden = ref(false)

/** `null` — тумблер не трогали, и решает проп. */
const userIntent = ref<boolean | null>(null)

const playing = computed(() => total.value > 1
  && (userIntent.value ?? (props.autoplay && !reducedMotion.value)))

/**
 * Живой регион читает кадр, только когда лента стоит: у движущейся карусели
 * объявление каждого кадра превратило бы страницу в неработающую.
 */
const liveMode = computed<'off' | 'polite'>(() => (playing.value ? 'off' : 'polite'))

const swipeGesture = useCarouselSwipe({
  disabled: () => !props.swipe || total.value <= 1,
  viewport: () => viewportEl.value,
  orientation: () => props.orientation,
  atEdge: direction => (direction === 1 ? atEnd.value : atStart.value),
  onStart: stopAutoplay,
  onSwipe: (direction) => {
    void stepBy(direction)
  },
})

const autoplayTimer = useCarouselAutoplay({
  interval: () => props.autoplayInterval,
  enabled: () => playing.value,
  paused: () => hovered.value || documentHidden.value || swipeGesture.isDragging.value,
  advance: () => {
    if (startWrap(1))
      return

    const next = stepIndex(currentIndex.value, 1, total.value, props.loop)
    // Упёрлись в край без `loop` — показ окончен, а не зациклился.
    if (next === currentIndex.value) {
      userIntent.value = false
      return
    }
    finishWrap()
    setIndex(next)
  },
})

function stopAutoplay(): void {
  if (!playing.value)
    return

  userIntent.value = false
  announce(t('gr.carousel.autoplayStopped', 'Automatic slide show stopped'))
}

/**
 * `aria-live` обязан стать `polite` **раньше**, чем поменяется содержимое:
 * иначе мутация случится, пока регион ещё `off`, и не прозвучит вовсе.
 */
async function commitUserNavigation(next: number): Promise<void> {
  if (playing.value) {
    stopAutoplay()
    await nextTick()
  }

  finishWrap()
  setIndex(next)
}

/**
 * Шаг на соседний кадр. На краю кольца замыкание идёт через смещение крайнего
 * слайда, а не через сброс индекса: сброс прокручивал бы ленту назад через всё.
 */
async function stepBy(delta: 1 | -1): Promise<void> {
  if (playing.value) {
    stopAutoplay()
    await nextTick()
  }

  if (startWrap(delta))
    return

  finishWrap()
  setIndex(stepIndex(currentIndex.value, delta, total.value, props.loop))
}

/**
 * Переход ленты доехал — можно снимать замыкание. Слушаем только свой узел
 * (`.self`): всплывший переход дочернего кадра снял бы кольцо раньше времени.
 */
function onTrackTransitionEnd(event: TransitionEvent): void {
  if (event.propertyName === 'transform')
    finishWrap()
}

function toggleAutoplay(): void {
  if (playing.value) {
    stopAutoplay()
    return
  }

  userIntent.value = true
  autoplayTimer.restart()
}

function goTo(index: number): void {
  void commitUserNavigation(clampIndex(index, total.value))
}

function step(delta: 1 | -1): void {
  void stepBy(delta as 1 | -1)
}

const roving = useRovingFocus<number>({
  items: () => entries.value.map((_, index) => index),
  elementFor: index => tabRefs.value[index],
  orientation: () => 'horizontal',
  // Кольцо полосы замкнуто независимо от `loop`: тот управляет стрелками и
  // показом, а выбрать любой кадр напрямую можно всегда.
  wrap: () => true,
  initialKey: () => (total.value > 0 ? currentIndex.value : undefined),
  // Прокрутка до фокуса, а не после: иначе браузер доскроллит по-своему и
  // полоса дёрнется дважды.
  beforeFocus: index => scrollTabIntoView(index),
})

// Лента укоротилась под текущим кадром: модель потребителя и картинка разошлись
// бы молча, поэтому индекс доводится до края и эмитится.
watch(total, (count) => {
  if (count === 0) {
    roving.reset()
    return
  }

  const requested = props.modelValue ?? internalIndex.value
  const clamped = clampIndex(requested, count)
  if (clamped !== requested) {
    internalIndex.value = clamped
    emit('update:modelValue', clamped)
  }
})

/**
 * Прокрутка **полосы**, а не страницы.
 *
 * `scrollIntoView` двигает всех предков, включая документ: карусель, уехавшая
 * под сгиб, на каждом шаге автопрокрутки утаскивала бы страницу обратно к себе.
 * Поэтому позиция считается сама и присваивается `scrollLeft` полосы.
 */
function scrollTabIntoView(index: number): void {
  const strip = indicatorsEl.value
  const tab = tabRefs.value[index]
  if (!strip || !tab)
    return

  const next = stripScrollLeft(
    strip.scrollLeft,
    strip.clientWidth,
    tab.offsetLeft,
    tab.offsetLeft + tab.offsetWidth,
  )

  if (next !== strip.scrollLeft)
    strip.scrollLeft = next
}

function setTabRef(el: Element | ComponentPublicInstance | null, index: number): void {
  tabRefs.value[index] = el as HTMLElement | null
}

function onIndicatorKeydown(event: KeyboardEvent): void {
  if (total.value === 0)
    return

  const current = roving.rovingKey.value ?? 0

  if ((event.key === 'Enter' || event.key === ' ') && resolvedActivation.value === 'manual') {
    event.preventDefault()
    void commitUserNavigation(current)
    return
  }

  // Стрелки, `Home`, `End` ведёт примитив. Выбор не вешается на его `onMove`:
  // клик тоже зовёт `focusKey`, и модель менялась бы дважды.
  if (!roving.handleNavigationKeys(event))
    return

  if (resolvedActivation.value !== 'manual')
    void commitUserNavigation(roving.rovingKey.value ?? current)
}

function onIndicatorClick(index: number): void {
  roving.setActive(index)
  void commitUserNavigation(index)
}

const { onFocusIn, onFocusOut } = useFocusWithin(rootEl, { enter: stopAutoplay })

const stripOverflow = ref<GrScrollOverflow>('none')
let resizeObserver: ResizeObserver | null = null
let measureScheduled = false

function measureOverflow(): void {
  const el = indicatorsEl.value

  if (!el || !isThumbnails.value) {
    stripOverflow.value = 'none'
    return
  }

  stripOverflow.value = resolveScrollOverflow(el.scrollLeft, el.scrollWidth, el.clientWidth)
}

function scheduleMeasure(): void {
  if (measureScheduled)
    return

  measureScheduled = true
  void nextTick(() => {
    measureScheduled = false
    measureOverflow()
  })
}

function onVisibilityChange(): void {
  documentHidden.value = document.hidden
}

onMounted(() => {
  // Браузерный API в теле `setup` разошёлся бы с серверным рендером.
  reducedMotion.value = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true

  document.addEventListener('visibilitychange', onVisibilityChange)
  scheduleMeasure()

  // На сервере и в jsdom `ResizeObserver` отсутствует — измерять там нечего.
  if (typeof ResizeObserver === 'undefined')
    return

  resizeObserver = new ResizeObserver(scheduleMeasure)
  if (indicatorsEl.value)
    resizeObserver.observe(indicatorsEl.value)
})

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', onVisibilityChange)
  resizeObserver?.disconnect()
  resizeObserver = null
})

watch([total, isThumbnails], scheduleMeasure)

// Кадр мог смениться не фокусом — показом или свайпом; переключатель всё равно
// обязан оказаться на виду.
watch(currentIndex, async (index) => {
  await nextTick()
  scrollTabIntoView(index)
})

function entryAt(index: number): GrCarouselSlideEntry | undefined {
  return entries.value[index]
}

function positionLabelAt(index: number): string {
  return t('gr.carousel.slidePosition', '{index} of {total}', {
    index: index + 1,
    total: total.value,
  })
}

function indicatorName(index: number): string {
  return entryAt(index)?.label() ?? positionLabelAt(index)
}

function tabDomId(index: number): string {
  return `${entryAt(index)?.id ?? index}-tab`
}

const trackStyle = computed(() => {
  const style: Record<string, string> = {
    '--gr-carousel-index': String(trackIndex.value),
    '--gr-carousel-drag': `${swipeGesture.offset.value}px`,
  }

  // На время жеста лента идёт за пальцем один в один: переход догонял бы курсор.
  if (swipeGesture.isDragging.value)
    style.transition = 'none'

  return style
})

provide(GR_CAROUSEL_CONTEXT, {
  register,
  indexOf: id => entries.value.findIndex(entry => entry.id === id),
  isCurrent: id => entries.value[currentIndex.value]?.id === id,
  total,
  slideRole: computed(() => (showIndicators.value ? 'tabpanel' : 'group')),
  slideRoledescription: computed(() => t('gr.carousel.slideRoledescription', 'slide')),
  tabIdFor: (id) => {
    if (!showIndicators.value)
      return undefined
    const index = entries.value.findIndex(entry => entry.id === id)
    return index >= 0 ? tabDomId(index) : undefined
  },
  positionLabel: (id) => {
    const index = entries.value.findIndex(entry => entry.id === id)
    return positionLabelAt(index >= 0 ? index : 0)
  },
  displacementOf,
  orientation: computed(() => props.orientation),
  shouldRender,
})

if (__GR_DEV__) {
  onMounted(() => {
    if (props.orientation !== 'vertical')
      return

    // Высота вьюпорта — обязательное условие вертикальной ленты, и молчаливый
    // отказ тут хуже ошибки: карусель превращается в столбец кадров, а причина
    // не видна ни в разметке, ни в консоли.
    if ((viewportEl.value?.clientHeight ?? 0) === 0) {
      console.warn(
        '[granularity] GrCarousel: у вертикальной ленты нулевая высота вьюпорта — '
        + 'шаг считается от неё. Задайте высоту классом или стилем, иначе кадры '
        + 'встанут столбцом.',
      )
    }
  })

  watchEffect(() => {
    if (!props.ariaLabel && !props.ariaLabelledby) {
      console.warn(
        '[granularity] GrCarousel: у карусели нет доступного имени — передайте '
        + '`ariaLabel` или `ariaLabelledby`. `aria-roledescription` именем не является.',
      )
    }

    if (!props.arrows && resolvedIndicators.value === 'none' && total.value > 1) {
      console.warn(
        '[granularity] GrCarousel: `arrows: false` вместе с `indicators: "none"` '
        + 'не оставляет ни одного способа сменить кадр с клавиатуры.',
      )
    }

    if (isThumbnails.value && total.value > 0
      && entries.value.every(entry => !entry.hasThumbnail() && !entry.thumbnailSrc())) {
      console.warn(
        '[granularity] GrCarousel: `indicators="thumbnails"`, но ни один слайд не дал '
        + 'миниатюру — задайте проп `thumbnail` или слот `#thumbnail` у `GrCarouselSlide`.',
      )
    }
  })
}

defineExpose({
  /** Текущий кадр — единственный способ прочитать позицию без `v-model`. */
  index: computed(() => currentIndex.value),
  /** Число кадров: состав живёт в слоте, снаружи его посчитать нечем. */
  count: total,
  /** Идёт ли показ. Пауза под курсором его не выключает. */
  playing: computed(() => playing.value),
  next: () => step(1),
  prev: () => step(-1),
  goTo,
  play: () => {
    if (!playing.value)
      toggleAutoplay()
  },
  pause: stopAutoplay,
})
</script>

<template>
  <div
    ref="rootEl"
    data-gr-carousel
    :class="[carouselRootBase, carouselRootAxis[props.orientation]]"
    :role="landmark ? 'region' : 'group'"
    :aria-roledescription="t('gr.carousel.roledescription', 'carousel')"
    :aria-label="ariaLabelledby ? undefined : ariaLabel"
    :aria-labelledby="ariaLabelledby"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <div
      ref="viewportEl"
      data-gr-carousel-viewport
      :class="[
        carouselViewportBase,
        carouselViewportAxis[props.orientation],
        carouselViewportTouchAction[props.orientation],
        props.swipe ? carouselViewportSwipeClass : '',
      ]"
      :aria-live="liveMode"
      aria-atomic="true"
      @pointerdown="swipeGesture.start"
    >
      <div
        ref="trackEl"
        data-gr-carousel-track
        :data-gr-carousel-vertical="props.orientation === 'vertical' ? '' : undefined"
        :data-gr-carousel-wrapping="suppressTransition ? '' : undefined"
        :class="[carouselTrackBase, carouselTrackAxis[props.orientation]]"
        :style="trackStyle"
        @transitionend.self="onTrackTransitionEnd"
      >
        <slot />
      </div>

      <button
        v-if="props.autoplay && total > 1"
        type="button"
        data-gr-carousel-toggle
        :class="carouselToggleClass"
        :aria-label="playing
          ? (pauseLabel ?? t('gr.carousel.pause', 'Stop automatic slide show'))
          : (playLabel ?? t('gr.carousel.play', 'Start automatic slide show'))"
        @click="toggleAutoplay"
      >
        <component :is="playing ? IconPause : IconPlay" :class="carouselIconClass" aria-hidden="true" />
      </button>

      <button
        v-if="showArrows"
        type="button"
        data-gr-carousel-prev
        :class="grCarouselControlClass('prev', atStart, props.orientation)"
        :aria-disabled="atStart ? 'true' : undefined"
        :aria-label="prevLabel ?? t('gr.carousel.previous', 'Previous slide')"
        @click="atStart ? undefined : step(-1)"
      >
        <slot name="prev" :disabled="atStart">
          <component
            :is="props.orientation === 'vertical' ? IconChevronUp : IconChevronLeft"
            :class="carouselIconClass"
            aria-hidden="true"
          />
        </slot>
      </button>

      <button
        v-if="showArrows"
        type="button"
        data-gr-carousel-next
        :class="grCarouselControlClass('next', atEnd, props.orientation)"
        :aria-disabled="atEnd ? 'true' : undefined"
        :aria-label="nextLabel ?? t('gr.carousel.next', 'Next slide')"
        @click="atEnd ? undefined : step(1)"
      >
        <slot name="next" :disabled="atEnd">
          <component
            :is="props.orientation === 'vertical' ? IconChevronDown : IconChevronRight"
            :class="carouselIconClass"
            aria-hidden="true"
          />
        </slot>
      </button>
    </div>

    <div
      v-if="showIndicators"
      ref="indicatorsEl"
      role="tablist"
      data-gr-carousel-indicators
      :data-variant="resolvedIndicators"
      :data-overflow="stripOverflow"
      :class="grCarouselIndicatorsClass(resolvedIndicators)"
      :aria-label="indicatorsLabel ?? t('gr.carousel.indicators', 'Slides')"
      @keydown="onIndicatorKeydown"
      @scroll.passive="scheduleMeasure"
    >
      <button
        v-for="(entry, index) in entries"
        :id="tabDomId(index)"
        :key="entry.id"
        :ref="el => setTabRef(el, index)"
        type="button"
        role="tab"
        data-gr-carousel-indicator
        :aria-selected="index === currentIndex ? 'true' : 'false'"
        :aria-controls="entry.id"
        :aria-label="indicatorName(index)"
        :tabindex="roving.tabindexFor(index)"
        :class="grCarouselIndicatorClass(resolvedIndicators, index === currentIndex, resolvedTone)"
        @click="onIndicatorClick(index)"
      >
        <component :is="entry.thumbnail" v-if="isThumbnails && entry.hasThumbnail()" />
        <img
          v-else-if="isThumbnails && entry.thumbnailSrc()"
          :src="entry.thumbnailSrc()"
          alt=""
          loading="lazy"
          decoding="async"
          :class="carouselThumbImageClass"
        >
        <span v-else-if="isThumbnails" :class="carouselThumbFallbackClass">{{ index + 1 }}</span>
      </button>
    </div>
  </div>
</template>

<style>
[data-gr-carousel-track] {
  transform: translateX(calc(var(--gr-carousel-index, 0) * -100% + var(--gr-carousel-drag, 0px)));
}

/*
 * Снятие индекса после замыкания кольца обязано пройти без анимации: иначе
 * лента поедет обратно через все кадры — ровно тот ход, ради устранения
 * которого замыкание и сделано.
 */
[data-gr-carousel-track][data-gr-carousel-wrapping] {
  transition: none;
}

/*
 * Вертикальная лента: шаг считается от **высоты вьюпорта**, а не от высоты
 * самой ленты. Поэтому вьюпорту нужна определённая высота — без неё колонка
 * кадров растёт по содержимому, и `-100%` означает всю ленту разом.
 *
 * Направление письма вертикали не касается, поэтому RTL-зеркала здесь нет.
 */
[data-gr-carousel-track][data-gr-carousel-vertical],
[dir='rtl'] [data-gr-carousel-track][data-gr-carousel-vertical] {
  transform: translateY(calc(var(--gr-carousel-index, 0) * -100% + var(--gr-carousel-drag, 0px)));
}

/*
 * Индекс зеркалится, смещение жеста — нет: палец двигает ленту на столько же
 * физических пикселей независимо от направления письма.
 */
[dir='rtl'] [data-gr-carousel-track] {
  transform: translateX(calc(var(--gr-carousel-index, 0) * 100% + var(--gr-carousel-drag, 0px)));
}

[data-gr-carousel-indicators][data-variant='thumbnails'] {
  /*
   * `scrollIntoView({ inline: 'nearest' })` прижимает миниатюру вплотную к краю.
   * Без отступа прокрутки фокус-кольцо оказалось бы ровно под затуханием.
   */
  scroll-padding-inline: var(--gr-carousel-thumbs-fade, 1.5rem);
}

[data-gr-carousel-indicators][data-overflow='start'] {
  --gr-carousel-thumbs-mask: linear-gradient(to right, transparent 0, #000 var(--gr-carousel-thumbs-fade, 1.5rem));
}

[data-gr-carousel-indicators][data-overflow='end'] {
  --gr-carousel-thumbs-mask: linear-gradient(to right, #000 calc(100% - var(--gr-carousel-thumbs-fade, 1.5rem)), transparent 100%);
}

[data-gr-carousel-indicators][data-overflow='both'] {
  --gr-carousel-thumbs-mask: linear-gradient(
    to right,
    transparent 0,
    #000 var(--gr-carousel-thumbs-fade, 1.5rem),
    #000 calc(100% - var(--gr-carousel-thumbs-fade, 1.5rem)),
    transparent 100%
  );
}

[dir='rtl'] [data-gr-carousel-indicators][data-overflow='start'] {
  --gr-carousel-thumbs-mask: linear-gradient(to left, transparent 0, #000 var(--gr-carousel-thumbs-fade, 1.5rem));
}

[dir='rtl'] [data-gr-carousel-indicators][data-overflow='end'] {
  --gr-carousel-thumbs-mask: linear-gradient(to left, #000 calc(100% - var(--gr-carousel-thumbs-fade, 1.5rem)), transparent 100%);
}

[data-gr-carousel-indicators]:is([data-overflow='start'], [data-overflow='end'], [data-overflow='both']) {
  -webkit-mask-image: var(--gr-carousel-thumbs-mask);
  mask-image: var(--gr-carousel-thumbs-mask);
}
</style>
