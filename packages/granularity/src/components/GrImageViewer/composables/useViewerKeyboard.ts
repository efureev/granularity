export interface ViewerKeyboardActions {
  close: () => void
  prev: () => void
  next: () => void
  zoomIn: () => void
  zoomOut: () => void
  reset: () => void
}

export interface UseViewerKeyboardOptions {
  /** Закрывать ли по Escape (проп `closeOnPressEscape`). */
  closeOnEscape: () => boolean
  actions: ViewerKeyboardActions
}

/**
 * useViewerKeyboard — клавиатурное управление просмотрщиком:
 * Esc — закрыть, стрелки — переключение, `+`/`-`/`0` — зум/сброс.
 */
export function useViewerKeyboard(options: UseViewerKeyboardOptions) {
  const { actions } = options

  function onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        if (!options.closeOnEscape())
          return
        event.preventDefault()
        actions.close()
        return

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
