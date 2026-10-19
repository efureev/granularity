import { grDerivedTokens, grFoundationTokens, grRoleTokens } from '../generated'
import { resolveModes } from '../modes'
import type { GrColorScheme, GrModeData, GrRegistry, GrThemeData } from '../types'
import { mixSrgb } from './color'
import { GrThemeDefinitionError, GrThemeError, MODE_NAME, THEME_ID } from './errors'
import { resolveRole, type GrThemeTokens } from './roles'
import { validateTheme, type GrThemeIssue } from './validate'

/** Условие фолбэка производных: браузер без `color-mix`. */
export const NO_COLOR_MIX = 'not (color: color-mix(in srgb, #000 50%, #fff))'

export interface GrModeInput {
  title?: string
  /** Можно не задавать у режима, который есть у темы-базы: возьмётся оттуда. */
  colorScheme?: GrColorScheme
  /** Режим той же темы, от которого этот хранит только отличия. */
  extends?: string
  tokens?: Readonly<Record<string, string>>
}

export interface DefineThemeInput {
  id: string
  title: string
  description?: string
  docs?: string
  /**
   * Тема-база: данные целиком или id. Id разрешается через `options.themes`;
   * `loadTheme` подставляет туда встроенные темы пакета сам.
   */
  extends?: string | GrThemeData
  defaultMode?: string
  root?: Readonly<Record<string, string>>
  modes?: Readonly<Record<string, GrModeInput>>
  baseCss?: readonly string[]
  /** Пропы по умолчанию компонентов: уходят в `extensions.granularity`. */
  componentDefaults?: Readonly<Record<string, Readonly<Record<string, unknown>>>>
}

export interface DefineThemeOptions {
  /** Контраст по WCAG и различимость тонов в каждом режиме. Включена по умолчанию. */
  validate?: boolean
  /** Темы, на которые можно сослаться по id в `extends`. */
  themes?: Readonly<Record<string, GrThemeData>>
  /** Реестр, по которому проверяется полнота. По умолчанию — реестр пакета. */
  registry?: GrRegistry
}

function withDashes(tokens: Readonly<Record<string, string>>): GrThemeTokens {
  return Object.fromEntries(Object.entries(tokens).map(([name, value]) => [`--${name}`, value]))
}

const bare = (name: string): string => name.replace(/^--/, '')

/**
 * Значение производного под темой. Тема вправе переопределить производное:
 * формулу `color-mix` считаем от её значений, литерал фолбэка не требует.
 */
function derivedFallback(
  token: GrRegistry['derived'][number],
  tokens: GrThemeTokens,
): string | null {
  const own = tokens[token.name]
  if (own !== undefined) {
    const formula = own.trim().match(/^color-mix\(\s*in srgb\s*,\s*var\((--[\w-]+)\)\s+(\d+)%\s*,\s*var\((--[\w-]+)\)\s*\)$/)
    if (!formula)
      return null

    const [base, mixWith] = [resolveRole(tokens, formula[1]), resolveRole(tokens, formula[3])]
    return base && mixWith ? mixSrgb(base, mixWith, Number(formula[2])) : null
  }

  const [base, mixWith] = [resolveRole(tokens, token.base), resolveRole(tokens, token.mixWith)]
  return base && mixWith ? mixSrgb(base, mixWith, token.amount) : null
}

function assertKeys(where: string, tokens: Readonly<Record<string, string>>): void {
  const dashed = Object.keys(tokens).filter(name => name.startsWith('--'))
  if (dashed.length > 0)
    throw new GrThemeDefinitionError('unknown-token', `${where}: ключи токенов пишутся без \`--\`: ${dashed.join(', ')}`)
}

/**
 * Тема дизайн-системы из исходных данных: `theme.json`, `root`, режимы.
 *
 * Разрешает наследование темы от темы и режима от режима, проверяет полноту по
 * реестру, контраст и различимость тонов в каждом режиме, считает фолбэки
 * производных и отдаёт данные в форме `GranumThemeData` контракта granum 3.
 */
