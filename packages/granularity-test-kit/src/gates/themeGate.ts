import { basename } from 'node:path'

import { describe, expect, it } from 'vitest'

/** Токен компонента из реестра целевого пакета — `grComponentTokens`. */
export interface ThemeGateToken {
  readonly owner: string
  readonly name: string
  readonly kind: string
}

type TokenValues = Readonly<Record<string, string>>

/** Данные темы, которые отдаёт сборка темы дизайн-системы (`loadTheme`). */
export interface ThemeGateData {
  readonly id: string
  readonly defaultMode?: string
  readonly modes: Readonly<Record<string, { readonly extends?: string }>>
  readonly targets?: Readonly<Record<string, string>>
  readonly components?: Readonly<Record<string, Readonly<Record<string, { readonly root?: TokenValues, readonly modes?: Readonly<Record<string, TokenValues>> }>>>>
}

export interface ThemeGateOptions {
  /** Папки исходников тем — раскладка granum: `theme.json`, `root.json`, `modes/`, `components/`. */
  themeDirs: readonly string[]
  /** Целевые пакеты темы: id пакета → реестр токенов его компонентов (`grComponentTokens`). */
  targets: Readonly<Record<string, readonly ThemeGateToken[]>>
  /**
   * Сборка темы дизайн-системы — `loadTheme` пакета токенов: полнота глобальных
   * токенов по реестру, контраст WCAG и ΔE тонов в каждом режиме. Нарушение —
   * исключение с перечнем.
   */
  loadTheme: (dir: string) => ThemeGateData
}

function modeChain(data: ThemeGateData, mode: string): string[] {
  const chain: string[] = []
  for (let name: string | undefined = mode; name !== undefined && !chain.includes(name); name = data.modes[name]?.extends)
    chain.push(name)
  return chain
}

const bare = (name: string): string => name.replace(/^--/, '')

/**
 * Токен вида `theme`, которому тема не дала значения хотя бы в одном режиме.
 * Значение режима — `root` раздела, затем цепочка режима, затем режим по
 * умолчанию: так его берёт сборка (T-10 granum).
 */
export function collectMissingComponentValues(data: ThemeGateData, targets: ThemeGateOptions['targets']): string[] {
  const defaultChain = modeChain(data, data.defaultMode ?? 'light')
  return Object.entries(targets).flatMap(([packageId, tokens]) => tokens
    .filter(token => token.kind === 'theme')
    .flatMap((token) => {
      const values = data.components?.[packageId]?.[token.owner]
      if (values?.root?.[bare(token.name)] !== undefined)
        return []
      return Object.keys(data.modes)
        .filter(mode => ![...modeChain(data, mode), ...defaultChain].some(name => values?.modes?.[name]?.[bare(token.name)] !== undefined))
        .map(mode => `${mode}: ${token.name} (${packageId}:${token.owner})`)
    }))
}

/** В разделе — пакет вне целей, компонент без токенов в реестре или токен не вида `theme` своего компонента. */
export function collectUnknownComponentValues(data: ThemeGateData, targets: ThemeGateOptions['targets']): string[] {
  return Object.entries(data.components ?? {}).flatMap(([packageId, byComponent]) => {
    const tokens = targets[packageId]
    if (tokens === undefined)
      return [`${packageId}: пакет не назван в targets гейта — значения не с чем сверить`]
    return Object.entries(byComponent).flatMap(([owner, values]) => {
      const own = tokens.filter(token => token.owner === owner)
      if (own.length === 0)
        return [`${packageId}:${owner}: у пакета нет такого компонента с токенами`]
      const names = new Set([...Object.keys(values.root ?? {}), ...Object.values(values.modes ?? {}).flatMap(Object.keys)])
      return [...names].sort().filter(name => own.find(token => bare(token.name) === name)?.kind !== 'theme').map(name => `${packageId}:${owner}: --${name} — не токен вида theme этого компонента`)
    })
  })
}

/**
 * Гейт пакета темы: тема для пакета компонентов полна и не задаёт лишнего.
 *
 * Тема, написанная отдельно от пакета компонентов, устаревает молча: у пакета
 * появляется токен, а тема его не задаёт. Сборка приложения назовёт нехватку
 * находкой `doctor` у потребителя; этот гейт называет её в CI самого пакета
 * темы — по реестрам целевых пакетов, без сборки приложения.
 */
export function defineThemeGate(options: ThemeGateOptions): void {
  describe('тема для пакета компонентов', () => {
    for (const dir of options.themeDirs) {
      let built: ThemeGateData | undefined
      const data = (): ThemeGateData => (built ??= options.loadTheme(dir))

      describe(basename(dir), () => {
        it('собирается проверкой дизайн-системы: полнота глобальных токенов, контраст, ΔE', () => {
          expect(data().id).toBeTruthy()
        })

        it('targets называют каждый пакет, чьи значения тема задаёт', () => {
          const untargeted = Object.keys(data().components ?? {}).filter(packageId => data().targets?.[packageId] === undefined)
          expect(untargeted, 'пакет раздела `components` — в `targets` темы с диапазоном версий').toEqual([])
        })

        it('значения компонентов полны по реестрам целевых пакетов', () => {
          expect(collectMissingComponentValues(data(), options.targets), 'токен вида theme без значения: задай его в разделе компонента темы').toEqual([])
        })

        it('в разделах — только токены вида theme своих компонентов', () => {
          expect(collectUnknownComponentValues(data(), options.targets), 'хук и свои токены компонента тема не задаёт; опечатку — исправь').toEqual([])
        })
      })
    }
  })
}
