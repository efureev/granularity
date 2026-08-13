import { onBeforeUnmount, ref, type Ref, watch } from 'vue'

/**
 * Фактический размер элемента.
 *
 * Публичного `useResizeObserver` в ядре нет, поэтому свой — по образцу гарда в
 * `useVirtualList`: **отсутствие `ResizeObserver` это рабочий режим, а не
 * отказ**. Его нет ни на сервере, ни в jsdom, и график обязан рисоваться и
 * там — на объявленных размерах.
 *
 * `ready` отличает замер от оценки: пока он `false`, на экране раскладка от
 * объявленной ширины, ровно та же, что ушла с сервера. Уточнение после
 * монтирования приходит обычным обновлением, а не расхождением гидрации.
 */
export interface UseElementSizeOptions {
  initialWidth?: () => number
  initialHeight?: () => number
}

export interface UseElementSizeReturn {
  width: Ref<number>
  height: Ref<number>
  ready: Ref<boolean>
}

export function useElementSize(
  target: Ref<HTMLElement | null>,
  options: UseElementSizeOptions = {},
): UseElementSizeReturn {
  const width = ref(options.initialWidth?.() ?? 0)
  const height = ref(options.initialHeight?.() ?? 0)
  const ready = ref(false)

  let observer: ResizeObserver | null = null

  function measure(element: HTMLElement): void {
    const rect = element.getBoundingClientRect()

    // Нулевой замер — не «ширина ноль», а «раскладки ещё нет»: скрытая вкладка,
    // `display: none`, jsdom. Затирать им объявленный размер нельзя, иначе
    // график схлопнется в точку.
    if (rect.width > 0)
      width.value = rect.width
    if (rect.height > 0)
      height.value = rect.height

    ready.value = rect.width > 0
  }

  function disconnect(): void {
    observer?.disconnect()
    observer = null
  }

  watch(target, (element) => {
    disconnect()

    if (!element || typeof ResizeObserver === 'undefined')
      return

    measure(element)
    observer = new ResizeObserver(() => measure(element))
    observer.observe(element)
  }, { immediate: true, flush: 'post' })

  watch(() => options.initialWidth?.(), (value) => {
    if (!ready.value && value !== undefined)
      width.value = value
  })

  watch(() => options.initialHeight?.(), (value) => {
    if (value !== undefined && !ready.value)
      height.value = value
  })

  onBeforeUnmount(disconnect)

  return { width, height, ready }
}
