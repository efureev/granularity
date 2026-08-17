import { describe, expect, it } from 'vitest'

import { themeVarsByName } from './cssContrast'

/**
 * Тень обязана быть видна в своей теме.
 *
 * Дефект, ради которого гейт написан: уровни elevation жили одним набором в
 * `foundation.json` и красились полупрозрачным `rgba(15, 23, 42, …)` — тем же
 * цветом, что `--gr-bg` тёмной темы. На тёмном фоне такая тень не даёт ничего,
 * и поднятая поверхность теряла один из двух каналов подъёма: в светлой теме
 * карточку держат светлота и тень, в тёмной оставалась только светлота.
 * Страница читалась одним полотном, и жалоба звучала как «карточки не
 * отделяются» — хотя пара `--gr-card`/`--gr-bg` в тёмной теме разведена
 * **сильнее** светлой (ΔL* 8.4 против 1.8).
 *
 * Проверяется не эстетика, а сам факт расхождения: тень тёмной темы не может
 * совпадать со светлой, потому что фон под ней другой.
 */
const LEVELS = ['--gr-shadow-1', '--gr-shadow-2', '--gr-shadow-3'] as const

/** Альфа последнего `rgba(…)` в значении тени. */
function shadowAlpha(value: string): number {
  const matches = [...value.matchAll(/rgba?\([^)]*?([\d.]+)\s*\)/g)]
  const last = matches.at(-1)

  return last ? Number(last[1]) : Number.NaN
}

describe('elevation по темам', () => {
  it('каждая тема объявляет все уровни', () => {
    for (const [themeName, vars] of Object.entries(themeVarsByName)) {
      const missing = LEVELS.filter(level => !vars[level])

      expect(missing, `${themeName} не объявляет ${missing.join(', ')}`).toEqual([])
    }
  })

  it('тени тёмной темы не повторяют светлую', () => {
    const same = LEVELS.filter(level => themeVarsByName.dark[level] === themeVarsByName.light[level])

    expect(same, `в тёмной теме тень совпадает со светлой: ${same.join(', ')}`).toEqual([])
  })

  // На тёмном фоне тень читается только заметно более плотной: та же альфа,
  // что и на светлом, визуально исчезает.
  it('в тёмной теме тень плотнее', () => {
    for (const level of LEVELS) {
      const light = shadowAlpha(themeVarsByName.light[level])
      const dark = shadowAlpha(themeVarsByName.dark[level])

      expect(Number.isNaN(light), `${level}: не разобрана альфа светлой темы`).toBe(false)
      expect(dark, `${level}: тень тёмной темы не плотнее светлой`).toBeGreaterThan(light)
    }
  })

  // Утилита `shadow-sm` темой не настраивается ровно так же, как `text-sm`:
  // в ней зашит свой цвет, и на тёмном фоне он не даёт тени.
  it('компоненты берут тень из токена, а не из утилиты uno-шкалы', async () => {
    const { readdirSync, readFileSync, statSync } = await import('node:fs')
    const { resolve } = await import('node:path')

    const root = resolve(process.cwd(), 'src/components')
    const offenders: string[] = []

    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir)) {
        const full = resolve(dir, entry)

        if (statSync(full).isDirectory()) {
          walk(full)
          continue
        }

        if (!/\.(?:vue|ts)$/.test(entry) || entry.endsWith('.test.ts')) continue

        const source = readFileSync(full, 'utf-8')
        if (/(?<![\w-])shadow-(?:sm|md|lg|xl|2xl)(?![\w-])/.test(source))
          offenders.push(full.slice(root.length + 1))
      }
    }

    walk(root)

    expect(offenders, `используйте \`shadow-[var(--gr-shadow-*)]\`: ${offenders.join(', ')}`).toEqual([])
  })
})
