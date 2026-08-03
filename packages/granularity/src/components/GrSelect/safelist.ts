import { splitClassTokens } from '../shared/classTokens'
import {
  defaultBaseClass,
  grSelectLinkNativeLabelBaseClass,
  grSelectLinkNativeLabelDisabledClass,
  grSelectLinkNativeLabelFocusClass,
  grSelectLinkNativeOverlayClass,
  grSelectPanelClasses,
  linkBaseClass,
  selectLinkNativeLabelVariantClassByVariant,
  selectLinkSizeClassBySize,
  selectLinkVariantClassByVariant,
  selectSizeClassBySize,
} from './grSelectStyles'

// Всё, что живёт в `grSelectStyles.ts`: и вычисляемые мапы, и строковые литералы
// оболочки, link-режима, native-overlay и панели. Хелпер уезжает в общий
// `dist/chunks/`, вне области скана компонента — гейт `src/__tests__/safelist.test.ts`.
export const grSelectSafelist = [...new Set([
  ...Object.values(selectSizeClassBySize).flatMap(splitClassTokens),
  ...splitClassTokens(defaultBaseClass),
  ...splitClassTokens(linkBaseClass),
  ...splitClassTokens(grSelectLinkNativeOverlayClass),
  ...splitClassTokens(grSelectLinkNativeLabelBaseClass),
  ...splitClassTokens(grSelectLinkNativeLabelDisabledClass),
  ...splitClassTokens(grSelectLinkNativeLabelFocusClass),
  ...splitClassTokens(grSelectPanelClasses),
  ...Object.values(selectLinkSizeClassBySize).flatMap(splitClassTokens),
  ...Object.values(selectLinkVariantClassByVariant).flatMap(splitClassTokens),
  ...Object.values(selectLinkNativeLabelVariantClassByVariant).flatMap(splitClassTokens),
  ...splitClassTokens('no-underline underline underline-offset-4 hover:underline hover:underline-offset-4 peer-hover:underline peer-hover:underline-offset-4'),
  ...splitClassTokens('disabled:opacity-60 disabled:cursor-not-allowed disabled:text-[var(--gr-muted-fg)] disabled:no-underline'),
  ...splitClassTokens('disabled:opacity-50 disabled:cursor-not-allowed'),
  ...splitClassTokens('appearance-none pr-9'),
  ...splitClassTokens('inline-flex items-center gap-1 text-left'),
  ...splitClassTokens('flex items-center justify-between text-left'),
  ...splitClassTokens('block min-w-full w-max whitespace-nowrap'),
])]
