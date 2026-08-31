import { splitClassTokens } from '../../internal/classTokens'
import { codeTokenClass } from '../GrCodeBlock/grCodeBlockStyles'

import {
  editorDisabledClass,
  editorFocusClass,
  editorFontClass,
  editorHintClass,
  editorInvalidClass,
  editorIssuesClass,
  editorIssueTone,
  editorPaddings,
  editorReadonlyClass,
  editorRootClass,
  editorTextSizes,
} from './grCodeEditorStyles'

/**
 * Классы из вычисляемых мап и `.ts`-хелперов — только safelist.
 *
 * `codeTokenClass` объявляется и здесь: общий с блоком модуль в `dist` не
 * принадлежит ни одной директории компонента, а пресет сканирует только
 * `dist/components/<Name>/**`.
 *
 * `editorHookClass` сюда НЕ идёт: это селектор собственного `<style>`.
 */
export const grCodeEditorSafelist = [...new Set([
  ...splitClassTokens(editorRootClass),
  ...splitClassTokens(editorFocusClass),
  ...splitClassTokens(editorFontClass),
  ...splitClassTokens(editorInvalidClass),
  ...splitClassTokens(editorDisabledClass),
  ...splitClassTokens(editorReadonlyClass),
  ...splitClassTokens(editorHintClass),
  ...splitClassTokens(editorIssuesClass),
  ...Object.values(editorPaddings).flatMap(splitClassTokens),
  ...Object.values(editorTextSizes).flatMap(splitClassTokens),
  ...Object.values(editorIssueTone).flatMap(splitClassTokens),
  ...Object.values(codeTokenClass).flatMap(splitClassTokens),
])]
