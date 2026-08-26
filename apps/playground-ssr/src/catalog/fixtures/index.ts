import { granularityComponentConfigs } from '@feugene/granularity/granular-provider'
import { granularityChartsComponentConfigs } from '@feugene/granularity-charts/granular-provider'
import { granularityChronoComponentConfigs } from '@feugene/granularity-chrono/granular-provider'
import { granularityDashboardComponentConfigs } from '@feugene/granularity-dashboard/granular-provider'
import { granularityEditorComponentConfigs } from '@feugene/granularity-editor/granular-provider'
import { granularityFormsSchemaComponentConfigs } from '@feugene/granularity-forms-schema/granular-provider'
import { granularityMediaComponentConfigs } from '@feugene/granularity-media/granular-provider'

import type { ComponentFixture } from '../fixture'

import {
  chartsFixtures,
  chronoFixtures,
  dashboardFixtures,
  editorFixtures,
  formsSchemaFixtures,
  mediaFixtures,
} from './companions'
import { coreFixtures } from './core'

/**
 * Пакет экосистемы: его реестр компонентов и фикстуры к нему.
 *
 * Реестр — тот же `granular-provider`, по которому пресет собирает safelist, а
 * витрина строит обход axe. Список компонентов руками здесь не держится: у него
 * уже есть источник правды, и второй разошёлся бы с ним молча.
 */
export interface FixturePackage {
  key: string
  title: string
  /** Имена из `granular-provider` пакета — источник правды для гейта полноты. */
  registry: readonly string[]
  fixtures: readonly ComponentFixture[]
}

export const FIXTURE_PACKAGES: readonly FixturePackage[] = [
  { key: 'core', title: '@feugene/granularity', registry: Object.keys(granularityComponentConfigs), fixtures: coreFixtures },
  { key: 'charts', title: '@feugene/granularity-charts', registry: Object.keys(granularityChartsComponentConfigs), fixtures: chartsFixtures },
  { key: 'chrono', title: '@feugene/granularity-chrono', registry: Object.keys(granularityChronoComponentConfigs), fixtures: chronoFixtures },
  { key: 'dashboard', title: '@feugene/granularity-dashboard', registry: Object.keys(granularityDashboardComponentConfigs), fixtures: dashboardFixtures },
  { key: 'editor', title: '@feugene/granularity-editor', registry: Object.keys(granularityEditorComponentConfigs), fixtures: editorFixtures },
  { key: 'forms-schema', title: '@feugene/granularity-forms-schema', registry: Object.keys(granularityFormsSchemaComponentConfigs), fixtures: formsSchemaFixtures },
  { key: 'media', title: '@feugene/granularity-media', registry: Object.keys(granularityMediaComponentConfigs), fixtures: mediaFixtures },
]

export const ALL_FIXTURES: readonly ComponentFixture[] = FIXTURE_PACKAGES.flatMap(pkg => pkg.fixtures)

/** Адрес страницы компонента. Имя берётся как есть: лишнее отображение — лишний источник расхождений. */
export function componentPath(name: string): string {
  return `/c/${name}`
}
