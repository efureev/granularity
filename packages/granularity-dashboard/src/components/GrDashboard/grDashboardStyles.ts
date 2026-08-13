import type { GrDashboardMetrics } from '../../layout'

export type GrDashboardMode = 'view' | 'edit'

/**
 * Инлайновые стили сетки.
 *
 * Числами, а не классами: колонки, зазор и высота строки приходят пропами, и
 * шкалы утилит для произвольного числа колонок не существует. Значения при этом
 * проходят через `--gr-dashboard-*`, чтобы тема могла их перебить.
 */
export function gridStyle(metrics: GrDashboardMetrics): Record<string, string> {
  return {
    '--gr-dashboard-gap': `${metrics.gap}px`,
    '--gr-dashboard-row-height': `${metrics.rowHeight}px`,
    'gridTemplateColumns': `repeat(${metrics.cols}, minmax(0, 1fr))`,
    'gridAutoRows': 'var(--gr-dashboard-row-height)',
    'gap': 'var(--gr-dashboard-gap)',
  }
}
