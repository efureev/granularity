import type { GrComponentSize } from '../GrConfigProvider/context'

/**
 * Пропы `GrBottomNav`, настраиваемые глобально через `componentDefaults`.
 *
 * Шкала у панели своя по смыслу: ступень тянет высоту полосы, глиф и кегль
 * подписи, но не трогает тач-таргет пункта — он остаётся 44×44 на любой
 * ступени (см. `grBottomNavStyles.ts`).
 */
export interface GrBottomNavConfigurableProps {
  size: GrComponentSize
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrBottomNav: GrBottomNavConfigurableProps
  }
}
