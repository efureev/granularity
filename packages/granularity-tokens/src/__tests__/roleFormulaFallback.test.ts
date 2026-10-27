import { describe, expect, it } from 'vitest'

import { grFoundationTokens, grRoleTokens } from '../generated'
import { themes } from './themes'

/**
 * Роль, записанная формулой `color-mix`, остаётся без фолбэка `@supports`.
 *
 * Фолбэк для браузера без `color-mix` сборка темы считает только производным
 * реестра: формула производного известна. Своя формула роли — нет, и в таком
 * браузере роль недействительна: заливка под указателем пропадает молча. Так
 * жили `--gr-slate-solid-hover` и `-active` тёмной «Глины». Роль пишется
 * литералом или ссылкой на производное — `var(--gr-slate-hover)`.
 */
const SET_BY_THEME = new Set([...grFoundationTokens, ...grRoleTokens].map(token => token.name.replace(/^--/, '')))

describe('роли без формул без фолбэка', () => {
  for (const theme of themes) {
    for (const [mode, data] of Object.entries(theme.modes)) {
      it(`${theme.id} / ${mode}`, () => {
        const covered = new Set((data.fallbacks ?? []).flatMap(fallback => Object.keys(fallback.tokens)))
        const bare = Object.entries(data.tokens)
          .filter(([name, value]) => SET_BY_THEME.has(name) && value.includes('color-mix(') && !covered.has(name))
          .map(([name]) => name)

        expect(bare).toEqual([])
      })
    }

    it(`${theme.id} / root`, () => {
      const formulas = Object.entries(theme.root)
        .filter(([name, value]) => SET_BY_THEME.has(name) && value.includes('color-mix('))
        .map(([name]) => name)

      expect(formulas).toEqual([])
    })
  }
})
