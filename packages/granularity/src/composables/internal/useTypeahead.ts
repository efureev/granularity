import { getCurrentInstance, onBeforeUnmount } from 'vue'

/**
 * Буфер живёт ровно столько: дальше набранное перестаёт быть одним словом.
 * Значение из WAI-ARIA APG, оно же стояло во всех трёх прежних копиях.
 */
export const TYPEAHEAD_RESET_MS = 600

export interface UseTypeaheadOptions<TItem> {
  /** Кандидаты в порядке отображения. Опрашивается на каждый символ. */
  items: () => readonly TItem[]
  /** Текст кандидата. Нормализацию (`trim` + нижний регистр) делает композабл. */
  textOf: (item: TItem, index: number) => string
  /** Откуда шагать. Получает уже разрешённый набор, чтобы не опрашивать его дважды. */
  currentIndex: (items: readonly TItem[]) => number
  /** Совпадение найдено. Фокус, `activeIndex` — решает потребитель. */
  onMatch: (item: TItem, index: number) => void
  resetMs?: number
}

export interface UseTypeaheadReturn {
  /** Обработать печатный символ. `true` — совпадение найдено. */
  type: (char: string) => boolean
  /** Пуст ли буфер: правило «`Space` при пустом буфере активирует пункт». */
  isEmpty: () => boolean
  reset: () => void
}

/**
 * Поиск по первым буквам в списке — паттерн `typeahead` из WAI-ARIA APG.
 *
 * Буфер намеренно не реактивный: на рендер он не влияет, а читается синхронно
 * внутри обработчика `keydown`.
 */
export function useTypeahead<TItem>(options: UseTypeaheadOptions<TItem>): UseTypeaheadReturn {
  const resetMs = options.resetMs ?? TYPEAHEAD_RESET_MS

  let buffer = ''
  let timer: ReturnType<typeof setTimeout> | undefined

  function reset(): void {
    clearTimeout(timer)
    timer = undefined
    buffer = ''
  }

  function type(char: string): boolean {
    clearTimeout(timer)
    timer = setTimeout(reset, resetMs)

    // Повтор одной буквы — это «следующий на ту же букву», а не поиск «аа».
    // Сравнение по нормализованному символу: иначе `Shift+A` и `a` считались бы
    // разными буквами, и повтор с зажатым шифтом уходил бы в поиск «Aa».
    const normalized = char.toLowerCase()
    const repeat = buffer.length === 1 && buffer === normalized
    buffer = repeat ? normalized : buffer + normalized

    const items = options.items()
    if (items.length === 0)
      return false

    const from = options.currentIndex(items)

    for (let step = 1; step <= items.length; step += 1) {
      const index = (from + step + items.length) % items.length
      const item = items[index]
      if (item === undefined)
        continue

      if (options.textOf(item, index).trim().toLowerCase().startsWith(buffer)) {
        options.onMatch(item, index)
        return true
      }
    }

    return false
  }

  // Композабл вызывается и вне компонента (тесты, чистые модули навигации),
  // поэтому уборку вешаем только когда есть на что.
  if (getCurrentInstance())
    onBeforeUnmount(reset)

  return {
    type,
    isEmpty: () => buffer === '',
    reset,
  }
}
