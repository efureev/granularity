<script setup lang="ts">
import { computed, inject, onBeforeUnmount, ref, useId, useSlots } from 'vue'

import { GR_CAROUSEL_CONTEXT } from './grCarouselContext'
import { carouselSlideBase } from './grCarouselStyles'

export interface GrCarouselSlideProps {
  /** Имя слайда: подпись его переключателя и доступное имя самого кадра. */
  label?: string
  /** URL миниатюры для `indicators="thumbnails"`. Слот `#thumbnail` сильнее. */
  thumbnail?: string
}

const props = withDefaults(defineProps<GrCarouselSlideProps>(), {
  label: undefined,
  thumbnail: undefined,
})

defineSlots<{
  /** Содержимое кадра. */
  default?: () => unknown
  /**
   * Своя разметка миниатюры. Рендерит её полоса переключателей `GrCarousel`,
   * поэтому `<slot name="thumbnail">` здесь не стоит: узел уезжает наверх при
   * регистрации. Появится он тут — понадобится запись в `DOMAIN_SLOTS` гейта
   * `slotContract.test.ts`.
   */
  thumbnail?: () => unknown
}>()

const carousel = inject(GR_CAROUSEL_CONTEXT)

if (!carousel) {
  throw new Error('GrCarouselSlide must be used inside GrCarousel')
}

const slots = useSlots()
const slideId = useId()
const rootEl = ref<HTMLElement | null>(null)

// Ссылка создаётся один раз: `:is` со стабильной ссылкой не перемонтирует
// миниатюру на каждый рендер полосы.
function renderThumbnail(): unknown {
  return slots.thumbnail?.()
}

onBeforeUnmount(carousel.register({
  id: slideId,
  label: () => props.label,
  thumbnailSrc: () => props.thumbnail,
  hasThumbnail: () => Boolean(slots.thumbnail),
  thumbnail: renderThumbnail,
  el: () => rootEl.value,
}))

const isCurrent = computed(() => carousel.isCurrent(slideId))
const labelledBy = computed(() => carousel.tabIdFor(slideId))
const accessibleName = computed(() => props.label ?? carousel.positionLabel(slideId))
</script>

<template>
  <div
    :id="slideId"
    ref="rootEl"
    data-gr-carousel-slide
    :class="carouselSlideBase"
    :role="carousel!.slideRole.value"
    :aria-roledescription="carousel!.slideRoledescription.value"
    :aria-labelledby="labelledBy"
    :aria-label="labelledBy ? undefined : accessibleName"
    :inert="isCurrent ? undefined : true"
  >
    <slot />
  </div>
</template>
