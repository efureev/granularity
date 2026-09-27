import { splitClassTokens } from '../../internal/classTokens'
import { codeTokenClass } from '../shared/grCodeBlockStyles'

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
 * `codeTokenClass` объявляется и здесь намеренно. Общий с блоком модуль лежит в
 * `components/shared/` — вне директории любого компонента, — и в файлы
 * компонента попадает общим чанком. granum извлекает классы по графу бандла и
 * такой чанк видит, но safelist остаётся страховкой на случай, когда класс
 * собирается из вычисляемой мапы и целой строкой в бандле не встречается.
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
