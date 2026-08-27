import type { GrIssue } from './issues'
import { readGrOverlayLayers, readGrVirtualLists } from '../internal/devChannel'

/**
 * Состояние дизайн-системы одним JSON — чтобы приложить к issue.
 *
 * Собирается на стороне панели из того, что у неё уже есть: своего состояния
 * она не заводит. В отчёт не попадают ни DOM-ссылки, ни функции — его должно
 * быть можно вставить в текст.
 */
export interface GrDevtoolsReport {
  version: string
  capturedAt: string
  layers: unknown[]
  virtualLists: unknown[]
  issues: GrIssue[]
}

export function buildReport(issues: GrIssue[]): GrDevtoolsReport {
  return {
    version: __GR_DEVTOOLS_VERSION__,
    capturedAt: new Date().toISOString(),
    layers: readGrOverlayLayers() ?? [],
    virtualLists: readGrVirtualLists(),
    issues,
  }
}
