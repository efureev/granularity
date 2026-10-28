import type { GrControlShape } from '../shared/controlShape'
import { controlPillPaddingX, controlPillPaddingXClass } from '../shared/controlShape'

/**
 * Классы нативного поля и аддонов `GrInput`. Рамку, её высоту, скругление и
 * кольцо фокуса рисует лист поля по атрибутам оболочки (`grFieldLook.ts`): фокус
 * получает инпут внутри, а рамку рисует оболочка вместе с аддонами.
 */

export const sizes = {
  xs: 'h-full text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'h-full text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'h-full text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)]',
  lg: 'h-full text-[length:var(--gr-control-text-lg)] leading-[var(--gr-control-leading-lg)]',
} as const

export type GrInputSize = keyof typeof sizes

/**
 * Горизонтальный отступ отдельно от размера: он зависит ещё и от формы. В
 * пилюле отступ обязан быть не меньше половины высоты, иначе текст заезжает в
 * дугу — таблица общая на все поля-коробки.
 */
export const paddingXClass: Record<GrControlShape, Record<GrInputSize, string>> = {
  box: {
    xs: 'px-2.5',
    sm: 'px-3',
    md: 'px-3',
    lg: 'px-4',
  },
  pill: controlPillPaddingXClass,
}

/**
 * То же число, но значением: аддоны задают паддинги инлайн-стилем, а он
 * перекрывает класс — значение нужно обеим формам, и расходиться им нельзя.
 * Сторожит `controlShape.test.ts`.
 */
export const paddingX: Record<GrControlShape, Record<GrInputSize, string>> = {
  box: {
    xs: '10px',
    sm: '12px',
    md: '12px',
    lg: '16px',
  },
  pill: controlPillPaddingX,
}

export const textAlign = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const

export function grInputFieldClass(options: {
  size: GrInputSize
  align: keyof typeof textAlign
  shape: GrControlShape
}): string {
  return [
    sizes[options.size],
    paddingXClass[options.shape][options.size],
    textAlign[options.align],
  ].join(' ')
}

/**
 * Аддон-сегмент: отрезан рамкой и держит ширину не меньше ступени размера — так
 * поле с «₽» и поле с «USD» выстраиваются в колонку, а не пляшут по ширине.
 */
export const addonSegmentPrefixClass = 'border-r border-[var(--gr-brd)] px-2'
export const addonSegmentSuffixClass = 'border-l border-[var(--gr-brd)] px-2'

/**
 * Украшение внутри рамки: ни разделителя, ни своей ширины — лупа в поисковой
 * строке, единица измерения, счётчик.
 *
 * Отдельный режим, а не «сегмент без рамки»: у сегмента ширина выровнена по
 * ступени размера, и иконка в нём висела бы в пустом отсеке. Здесь поле берёт
 * ровно ту ширину, что заняло содержимое, а текст начинается сразу за ним.
 */
export const addonInlinePrefixClass = 'pl-3 pr-2'
export const addonInlineSuffixClass = 'pl-2 pr-3'
