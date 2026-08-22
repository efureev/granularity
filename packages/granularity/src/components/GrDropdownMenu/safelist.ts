import { splitClassTokens } from '../shared/classTokens'

import {
    alignClass,
    borderBottomClass,
  borderEdgeClass,
    borderTopClass,
    colsClass,
    columnBaseClass,
    columnsBaseClass,
    dividerClass,
    dividerInsetClass,
    dividersClass,
    headerClass,
    itemBaseClass,
    itemDisabledClass,
    itemIndicatorClass,
    itemInteractiveClass,
    itemShortcutClass,
    itemVariantClass,
    listBaseClass,
    textAlignClass,
} from './grDropdownMenuStyles'

/**
 * Классы каталога живут в `.ts`-хелпере, а его бандлер волен вынести в общий
 * `dist/chunks/` — вне области скана компонента. Симптом промаха тут особенно
 * незаметный: размеры пунктов на месте, а выравнивание, колонки и цвета
 * пропали. Гейт — `src/__tests__/safelist.test.ts`.
 */
export const grDropdownMenuSafelist = [...new Set([
    ...Object.values(alignClass).flatMap(splitClassTokens),
    ...Object.values(textAlignClass).flatMap(splitClassTokens),
    ...Object.values(colsClass).flatMap(splitClassTokens),
    ...Object.values(itemVariantClass).flatMap(splitClassTokens),
    ...splitClassTokens(itemBaseClass),
    ...splitClassTokens(itemInteractiveClass),
    ...splitClassTokens(itemDisabledClass),
    ...splitClassTokens(itemIndicatorClass),
    ...splitClassTokens(itemShortcutClass),
    ...splitClassTokens(headerClass),
    ...splitClassTokens(listBaseClass),
    ...splitClassTokens(dividersClass),
    ...splitClassTokens(borderEdgeClass),
    ...splitClassTokens(borderTopClass),
    ...splitClassTokens(borderBottomClass),
    ...splitClassTokens(columnsBaseClass),
    ...splitClassTokens(columnBaseClass),
    ...splitClassTokens(dividerClass),
    ...splitClassTokens(dividerInsetClass),
])]
