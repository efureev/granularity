import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/**
 * Список компонентов и их slug'и берём из сгенерированного API-контракта
 * (`componentApi.generated.json`) — тот же источник, что и у страниц витрины,
 * поэтому e2e автоматически покрывает каждый новый компонент без ручного списка.
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

/** Все имена компонентов (`GrButton`, `GrSlider`, …). */
export const componentNames: string[] = Object.keys(componentApi).sort()

/** URL-путь страницы компонента относительно baseURL (`components/gr-slider`). */
export function componentPath(name: string): string {
  return `components/${toKebabCase(name)}`
}

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
