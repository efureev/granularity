import type { GrControlShape } from '../shared/controlShape'
import { controlPillPaddingX, controlPillPaddingXClass, controlShapeRadiusClass } from '../shared/controlShape'

/**
 * Классы `GrInput`.
 *
 * Единственный источник правды: те же карты были продублированы инлайн в
 * `GrInput.vue`, копии разошлись (`focus-visible:` против `focus-within:`), и
 * safelist декларировал классы, которых в разметке нет.
 *
 * Кольцо фокуса живёт на оболочке через `focus-within`: фокус получает инпут
 * внутри, а рамку рисует оболочка вместе с аддонами.
 */

export const sizes = {
  xs: 'h-full text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'h-full text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'h-full text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)]',
  lg: 'h-full text-[length:var(--gr-control-text-lg)] leading-[var(--gr-control-leading-lg)]',
} as const

/**
 * Высота ступени живёт на **оболочке**, а не на самом `input`.
 *
 * Оболочка несёт рамку, и держи высоту внутренний элемент — рамка прибавлялась
 * бы к ступени сверху: поле выходило на 2 px выше `GrSelect`, у которого рамка и
 * высота на одном элементе. Замерено линейкой на странице Foundations: 30 против
 * 28 на `xs`. Теперь ступень — это внешняя высота у всех.
 */
export const shellHeightClass: Record<GrInputSize, string> = {
  xs: 'h-7',
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-11',
}

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

export const states = {
  default: 'border-[var(--gr-brd)]',
  success: 'border-[var(--gr-success)] focus-within:ring-[var(--gr-success)]',
  warning: 'border-[var(--gr-warning)] focus-within:ring-[var(--gr-warning)]',
  danger: 'border-[var(--gr-danger)] focus-within:ring-[var(--gr-danger)]',
} as const

/**
 * Ошибка валидации красится своей ролью, а не декоративным тоном `danger`:
 * `state="danger"` — это подсветка по решению разработчика, `invalid` — вердикт
 * валидации, и тема вправе развести их по цвету.
 */
export const invalidClass = 'border-[var(--gr-invalid-brd)] focus-within:ring-[var(--gr-invalid-ring)]'

export type GrInputState = keyof typeof states

/**
 * Скругление приходит формой и потому не здесь. `overflow-hidden` при этом на
 * месте: он обрезает отсек аддона и степперы по внешней дуге, и «скруглять
 * только внешние углы» получается само.
 */
export const shellBaseClass = 'relative w-full overflow-hidden border transition-colors duration-[var(--gr-duration-fast)] focus-within:ring-2 focus-within:ring-[var(--gr-ring)]'

export const shellEnabledClass = 'bg-[var(--gr-bg)]'

/**
 * Заблокированное поле гасится фоном, а не `opacity`: прозрачность разбавляет
 * выверенные на AA токены текста и роняет контраст. Фон взаимоисключающий с
 * `shellEnabledClass` — два `bg-*` одной специфичности разрулил бы порядок в
 * сгенерированном CSS, а не порядок в списке классов.
 */
export const shellDisabledClass = 'bg-[var(--gr-muted)] text-[var(--gr-muted-fg)] cursor-not-allowed'

export function grInputShellClass(options: {
  state: GrInputState
  invalid: boolean
  disabled: boolean
  shape: GrControlShape
  size: GrInputSize
}): string {
  return [
    shellBaseClass,
    shellHeightClass[options.size],
    controlShapeRadiusClass[options.shape],
    options.invalid ? invalidClass : states[options.state],
    options.disabled ? shellDisabledClass : shellEnabledClass,
  ].join(' ')
}

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
