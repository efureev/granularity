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
  xs: 'h-7 px-2.5 text-[12px]',
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-3 text-[14px]',
  lg: 'h-11 px-4 text-[16px]',
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

export type GrInputState = keyof typeof states

export const shellBaseClass = 'relative w-full overflow-hidden rounded-md border transition-colors duration-150 focus-within:ring-2 focus-within:ring-[var(--gr-ring)]'

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
    options.invalid ? states.danger : states[options.state],
    options.disabled ? shellDisabledClass : shellEnabledClass,
  ].join(' ')
}

export function grInputFieldClass(options: {
  size: keyof typeof sizes
  align: keyof typeof textAlign
}): string {
  return [sizes[options.size], textAlign[options.align]].join(' ')
}
