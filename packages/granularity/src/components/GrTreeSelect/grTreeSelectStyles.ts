import type { GrControlShape } from '../shared/controlShape'
import { controlPillPaddingX, controlPillPaddingXClass } from '../shared/controlShape'

import type { GrControlState } from '../shared/sizes'
import { overlayListPanelClass } from '../shared/overlayListPanel'
import { overlayPanelSurfaceClass } from '../shared/overlayPanelSurface'

import type { GrInputSize } from '../GrInput'

export type GrTreeSelectState = GrControlState

export const sizeClassBySize: Record<GrInputSize, string> = {
  xs: 'text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)]',
  lg: 'text-[length:var(--gr-control-text-lg)] leading-[var(--gr-control-leading-lg)]',
}

/** Отступ зависит и от размера, и от формы — см. `shared/controlShape.ts`. */
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
 * Тот же отступ числом: аддоны задают паддинг инлайн-стилем, а он перекрывает
 * класс — значение нужно обеим формам, и расходиться им нельзя.
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

/** Ширина зоны шеврона/крестика справа (`pr-9` в классе триггера). */
export const trailingZoneWidth = '2.25rem'

/** Рамку рисует лист поля (`GrInput`) по атрибутам триггера; цвет текста — утилитой: `docs/field.md`. */
export function grTreeSelectClass(options: { size: GrInputSize, shape: GrControlShape, disabled?: boolean }): string {
  return [
    sizeClassBySize[options.size],
    paddingXClass[options.shape][options.size],
    'pr-9',
    options.disabled ? 'text-[var(--gr-muted-fg)]' : 'text-[var(--gr-fg)]',
  ].join(' ')
}

export const grTreeSelectPanelClass = `${overlayPanelSurfaceClass} ${overlayListPanelClass} overflow-hidden`

/**
 * Строка состояния панели: загрузка и «нет данных». По центру и с двойным
 * воздухом — тот же язык, что у `GrSelect`, `GrAutocomplete` и палитры команд.
 * Слева она расходилась с содержимым дерева на паддинг скроллера.
 */
export const grTreeSelectStateClass = 'flex items-center justify-center gap-2 px-3 py-4 text-center text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]'
