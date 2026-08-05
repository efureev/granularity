import type { GrDrawerSide, GrDrawerSize } from './grDrawerStyles'

/**
 * Пропы `GrDrawer`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrDrawer: { … } }">`.
 *
 * `size` здесь — шкала оверлея (`sm…full`), а не шкала контролов, поэтому
 * глобальный `size` провайдера к нему не применяется: `<GrConfigProvider
 * size="xs">` про кегль кнопок, а не про ширину выезжающей панели. Канал один —
 * точечный `componentDefaults`.
 */
export interface GrDrawerConfigurableProps {
  size: GrDrawerSize
  side: GrDrawerSide
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrDrawer: GrDrawerConfigurableProps
  }
}
