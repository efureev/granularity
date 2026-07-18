import { onUnmounted, watch } from 'vue'
import type { Ref } from 'vue'

/**
 * Пока `open` истинно, слушает `keydown` на `document` и вызывает `onEscape`
 * по нажатию Esc; снимает слушатель при закрытии и размонтировании.
 *
 * Общая dismiss-логика floating-компонентов (GrSelect/GrDropdown) — раньше
 * дублировалась (`closeOnEscape` + watch(open) + onUnmounted) в каждом.
 * Click-outside у этих компонентов закрывается общей директивой `vClickOutside`,
 * поэтому здесь только Esc-часть.
 */
export function useEscapeToClose(open: Ref<boolean>, onEscape: () => void): void {
  function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') onEscape()
  }

  watch(
    open,
    (isOpen) => {
      if (typeof document === 'undefined') return

      document.removeEventListener('keydown', onKeydown)
      if (isOpen) document.addEventListener('keydown', onKeydown)
    },
    { immediate: true },
  )

  onUnmounted(() => {
    if (typeof document === 'undefined') return
    document.removeEventListener('keydown', onKeydown)
  })
}
