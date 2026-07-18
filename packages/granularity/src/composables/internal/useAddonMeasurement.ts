import { nextTick, onBeforeUnmount, onMounted, onUpdated, ref } from 'vue'
import type { Ref } from 'vue'

/**
 * Измерение фактической ширины prefix/suffix add-on'ов через `ResizeObserver`.
 * Общая логика GrInput/GrNumberInput (раньше дублировалась ~60 строк в каждом).
 *
 * Потребитель вешает возвращённые `prefixEl`/`suffixEl` на DOM-элементы аддонов
 * и передаёт реактивные `hasPrefix`/`hasSuffix` (обычно — наличие слотов).
 * Возвращает измеренные ширины (`"<n>px"` или `undefined`, если элемент
 * отсутствует/скрыт/нулевой — например, в jsdom).
 */
export function useAddonMeasurement(hasPrefix: Ref<boolean>, hasSuffix: Ref<boolean>) {
  const prefixEl = ref<HTMLElement | null>(null)
  const suffixEl = ref<HTMLElement | null>(null)

  const measuredPrefixWidth = ref<string | undefined>(undefined)
  const measuredSuffixWidth = ref<string | undefined>(undefined)

  let ro: ResizeObserver | null = null
  let scheduled = false

  function readWidthPx(el: HTMLElement | null): string | undefined {
    if (!el) return undefined

    const width = Math.ceil(el.getBoundingClientRect().width || 0)
    // jsdom часто отдаёт 0; не перезатираем fallback minWidth в этом случае.
    if (width <= 0) return undefined

    return `${width}px`
  }

  function measure(): void {
    measuredPrefixWidth.value = hasPrefix.value ? readWidthPx(prefixEl.value) : undefined
    measuredSuffixWidth.value = hasSuffix.value ? readWidthPx(suffixEl.value) : undefined
  }

  function refreshObserver(): void {
    if (typeof ResizeObserver === 'undefined') return
    if (!ro) ro = new ResizeObserver(() => measure())

    ro.disconnect()
    if (prefixEl.value) ro.observe(prefixEl.value)
    if (suffixEl.value) ro.observe(suffixEl.value)
  }

  function scheduleMeasure(): void {
    if (scheduled) return
    scheduled = true

    void nextTick(() => {
      scheduled = false
      measure()
      refreshObserver()
    })
  }

  onMounted(() => scheduleMeasure())
  onUpdated(() => scheduleMeasure())
  onBeforeUnmount(() => ro?.disconnect())

  return {
    prefixEl,
    suffixEl,
    measuredPrefixWidth,
    measuredSuffixWidth,
  }
}

/** Складывает две CSS-длины: числовые `px` — арифметически, иначе через `calc()`. */
export function addLen(a: string, b: string): string {
  if (a === '0px') return b
  if (b === '0px') return a

  const apx = a.endsWith('px') ? Number(a.slice(0, -2)) : null
  const bpx = b.endsWith('px') ? Number(b.slice(0, -2)) : null

  if (apx !== null && Number.isFinite(apx) && bpx !== null && Number.isFinite(bpx)) {
    return `${apx + bpx}px`
  }

  return `calc(${a} + ${b})`
}
