import type { GrControlState } from '../shared/sizes'

import type { GrInputSize } from '../GrInput'

export type GrTreeSelectState = GrControlState

export const sizeClassBySize: Record<GrInputSize, string> = {
  xs: 'h-7 px-2.5 text-[length:var(--gr-control-text-xs)]',
  sm: 'h-8 px-3 text-[length:var(--gr-control-text-sm)]',
  md: 'h-10 px-3 text-[length:var(--gr-control-text-md)]',
  lg: 'h-11 px-4 text-[length:var(--gr-control-text-lg)]',
}

/**
 * Горизонтальный отступ из `sizeClassBySize`, но числом: аддоны задают паддинг
 * инлайн-стилем, а он перекрывает класс — значение нужно обеим формам, и
 * расходиться им нельзя.
 */
export const paddingX: Record<GrInputSize, string> = {
  xs: '10px',
  sm: '12px',
  md: '12px',
  lg: '16px',
}

/** Ширина зоны шеврона/крестика справа (`pr-9` в классе триггера). */
export const trailingZoneWidth = '2.25rem'

export const borderClassByState: Record<GrTreeSelectState, string> = {
  default: 'border-[var(--gr-brd)]',
  success: 'border-[var(--gr-success)] focus-visible:ring-[var(--gr-success)]',
  warning: 'border-[var(--gr-warning)] focus-visible:ring-[var(--gr-warning)]',
  danger: 'border-[var(--gr-danger)] focus-visible:ring-[var(--gr-danger)]',
}

/**
 * Ошибка валидации красится своей ролью, а не декоративным тоном `danger`:
 * `state="danger"` — это подсветка по решению разработчика, `invalid` — вердикт
 * валидации, и тема вправе развести их по цвету.
 */
export const invalidBorderClass = 'border-[var(--gr-invalid-brd)] focus-visible:ring-[var(--gr-invalid-ring)]'

/**
 * Disabled красится фоном и цветом текста, а не прозрачностью: `opacity`
 * разбавляет выверенные на AA токены и роняет контраст подписи.
 */
export const shellEnabledClass = 'bg-[var(--gr-bg)] text-[var(--gr-fg)]'
export const shellDisabledClass = 'bg-[var(--gr-muted)] text-[var(--gr-muted-fg)] cursor-not-allowed'

export function grTreeSelectClass(options: {
  size: GrInputSize
  state: GrTreeSelectState
  invalid: boolean
  disabled?: boolean
}): string {
  return [
    sizeClassBySize[options.size],
    'pr-9',
    options.disabled ? shellDisabledClass : shellEnabledClass,
    options.invalid ? invalidBorderClass : borderClassByState[options.state],
  ].join(' ')
}

export const grTreeSelectPanelClass = 'rounded-[var(--gr-radius-xl)] border border-[var(--gr-brd)] bg-[var(--gr-card)] text-[var(--gr-card-fg)] shadow-[var(--gr-shadow-2)] overflow-hidden'

/**
 * Строка состояния панели: загрузка и «нет данных». По центру и с двойным
 * воздухом — тот же язык, что у `GrSelect`, `GrAutocomplete` и палитры команд.
 * Слева она расходилась с содержимым дерева на паддинг скроллера.
 */
export const grTreeSelectStateClass = 'flex items-center justify-center gap-2 px-3 py-4 text-center text-[length:var(--gr-text-sm)] text-[var(--gr-muted-fg)]'
