import type { GrDerivedToken, GrFoundationToken, GrRegistry, GrRoleToken } from './types'

interface RegistryGroup<Token> {
  title: string
  note?: string
  tokens: Token[]
}

export interface GrRegistrySources {
  foundation: { groups: RegistryGroup<{ name: string, description: string }>[] }
  roles: { groups: RegistryGroup<{ name: string, description: string }>[] }
  derived: {
    groups: (RegistryGroup<{ name: string, description: string, base: string, amount: number, mixWith: string }> & { fallbackTitle: string })[]
  }
}

/**
 * Реестр из `tokens/*.json`. Генератор зовёт эту функцию на свежих JSON и
 * передаёт результат в `defineTheme` явно: `generated.ts` в момент генерации
 * может отставать от правки реестра.
 */
export function buildRegistry(sources: GrRegistrySources): GrRegistry {
  const flatten = (groups: GrRegistrySources['foundation']['groups']): GrFoundationToken[] | GrRoleToken[] =>
    groups.flatMap(group => group.tokens.map(token => ({
      name: token.name,
      section: group.title,
      description: token.description,
    })))

  const derived: GrDerivedToken[] = sources.derived.groups.flatMap(group => group.tokens.map(token => ({
    name: token.name,
    section: group.title,
    description: token.description,
    formula: `color-mix(in srgb, var(${token.base}) ${token.amount}%, var(${token.mixWith}))`,
    base: token.base,
    amount: token.amount,
    mixWith: token.mixWith,
  })))

  return {
    foundation: flatten(sources.foundation.groups),
    roles: flatten(sources.roles.groups),
    derived,
  }
}
