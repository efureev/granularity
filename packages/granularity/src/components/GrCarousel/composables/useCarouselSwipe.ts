import { ref } from 'vue'
import type { Ref } from 'vue'

import { useDragGesture } from '../../../composables/useDragGesture'
import {
  resistOffset,
  resolveSwipeDirection,
  SWIPE_AXIS_RATIO,
  swipeThresholdFor,
} from '../carouselNavigation'

/**
 * Что внутри слайда остаётся нажатием, а не превращается в протяжку. Ссылка и
 * кнопка в онбординг-слайде — обычный интерактив, и жест их перехватывать
 * не вправе (приём `GrToaster`).
 */
const INTERACTIVE_SELECTOR = 'a[href], button, input, textarea, select, summary, [role="button"], [contenteditable]'

export interface UseCarouselSwipeOptions {
  disabled: () => boolean
  /** Вьюпорт: у него спрашиваются ширина и направление письма. */
  viewport: () => HTMLElement | null
  /** Порог пройден. Направление логическое: `1` — вперёд, `-1` — назад. */
  onSwipe: (direction: 1 | -1) => void
  /** Листать в эту сторону некуда — жест идёт вязко. */
  atEdge: (direction: 1 | -1) => boolean
  /** Жест начался: показ пора ставить на паузу. */
  onStart?: () => void
}

export interface UseCarouselSwipeReturn {
  isDragging: Ref<boolean>
  /** Смещение ленты за указателем, px. Физическое: зеркалит его CSS, не JS. */
  offset: Ref<number>
  /** Вешается на `@pointerdown` вьюпорта. */
  start: (event: PointerEvent) => void
}

export function useCarouselSwipe(options: UseCarouselSwipeOptions): UseCarouselSwipeReturn {
  const offset = ref(0)

  let startX = 0
  let startY = 0
  let threshold = 0
  let rtl = false

  function reset(): void {
    offset.value = 0
  }

  const drag = useDragGesture({
    disabled: options.disabled,
    onStart: (event) => {
      const target = event.target as HTMLElement | null
      if (target?.closest(INTERACTIVE_SELECTOR))
        return false

      const viewport = options.viewport()
      if (!viewport)
        return false

      startX = event.clientX
      startY = event.clientY
      offset.value = 0

      // Замеры снимаются один раз на жест и в обработчике, а не в `setup`:
      // на сервере ни ширины, ни направления письма не существует.
      threshold = swipeThresholdFor(viewport.getBoundingClientRect().width)
      rtl = getComputedStyle(viewport).direction === 'rtl'

      options.onStart?.()
    },
    onMove: (event) => {
      // `useDragGesture` намеренно не зовёт `preventDefault`, а без него
      // протяжка выделяет текст слайда.
      event.preventDefault()

      const dx = event.clientX - startX
      const dy = event.clientY - startY

      // Пока жест выглядит вертикальным, лента не двигается: это прокрутка
      // страницы, и перехватывать её карусель не вправе.
      if (Math.abs(dx) < Math.abs(dy) * SWIPE_AXIS_RATIO) {
        offset.value = 0
        return
      }

      const logical = physicalToLogical(dx < 0 ? 1 : -1)
      offset.value = resistOffset(dx, options.atEdge(logical))
    },
    onEnd: (event) => {
      const direction = event
        ? resolveSwipeDirection(event.clientX - startX, event.clientY - startY, threshold)
        : 0

      reset()

      if (direction !== 0)
        options.onSwipe(physicalToLogical(direction))
    },
    // Обрыв — не жест: указатель забрал браузер, а не пользователь довёл
    // протяжку. Кадр возвращается на место, слайд не меняется.
    onCancel: reset,
  })

  /** В RTL содержимое течёт справа налево, и палец влево листает назад. */
  function physicalToLogical(direction: 1 | -1): 1 | -1 {
    return rtl ? (direction === 1 ? -1 : 1) : direction
  }

  return { isDragging: drag.isDragging, offset, start: drag.start }
}
