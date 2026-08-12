import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { granularityComponentConfigs } from '@feugene/granularity/granular-provider'
import { granularityChronoComponentConfigs } from '@feugene/granularity-chrono/granular-provider'

/**
 * Что сканируют e2e и откуда берётся список.
 *
 * Источников два, и их нельзя мешать:
 *
 *  - `registryComponentNames` — реестр самого пакета, полный список публичных
 *    компонентов. Это то, что обязано быть покрыто;
 *  - `componentNames` — ключи `componentApi.generated.json`, то есть компоненты,
 *    у которых есть **страница витрины**. Генератор пропускает записи реестра без
 *    одноимённого SFC (`GrDialogService` — сервис из хоста и композабла), и для
 *    таблицы пропсов это верно.
 *
 * Раньше список e2e был просто вторым источником, поэтому сервис выпал из
 * a11y-гейта заодно с таблицей пропсов — молча. Теперь компоненты без своей
 * страницы объявляются в `SERVICE_ENTITIES` вместе с местом, где они покрыты, а
 * тест полноты в `a11y.spec.ts` падает на любом непокрытом имени реестра.
 */
const apiPath = fileURLToPath(
  new URL('../src/content/generated/componentApi.generated.json', import.meta.url),
)

const componentApi = JSON.parse(readFileSync(apiPath, 'utf-8')) as Record<string, unknown>

export function toKebabCase(value: string): string {
  return value
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase()
}

/** Все публичные компоненты пакета — из реестра `granular-provider`. */
export const registryComponentNames: string[] = Object.keys(granularityComponentConfigs).sort()

/**
 * Компоненты companion-пакетов — из их собственных реестров, по тому же
 * правилу, что и ядро. Списком руками они бы отставали от пакета молча: до
 * 2.6 e2e не видел companion-страниц вовсе, и ни axe, ни визуальный слой их
 * не проверяли.
 */
export const companionComponentNames: string[] = Object.keys(granularityChronoComponentConfigs).sort()

/** Компоненты со своей страницей витрины (`GrButton`, `GrSlider`, …). */
export const componentNames: string[] = Object.keys(componentApi).sort()

/** URL-путь страницы компонента относительно baseURL (`components/gr-slider`). */
export function componentPath(name: string): string {
  return `components/${toKebabCase(name)}`
}

/** URL-путь страницы компаньона (`extras/gr-calendar`). */
export function companionPath(name: string): string {
  return `extras/${toKebabCase(name)}`
}

/** Цель постраничного axe-скана: где живёт компонент и по чему ждать готовности. */
export interface ScanTarget {
  name: string
  path: string
  /** Якорь секции живых примеров: у страниц компонентов и сущностей он разный. */
  ready: string
}

/**
 * Компоненты, документированные не своей страницей. Ключ — имя из реестра,
 * значение — где компонент реально показан и проверяется.
 */
export const SERVICE_ENTITIES: Record<string, Omit<ScanTarget, 'name'>> = {
  // Сервис живёт страницей композабла: у него нет пропсов, есть `useDialogService`.
  GrDialogService: { path: 'composables/use-dialog-service', ready: '#examples' },
}

/** Всё, что обходит постраничный axe: страницы компонентов плюс сервисные сущности. */
export const scanTargets: ScanTarget[] = [
  ...componentNames.map(name => ({ name, path: componentPath(name), ready: '#live-examples' })),
  ...companionComponentNames.map(name => ({ name, path: companionPath(name), ready: '#live-examples' })),
  ...Object.entries(SERVICE_ENTITIES).map(([name, target]) => ({ name, ...target })),
].sort((left, right) => left.name.localeCompare(right.name))

/**
 * ARIA-тяжёлые / интерактивные компоненты, по которым a11y-регрессии критичны
 * (ручные WAI-ARIA паттерны из анализа). На них axe-проверка строгая.
 */
export const ariaCriticalComponents: string[] = [
  'GrAutocomplete',
  'GrSelect',
  'GrSlider',
  'GrTabs',
  'GrTabPanels',
  'GrTree',
  'GrDropdown',
  'GrNumberInput',
  'GrRadioGroup',
  'GrSwitch',
  'GrCheckbox',
  'GrPagination',
].filter(name => componentNames.includes(name))
