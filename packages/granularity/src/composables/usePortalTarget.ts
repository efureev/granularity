import type { ComputedRef } from 'vue'
import { computed } from 'vue'

import { useGrConfig } from '../components/GrConfigProvider/context'
import { ensurePortalRoot } from './internal/portalRoot'
import { useTeleportEnabled } from './internal/useTeleportEnabled'

export interface PortalTarget {
  /** Куда телепортировать: элемент портала либо селектор из конфига. */
  target: ComputedRef<string | HTMLElement>
  /**
   * Можно ли телепортировать прямо сейчас. `false` на сервере и на первом
   * клиентском рендере — иначе разметка разъедется на гидрации.
   */
  enabled: ComputedRef<boolean>
}

/**
 * Куда монтируются оверлеи пакета.
 *
 * Приоритет: локальное переопределение компонента (`teleportTo`) →
 * `portalTarget` из `GrConfigProvider` → общий корень `#gr-portal`, который
 * создаётся при первом обращении.
 *
 * ```vue
 * const { target, enabled } = usePortalTarget(() => props.teleportTo)
 *
 * <teleport :to="target" :disabled="!enabled">…</teleport>
 * ```
 *
 * Композабл публичный: свой оверлей потребителя должен уезжать туда же, куда и
 * оверлеи библиотеки, — иначе он окажется вне ветки портала и будет помечен
 * `inert` вместе со страницей, как только откроется модалка.
 */
export function usePortalTarget(local?: () => string | HTMLElement | undefined): PortalTarget {
  const config = useGrConfig()
  const teleportEnabled = useTeleportEnabled()

  const target = computed<string | HTMLElement>(() => {
    const explicit = local?.() ?? config.portalTarget?.value
    if (explicit) return explicit

    // Корень создаётся лениво и только на клиенте; до монтирования телепорт
    // выключен, поэтому `body` здесь — недостижимый запасной вариант, а не
    // рабочая ветка.
    return ensurePortalRoot() ?? 'body'
  })

  return { target, enabled: computed(() => teleportEnabled.value) }
}
