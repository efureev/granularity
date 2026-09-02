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
import { clampIndex, stepIndex } from './carouselNavigation'
import { useCarouselAutoplay } from './composables/useCarouselAutoplay'
import { useCarouselSwipe } from './composables/useCarouselSwipe'
import { GR_CAROUSEL_CONTEXT } from './grCarouselContext'
import type { GrCarouselSlideEntry } from './grCarouselContext'
import {
  carouselIconClass,
  carouselRootBase,
  carouselThumbFallbackClass,
  carouselThumbImageClass,
  carouselToggleClass,
  carouselTrackBase,
  carouselViewportBase,
  carouselViewportSwipeClass,
  grCarouselControlClass,
  grCarouselIndicatorClass,
  grCarouselIndicatorsClass,
} from './grCarouselStyles'
import type { GrCarouselActivationMode, GrCarouselIndicators } from './grCarouselStyles'

import IconChevronLeft from '~icons/lucide/chevron-left'
import IconChevronRight from '~icons/lucide/chevron-right'
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
  /** Вид переключателя кадров. `none` меняет и роль самих слайдов. */
  indicators?: GrCarouselIndicators
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
  // Дефолт живёт в резолвере: Vue подставил бы свой раньше `GrConfigProvider`,
  // и «пользователь передал» стало бы неотличимо от «сработал дефолт».
  indicators: undefined,
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
}>()

const { t } = useGranularityTranslations()
const { announce } = useAnnouncer()

const resolvedIndicators = useGrComponentProp('GrCarousel', 'indicators', () => props.indicators, 'dots')
const resolvedActivation = useGrComponentProp('GrCarousel', 'activationMode', () => props.activationMode, 'automatic')

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

const internalIndex = ref(0)
const currentIndex = computed(() => clampIndex(props.modelValue ?? internalIndex.value, total.value))

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
  atEdge: direction => (direction === 1 ? atEnd.value : atStart.value),
  onStart: stopAutoplay,
  onSwipe: (direction) => {
    void commitUserNavigation(stepIndex(currentIndex.value, direction, total.value, props.loop))
  },
})

const autoplayTimer = useCarouselAutoplay({
  interval: () => props.autoplayInterval,
  enabled: () => playing.value,
  paused: () => hovered.value || documentHidden.value || swipeGesture.isDragging.value,
  advance: () => {
    const next = stepIndex(currentIndex.value, 1, total.value, props.loop)
    // Упёрлись в край без `loop` — показ окончен, а не зациклился.
    if (next === currentIndex.value) {
      userIntent.value = false
      return
    }
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

  setIndex(next)
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
  void commitUserNavigation(stepIndex(currentIndex.value, delta, total.value, props.loop))
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

function scrollTabIntoView(index: number): void {
  tabRefs.value[index]?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
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
    '--gr-carousel-index': String(currentIndex.value),
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
})

if (__GR_DEV__) {
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
    :class="carouselRootBase"
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
      :class="[carouselViewportBase, props.swipe ? carouselViewportSwipeClass : '']"
      :aria-live="liveMode"
      aria-atomic="true"
      @pointerdown="swipeGesture.start"
    >
      <div
        data-gr-carousel-track
        :class="carouselTrackBase"
        :style="trackStyle"
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
        :class="grCarouselControlClass('prev', atStart)"
        :aria-disabled="atStart ? 'true' : undefined"
        :aria-label="prevLabel ?? t('gr.carousel.previous', 'Previous slide')"
        @click="atStart ? undefined : step(-1)"
      >
        <IconChevronLeft :class="carouselIconClass" aria-hidden="true" />
      </button>

      <button
        v-if="showArrows"
        type="button"
        data-gr-carousel-next
        :class="grCarouselControlClass('next', atEnd)"
        :aria-disabled="atEnd ? 'true' : undefined"
        :aria-label="nextLabel ?? t('gr.carousel.next', 'Next slide')"
        @click="atEnd ? undefined : step(1)"
      >
        <IconChevronRight :class="carouselIconClass" aria-hidden="true" />
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
        :class="grCarouselIndicatorClass(resolvedIndicators, index === currentIndex)"
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
