/**
 * grModalTopStack — общий стек открытых `GrModal` для вычисления «верхнего»
 * (последнего открытого) окна независимо от дерева рендера.
 *
 * Зачем нужен:
 * HeadlessUI ловит фокус (`FocusTrap` с `FocusLock`) у каждого открытого
 * `<Dialog>` и помечает остальную часть страницы как inert. Когда модалки
 * рендерятся в разных деревьях (например, диалоги `useDialogService`
 * монтируются отдельным `render()` в `document.body`), их HeadlessUI-стек не
 * общий: каждый `<Dialog>` считает себя верхним и продолжает удерживать фокус.
 * В итоге нижнее окно «ворует» фокус у верхнего диалога — нельзя, например,
 * сфокусировать input в открытом поверх `prompt`.
 *
 * Решение: единый стек регистраций. Верхней считается последняя
 * зарегистрированная модалка. Все нижние окна уведомляются (`setTopmost(false)`)
 * и помечают свой корень `inert`, освобождая фокус для верхнего окна. Когда
 * верхнее окно закрывается, следующая по стеку модалка снова становится
 * верхней (`setTopmost(true)`) и снимает `inert`.
 */

export interface GrModalTopEntry {
  /** Уникальный id зарегистрированной модалки. */
  id: number
  /** Колбэк-уведомление: является ли модалка сейчас верхней. */
  setTopmost: (isTopmost: boolean) => void
}

const stack: GrModalTopEntry[] = []
let nextId = 1

/** Пересчитывает «верхнее» окно и уведомляет все зарегистрированные модалки. */
function sync(): void {
  const lastIndex = stack.length - 1
  stack.forEach((entry, index) => entry.setTopmost(index === lastIndex))
}

/** Регистрирует открытую модалку как верхнюю и возвращает её id. */
export function pushGrModalTop(entry: Omit<GrModalTopEntry, 'id'>): number {
  const id = nextId++
  stack.push({ ...entry, id })
  sync()
  return id
}

/** Снимает модалку со стека (при закрытии или размонтировании). */
export function removeGrModalTop(id: number): void {
  const index = stack.findIndex(item => item.id === id)
  if (index >= 0) stack.splice(index, 1)
  sync()
}

/** Тестовая/служебная очистка стека. */
export function resetGrModalTopStack(): void {
  stack.splice(0, stack.length)
}
