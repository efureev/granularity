import { splitClassTokens } from '../shared/classTokens'
import {
  DEFAULT_GR_DRAWER_BODY_CONFIG,
  DEFAULT_GR_DRAWER_FOOTER_CONFIG,
  DEFAULT_GR_DRAWER_HEADER_CONFIG,
  footerBorderClass,
  headerBorderClass,
  overlayClass,
  panelBaseClass,
  panelHeightBySize,
  panelInteractiveClass,
  panelSideClass,
  panelTransitionClass,
  panelWidthBySize,
  rootClass,
  rootPassThroughClass,
  srOnlyTitleClass,
  titleClass,
} from './grDrawerStyles'

// И динамические токены (`side`/`size`), и литералы отделки панели: `grDrawerStyles.ts`
// бандлер волен вынести в общий `dist/chunks/`, вне области скана компонента —
// гейт `src/__tests__/safelist.test.ts`.
const sectionDefaults = [
  DEFAULT_GR_DRAWER_HEADER_CONFIG,
  DEFAULT_GR_DRAWER_BODY_CONFIG,
  DEFAULT_GR_DRAWER_FOOTER_CONFIG,
].flatMap(config => [config.paddingX, config.paddingY])

export const grDrawerSafelist = [...new Set([
  ...Object.values(panelSideClass).flatMap(splitClassTokens),
  ...Object.values(panelWidthBySize).flatMap(splitClassTokens),
  ...Object.values(panelHeightBySize).flatMap(splitClassTokens),
  ...Object.values(panelTransitionClass).flatMap(splitClassTokens),
  ...splitClassTokens(panelBaseClass),
  ...splitClassTokens(panelInteractiveClass),
  ...splitClassTokens(rootClass),
  ...splitClassTokens(rootPassThroughClass),
  ...splitClassTokens(overlayClass),
  ...splitClassTokens(headerBorderClass),
  ...splitClassTokens(footerBorderClass),
  ...splitClassTokens(titleClass),
  ...splitClassTokens(srOnlyTitleClass),
  ...sectionDefaults.flatMap(splitClassTokens),
])]
