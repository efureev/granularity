import { inject, provide, type InjectionKey, type Ref } from 'vue'

import type { GrComponentSize } from './sizes'

/**
 * Подсказка ступени для иконки от контейнера, внутри которого она стоит.
 *
 * Иконка в слоте кнопки обязана расти вместе с кнопкой, а не со своим
 * дефолтом: 18px рядом с кеглем 12 у `xs` читались крупнее подписи. Явный
 * `size` у иконки сильнее подсказки, подсказка сильнее `GrConfigProvider` —
 * контейнер ближе к иконке, чем глобальный конфиг.
 */
const iconSizeHintKey: InjectionKey<Ref<GrComponentSize>> = Symbol('GrIconSizeHint')

export function provideGrIconSizeHint(size: Ref<GrComponentSize>): void {
  provide(iconSizeHintKey, size)
}

export function useGrIconSizeHint(): Ref<GrComponentSize> | undefined {
  return inject(iconSizeHintKey, undefined)
}
