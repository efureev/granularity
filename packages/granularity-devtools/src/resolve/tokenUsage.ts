import { grComponentTokens, grFoundationTokens } from '@feugene/granularity/tokens'

/**
 * Токены компонента с их фактическими значениями.
 *
 * Реестр токенов пакет публикует сам (`@feugene/granularity/tokens`), поэтому
 * список объявленного известен точно. Значение берётся из вычисленного стиля
 * корневого элемента — то есть с учётом темы, провайдера и правок потребителя.
 */

interface TokenDefinition {
  owner: string
  name: string
  kind: string
  default?: string
  description?: string
}

// Базовые токены объявлены без владельца — у них своя форма записи, и в
// множестве имён нужны только имена.
const DECLARED_NAMES = new Set<string>([
  ...(grComponentTokens as readonly TokenDefinition[]).map(token => token.name),
  ...grFoundationTokens.map(token => token.name),
])

export interface TokenReading {
  name: string
  kind: string
  value: string
  description?: string
}

export function componentTokens(component: string): TokenDefinition[] {
  return (grComponentTokens as TokenDefinition[]).filter(token => token.owner === component)
}

export interface TokenSections {
  applied: TokenReading[]
  /**
   * Объявлен в `tokens.json`, но в вычисленном стиле покоя пуст. Это **не**
   * дефект: так выглядят и точки кастомизации (`kind: 'hook'`), которых
   * потребитель не трогал, и токены состояний — `*-bg-hover` живёт внутри
   * правила `:hover` и вне его не существует.
   */
  unset: TokenReading[]
  /** `--gr-*`, выставленная на самом элементе и не известная ни одному реестру: почти всегда опечатка. */
  unknown: TokenReading[]
}

export interface TokenProbe {
  /** Значение переменной в вычисленном стиле. */
  read: (name: string) => string
  /** `--gr-*`, объявленные прямо на элементе (инлайновый `style`). */
  inlineNames: readonly string[]
}

export function tokenSections(component: string, probe: TokenProbe): TokenSections {
  const applied: TokenReading[] = []
  const unset: TokenReading[] = []

  for (const token of componentTokens(component)) {
    const reading: TokenReading = {
      name: token.name,
      kind: token.kind,
      value: probe.read(token.name).trim(),
      description: token.description,
    }

    if (reading.value)
      applied.push(reading)
    else unset.push(reading)
  }

  const unknown = probe.inlineNames
    .filter(name => name.startsWith('--gr-') && !DECLARED_NAMES.has(name))
    .map(name => ({ name, kind: 'unknown', value: probe.read(name).trim() }))

  return { applied, unset, unknown }
}
