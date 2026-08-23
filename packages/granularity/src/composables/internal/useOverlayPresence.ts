import type { Ref } from 'vue'
import { ref, watch } from 'vue'

export interface OverlayPresence {
  /** Смонтировано ли поддерево слоя: держится до конца leave-анимации. */
  mounted: Ref<boolean>
  /** Показан ли слой: этим переключаются `<Transition>` внутри. */
  visible: Ref<boolean>
  /** Вызывается из `@after-leave` панели. */
  onPanelAfterLeave: () => void
}

/**
 * Присутствие оверлея в DOM отдельно от его видимости.
 *
 * Штатный `<Transition>` анимирует свой элемент, но не координирует соседей:
 * убери обёртку по `v-if` — и подложка с панелью исчезнут мгновенно, без
 * leave-анимации. Поэтому присутствие поддерева и видимость слоя — два разных
 * флага: первый снимается только по концу leave-анимации панели.
 *
 * Видимость включается **в том же такте**, что и монтирование: содержимое окна
 * обязано появляться в DOM сразу после открытия — на этом стоит и код
 * потребителя, и внутренние компоненты, которые ищут в панели свои элементы.
 * Enter-анимацию это не отменяет: `<Transition appear>` проигрывает её и на
 * первом рендере ребёнка.
 */
export function useOverlayPresence(open: Ref<boolean>): OverlayPresence {
  const mounted = ref(open.value)
  const visible = ref(open.value)

  watch(open, (isOpen) => {
    if (isOpen)
      mounted.value = true
    visible.value = isOpen
  })

  function onPanelAfterLeave(): void {
    // Пока панель уезжала, слой могли открыть заново — тогда размонтировать
    // нечего и незачем.
    if (!open.value)
      mounted.value = false
  }

  return { mounted, visible, onPanelAfterLeave }
}
