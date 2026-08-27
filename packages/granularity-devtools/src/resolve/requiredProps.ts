import { GR_REQUIRED_PROPS } from '../data/requiredMap.generated'

/**
 * Недостающие обязательные пропы — то, о чём Vue потребителю не скажет.
 *
 * Production-сборка SFC стирает `required` с рантайм-объявления, поэтому
 * «Missing required prop» не печатается ни в dev, ни в prod: во всём `dist` ядра
 * этой отметки нет ни разу. Здесь она восстановлена из типов — карта
 * генерируется из `web-types.json`, который строится `vue-component-meta`.
 */
export function missingRequiredProps(component: string, props: Record<string, unknown> | undefined): string[] {
  const required = GR_REQUIRED_PROPS[component]
  if (!required)
    return []

  // `undefined` — единственный признак отсутствия: `null`, `0` и пустая строка
  // переданы осознанно, и жаловаться на них значило бы навязывать свой вкус.
  return required.filter(prop => props?.[prop] === undefined)
}

export function missingRequiredMessage(component: string, missing: readonly string[]): string {
  const list = missing.map(prop => `\`${prop}\``).join(', ')
  return `missing required ${missing.length > 1 ? 'props' : 'prop'}: ${list}`
}
