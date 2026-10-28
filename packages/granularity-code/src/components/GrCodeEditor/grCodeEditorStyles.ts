import type { GrCodeIssue } from './editorState'
import {
  codeSurfaceFontClass,
  codeSurfacePaddings,
  codeSurfaceTextSizes,
} from '../../internal/codeSurface'

/**
 * Оформление редактора.
 *
 * Поверхность общая с блоком и диффом (`internal/codeSurface`): редактор и блок
 * стоят на одной странице, и разойдись кегль — семейство рассыпается. Рамка
 * контрола и её состояния — поле ядра; своё здесь — подсказка и замечания.
 */

/** Класс-хук для собственного `<style>`: CSS из него не порождается. */
export const editorHookClass = 'gr-code-editor'

/**
 * Подложку — кодовую, общую с блоком и диффом, — ставит лист редактора поверх
 * рамки поля ядра; цвет текста — утилитой: `packages/granularity/docs/field.md`.
 */
export const editorRootClass = 'min-w-0'

export function editorTextColorClass(disabled: boolean): string {
  return disabled ? 'text-[var(--gr-disabled-fg)]' : 'text-[var(--gr-code-block-fg,var(--gr-fg))]'
}

export const editorFontClass = codeSurfaceFontClass
export const editorPaddings = codeSurfacePaddings
export const editorTextSizes = codeSurfaceTextSizes

/** Подсказка под полем: как выйти из редактора, когда `Tab` делает отступ. */
export const editorHintClass = 'px-3 py-1 text-[var(--gr-muted-fg)]'

/** Полоса замечаний под полем. Связывается с полем через `aria-describedby`. */
export const editorIssuesClass = 'border-t border-[var(--gr-brd)] px-3 py-1'

export const editorIssueTone: Record<GrCodeIssue['severity'], string> = {
  error: 'text-[var(--gr-invalid-text)]',
  warning: 'text-[var(--gr-warning-text)]',
  info: 'text-[var(--gr-muted-fg)]',
}