export function defineTheme(input: DefineThemeInput, options: DefineThemeOptions = {}): GrThemeData {
  const registry = options.registry ?? { foundation: grFoundationTokens, roles: grRoleTokens, derived: grDerivedTokens }
  const { id } = input

  if (!THEME_ID.test(id))
    throw new GrThemeDefinitionError('invalid-theme-id', `id темы "${id}" не slug: ожидается ${THEME_ID}`)

  const parent = typeof input.extends === 'string'
    ? options.themes?.[input.extends]
    : input.extends

  if (input.extends !== undefined && parent === undefined) {
    throw new GrThemeDefinitionError(
      'theme-extends-unresolved',
      `тема "${id}" наследует "${String(input.extends)}", а её данных нет: передайте их в \`extends\` объектом либо в \`options.themes\``,
    )
  }

  const ownModes = input.modes ?? {}
  for (const name of Object.keys(ownModes)) {
    if (!MODE_NAME.test(name) || name === 'root')
      throw new GrThemeDefinitionError('invalid-mode-name', `тема "${id}": имя режима "${name}" — ожидается ${MODE_NAME}, кроме \`root\``)
  }

  assertKeys(`тема "${id}", root`, input.root ?? {})
  for (const [name, mode] of Object.entries(ownModes))
    assertKeys(`тема "${id}", режим "${name}"`, mode.tokens ?? {})

  const root: Record<string, string> = { ...parent?.root, ...input.root }
  const modeNames = [...new Set([...Object.keys(parent?.modes ?? {}), ...Object.keys(ownModes)])]

  const resolved = new Map<string, Record<string, string>>()
  const parentResolved = parent ? resolveModes(parent) : new Map<string, Record<string, string>>()

  const resolveMode = (name: string, chain: string[]): Record<string, string> => {
    const known = resolved.get(name)
    if (known)
      return known

    if (chain.includes(name))
      throw new GrThemeDefinitionError('mode-extends-cycle', `тема "${id}": цикл режимов ${[...chain, name].join(' → ')}`)

    const own = ownModes[name]
    let base: Record<string, string>
    if (own?.extends !== undefined) {
      if (!modeNames.includes(own.extends))
        throw new GrThemeDefinitionError('mode-extends-unresolved', `тема "${id}": режим "${name}" наследует неизвестный режим "${own.extends}"`)
      base = resolveMode(own.extends, [...chain, name])
    }
    else {
      base = parentResolved.get(name) ?? {}
    }

    const tokens = { ...base, ...own?.tokens }
    resolved.set(name, tokens)
    return tokens
  }

  for (const name of modeNames)
    resolveMode(name, [])

  const colorSchemeOf = (name: string, chain: string[] = []): GrColorScheme | undefined => {
    const own = ownModes[name]
    if (own?.colorScheme)
      return own.colorScheme
    if (parent?.modes[name])
      return parent.modes[name].colorScheme
    if (own?.extends && !chain.includes(own.extends))
      return colorSchemeOf(own.extends, [...chain, name])
    return undefined
  }

  const defaultMode = input.defaultMode ?? parent?.defaultMode ?? 'light'
  if (!modeNames.includes(defaultMode))
    throw new GrThemeDefinitionError('mode-extends-unresolved', `тема "${id}": режима по умолчанию "${defaultMode}" нет среди режимов (${modeNames.join(', ')})`)

  const foundation = new Set(registry.foundation.map(token => bare(token.name)))
  const roles = new Set(registry.roles.map(token => bare(token.name)))
  const derived = new Set(registry.derived.map(token => bare(token.name)))

  const unknown = [
    ...Object.keys(root).filter(name => !foundation.has(name)).map(name => `root: ${name}`),
    ...modeNames.flatMap(mode => Object.keys(resolved.get(mode)!)
      .filter(name => !roles.has(name) && !derived.has(name))
      .map(name => `${mode}: ${name}`)),
  ]
  if (unknown.length > 0)
    throw new GrThemeDefinitionError('unknown-token', `тема "${id}" задаёт токены, которых нет в реестре:\n  ${unknown.join('\n  ')}`)

  const missing = [
    ...[...foundation].filter(name => root[name] === undefined).map(name => `root: ${name}`),
    ...modeNames.flatMap(mode => [...roles]
      .filter(name => resolved.get(mode)![name] === undefined)
      .map(name => `${mode}: ${name}`)),
  ]
  if (missing.length > 0)
    throw new GrThemeDefinitionError('theme-incomplete', `тема "${id}" неполна, без значения ${missing.length} токенов:\n  ${missing.join('\n  ')}`)

  const order = [...registry.foundation, ...registry.roles, ...registry.derived].map(token => bare(token.name))
  const sorted = (tokens: Readonly<Record<string, string>>): Record<string, string> =>
    Object.fromEntries(Object.entries(tokens).sort(([a], [b]) => order.indexOf(a) - order.indexOf(b)))

  const issues: GrThemeIssue[] = []
  const modes: Record<string, GrModeData> = {}

  for (const name of modeNames) {
    const tokens = resolved.get(name)!
    const colorScheme = colorSchemeOf(name)
    if (!colorScheme)
      throw new GrThemeDefinitionError('theme-incomplete', `тема "${id}": у режима "${name}" нет colorScheme`)

    const all = { ...withDashes(root), ...withDashes(tokens) }

    if (options.validate !== false) {
      for (const issue of validateTheme({ name: `${id}-${name}`, tokens: all }, registry))
        issues.push({ ...issue, message: `${name}: ${issue.message}` })
    }

    const fallbacks = Object.fromEntries(registry.derived
      .map(token => [bare(token.name), derivedFallback(token, all)] as const)
      .filter((entry): entry is readonly [string, string] => entry[1] !== null))

    const own = ownModes[name]
    const parentTokens = own?.extends !== undefined ? resolved.get(own.extends)! : undefined
    const diff = parentTokens
      ? Object.fromEntries(Object.entries(tokens).filter(([token, value]) => parentTokens[token] !== value))
      : tokens

    const title = own?.title ?? parent?.modes[name]?.title
    modes[name] = {
      ...(title !== undefined ? { title } : {}),
      colorScheme,
      ...(own?.extends !== undefined ? { extends: own.extends } : {}),
      tokens: sorted(diff),
      ...(Object.keys(fallbacks).length > 0 ? { fallbacks: [{ supports: NO_COLOR_MIX, tokens: fallbacks }] } : {}),
    }
  }

  if (issues.length > 0)
    throw new GrThemeError(id, issues)

  const baseCss = input.baseCss ?? parent?.baseCss
  const componentDefaults = input.componentDefaults
  const parentDefaults = (parent?.extensions?.granularity as { componentDefaults?: Record<string, Record<string, unknown>> } | undefined)?.componentDefaults
  const mergedDefaults = parentDefaults || componentDefaults
    ? Object.fromEntries([...new Set([...Object.keys(parentDefaults ?? {}), ...Object.keys(componentDefaults ?? {})])]
        .map(component => [component, { ...parentDefaults?.[component], ...componentDefaults?.[component] }]))
    : undefined

  return {
    id,
    title: input.title,
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.docs !== undefined ? { docs: input.docs } : {}),
    root: sorted(root),
    modes,
    defaultMode,
    ...(baseCss !== undefined ? { baseCss } : {}),
    ...(mergedDefaults !== undefined ? { extensions: { granularity: { componentDefaults: mergedDefaults } } } : {}),
  }
}
