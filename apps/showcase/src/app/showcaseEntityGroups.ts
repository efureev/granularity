import { componentGroupOrder } from '../content/handAuthored.ts'
import type { ShowcasePageName } from './showcaseModel.ts'

const packageGroupOrder: readonly string[] = ['ungrouped', 'runtime', 'overlays', 'feedback', 'validation']

export function getEntityGroupOrder(pageName: ShowcasePageName): readonly string[] {
  return pageName === 'components' ? componentGroupOrder : packageGroupOrder
}

// Порядок групп задан руками, а не сортировкой по заголовку: заголовок локализован,
// и от него порядок пунктов сайдбара менялся при переключении языка.
export function compareEntityGroups(pageName: ShowcasePageName, left: string, right: string): number {
  const order = getEntityGroupOrder(pageName)
  const leftRank = order.indexOf(left)
  const rightRank = order.indexOf(right)

  const normalizedLeftRank = leftRank === -1 ? order.length : leftRank
  const normalizedRightRank = rightRank === -1 ? order.length : rightRank

  if (normalizedLeftRank !== normalizedRightRank)
    return normalizedLeftRank - normalizedRightRank

  return left.localeCompare(right, 'en')
}
