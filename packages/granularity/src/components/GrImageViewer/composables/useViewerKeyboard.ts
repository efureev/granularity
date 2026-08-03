export interface ViewerKeyboardActions {
  close: () => void
  prev: () => void
  next: () => void
  zoomIn: () => void
  zoomOut: () => void
  reset: () => void
}

export interface UseViewerKeyboardOptions {
  actions: ViewerKeyboardActions
}

/**
 * useViewerKeyboard — клавиатурное управление просмотрщиком: стрелки —
 * переключение, `+`/`-`/`0` — зум/сброс.
 *
 * Esc сюда не входит: он идёт через общий стек dismissible-слоёв
 * (`useDismissible`), иначе просмотрщик, открытый поверх модалки, закрывал бы
 * не себя. Локальный `@keydown` до него всё равно не дошёл бы — стек гасит
 * событие в capture-фазе.
 */
export function useViewerKeyboard(options: UseViewerKeyboardOptions) {
  const { actions } = options

  function onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        actions.prev()
        return

      case 'ArrowRight':
        event.preventDefault()
        actions.next()
        return

      case '+':
      case '=':
      case 'Add':
        event.preventDefault()
        actions.zoomIn()
        return

      case '-':
      case '_':
      case 'Subtract':
        event.preventDefault()
        actions.zoomOut()
        return

      case '0':
        event.preventDefault()
        actions.reset()
        break

      default:
    }
  }

  return { onKeydown }
}
