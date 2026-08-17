import { splitClassTokens } from '../shared/classTokens'

import {
  codeBlockCopyClass,
  codeBlockNowrapClass,
  codeBlockPaddings,
  codeBlockRootClass,
  codeBlockScrollClass,
  codeBlockSurfaceClass,
  codeBlockTextSizes,
  codeBlockWrapClass,
  codeTokenClass,
} from './grCodeBlockStyles'

// Классы из вычисляемых мап (роль токена, размер) UnoCSS сканом не находит —
// только safelist. Литералы хелпера туда же: на сборке он уезжает в общий чанк.
//
// `codeBlockHookClass` и `codeBlockNumberedClass` сюда НЕ идут: это селекторы
// собственного `<style>` компонента, CSS из них не порождается, и гейт
// `documentedConfig` справедливо считал бы такую запись мёртвой.
export const grCodeBlockSafelist = [...new Set([
  ...splitClassTokens(codeBlockRootClass),
  ...splitClassTokens(codeBlockSurfaceClass),
  ...splitClassTokens(codeBlockScrollClass),
  ...splitClassTokens(codeBlockWrapClass),
  ...splitClassTokens(codeBlockNowrapClass),
  ...splitClassTokens(codeBlockCopyClass),
  ...Object.values(codeBlockPaddings).flatMap(splitClassTokens),
  ...Object.values(codeBlockTextSizes).flatMap(splitClassTokens),
  ...Object.values(codeTokenClass).flatMap(splitClassTokens),
])]
