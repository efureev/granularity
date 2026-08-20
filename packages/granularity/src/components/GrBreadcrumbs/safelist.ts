import { splitClassTokens } from '../shared/classTokens'
import {
  breadcrumbsCurrentClass,
  breadcrumbsEllipsisClass,
  breadcrumbsItemIconClass,
  breadcrumbsItemWrapClass,
  breadcrumbsLabelClass,
  breadcrumbsListClass,
  breadcrumbsListNowrapClass,
  breadcrumbsListWrapClass,
  breadcrumbsRootClass,
  breadcrumbsSeparatorClass,
  breadcrumbsSizeClassBySize,
} from './grBreadcrumbsStyles'

// Всё, что живёт в `grBreadcrumbsStyles.ts`: и мапа размеров, и строковые
// литералы. Хелпер уезжает в общий `dist/chunks/`, вне области скана
// компонента — гейт `src/__tests__/safelist.test.ts`.
export const grBreadcrumbsSafelist = [...new Set([
  ...Object.values(breadcrumbsSizeClassBySize).flatMap(splitClassTokens),
  ...splitClassTokens(breadcrumbsRootClass),
  ...splitClassTokens(breadcrumbsListClass),
  ...splitClassTokens(breadcrumbsListWrapClass),
  ...splitClassTokens(breadcrumbsListNowrapClass),
  ...splitClassTokens(breadcrumbsSeparatorClass),
  ...splitClassTokens(breadcrumbsCurrentClass),
  ...splitClassTokens(breadcrumbsItemIconClass),
  ...splitClassTokens(breadcrumbsItemWrapClass),
  ...splitClassTokens(breadcrumbsLabelClass),
  ...splitClassTokens(breadcrumbsEllipsisClass),
])]
