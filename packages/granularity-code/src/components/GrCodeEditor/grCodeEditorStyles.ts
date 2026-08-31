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
 * стоят на одной странице, и разойдись кегль — семейство рассыпается. Своё
 * здесь только то, чего у них нет: рамка контрола, состояния и замечания.
 */

/** Класс-хук для собственного `<style>`: CSS из него не порождается. */
export const editorHookClass = 'gr-code-editor'

export const editorRootClass
  = 'min-w-0 rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)] bg-[var(--gr-code-block-bg,var(--gr-muted))] text-[var(--gr-code-block-fg,var(--gr-fg))]'

/**
 * Кольцо фокуса — на обёртке, а не на редактируемой области.
 *
 * Фокус живёт на `contenteditable` внутри CodeMirror, и своё кольцо он не
 * рисует. `focus-within` переносит его наружу — так же, как это делает
 * `GrFileUpload` вокруг нативного `input`.
 */
export const editorFocusClass = 'focus-within:ring-2 focus-within:ring-[var(--gr-ring)]'

/**
 * Ошибка красится ролями `--gr-invalid-*`, а не `--gr-danger`: декоративный
 * тон и вердикт валидации — разные сообщения, и тема вправе развести их.
 */
export const editorInvalidClass = 'border-[var(--gr-invalid-brd)]'

/**
 * Disabled гасится **токеном фона**, а не `opacity`: прозрачность разбавляет
 * выверенные на AA токены текста и роняет контраст.
 */
export const editorDisabledClass = 'bg-[var(--gr-muted)] text-[var(--gr-muted-fg)] cursor-not-allowed'

export const editorReadonlyClass = 'bg-[var(--gr-muted)]'

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
