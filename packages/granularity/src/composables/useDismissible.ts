import type { Ref } from 'vue'
import { onUnmounted, watch } from 'vue'

import { pushDismissLayer, removeDismissLayer } from './internal/dismissStack'

export interface UseDismissibleOptions {
  /**
   * Закрывать ли слой по Esc. Геттер, а не значение, — чтобы читать реактивный
   * проп (`closeOnEsc`). По умолчанию закрывается всегда.
   *
   * Если геттер вернёт `false`, нажатие всё равно не пройдёт на слой ниже:
   * пользователь видит верхний слой, и Esc адресован ему.
   */
  closeOnEscape?: () => boolean
}

/**
 * Регистрирует оверлей в общем стеке dismissible-слоёв, пока `open` истинно.
 *
 * Контракт один на все оверлеи пакета: **Esc закрывает верхний слой** — тот,
 * что открыт последним, — и ниже не проваливается. Поэтому панель, открытая
 * внутри модалки, по Esc закрывает себя, а не модалку; следующий Esc закроет
 * уже модалку.
 *
 * Композабл нужен и потребителю: свой поповер, меню или подсказка, построенные
 * поверх `useFloating()`, обязаны участвовать в том же стеке — иначе они снова
 * разъедутся с оверлеями библиотеки.
 *
 * ```ts
 * const open = ref(false)
 * useDismissible(open, () => { open.value = false })
 * ```
 *
 * Закрытие по клику вне слоя — отдельная задача, для неё есть директива
 * `vClickOutside`: у Esc есть порядок слоёв, у клика — точка попадания.
 */
export function useDismissible(
  open: Ref<boolean>,
  onDismiss: () => void,
  options: UseDismissibleOptions = {},
): void {
  let layerId: number | null = null

  function register(): void {
    if (layerId !== null) return
    layerId = pushDismissLayer({
      shouldClose: () => options.closeOnEscape?.() ?? true,
      close: onDismiss,
    })
  }

  function unregister(): void {
    if (layerId === null) return
    removeDismissLayer(layerId)
    layerId = null
  }

  watch(
    open,
    (isOpen) => {
      if (isOpen) register()
      else unregister()
    },
    { immediate: true },
  )

  onUnmounted(unregister)
}
