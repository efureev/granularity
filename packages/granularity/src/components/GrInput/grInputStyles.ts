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
  xs: 'h-7 px-2.5 text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'h-8 px-3 text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'h-10 px-3 text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)]',
  lg: 'h-11 px-4 text-[length:var(--gr-control-text-lg)] leading-[var(--gr-control-leading-lg)]',
} as const

/**
 * Горизонтальный padding из `sizes`, но числом: аддоны задают паддинги инлайн-
 * стилем, а он перекрывает класс — значение нужно обеим формам, и расходиться
 * им нельзя.
 */
export const paddingX = {
  xs: '10px',
  sm: '12px',
  md: '12px',
  lg: '16px',
} as const

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

export const shellBaseClass = 'relative w-full overflow-hidden rounded-[var(--gr-radius-control)] border transition-colors duration-[var(--gr-duration-fast)] focus-within:ring-2 focus-within:ring-[var(--gr-ring)]'

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
}): string {
  return [
    shellBaseClass,
    options.invalid ? invalidClass : states[options.state],
    options.disabled ? shellDisabledClass : shellEnabledClass,
  ].join(' ')
}

export function grInputFieldClass(options: {
  size: keyof typeof sizes
  align: keyof typeof textAlign
}): string {
  return [sizes[options.size], textAlign[options.align]].join(' ')
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
