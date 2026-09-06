import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  derivedThemeVars,
  getColorDistance,
  getContrastRatio,
  parseVars,
  resolveColorExpression,
  themeVarsByName,
  type ThemeName,
} from './cssContrast'

/**
 * Палитра автоцвета `GrAvatar`: контраст пары и различимость слотов.
 *
 * Пару «подложка `-light` + текст `-text`» не проверяет ни один из соседних
 * гейтов: `toneContrast` меряет цвет переднего плана на `--gr-card` и
 * `--gr-muted`, то есть на общих поверхностях, а не на подложке своего же тона.
 * Единственной проверкой оставался axe на витрине — но он ходит по светлой
 * теме, и тёмная не покрывалась вовсе.
 *
 * Ошибка тут стоит дорого и выглядит безобидно: слот — ссылка на тон, и
 * перекраска темы способна увести подложку к тексту, не тронув ни строчки
 * в компоненте.
 *
 * Слоты читаются из темы **компонента**, а цвета — из глобальных тем: палитра
 * живёт у `GrAvatar` (в глобальной за неё платил бы и тот, кто аватар не
 * берёт), а значения ролей, на которые она ссылается, приходят из темы
 * приложения. Поэтому обе темы проверяются одним и тем же файлом слотов.
 */

const AA_TEXT = 4.5

/**
 * Порог различимости в ΔE — тот же, что у `-light`-семейства в `tonePalette`:
 * слоты взяты из него, и требовать от них большего, чем от источника, было бы
 * суеверием.
 *
 * Замер палитры: в светлой теме минимум ΔE 5.0 (слоты 1 и 5 — `info` и
 * `azure`), в тёмной 8.4 (слоты 2 и 4). Пятёрка — это «различимо при взгляде»,
 * не более: слоты 1, 5 и 6 в светлой теме сбиваются в один бледно-голубой
 * кластер, и глазами это видно. Развести их дальше нечем — полный набор ролей
 * есть ровно у шести тонов, и все шесть уже в палитре; следующий шаг —
 * собственные цвета в теме, а это уже не «палитра из шкалы тонов».
 */
const MIN_DISTANCE = 4

/** Слоты палитры: имя токена → выражение вида `var(--gr-info-light)`. */
const paletteVars = parseVars(
  readFileSync(resolve(process.cwd(), 'src/components/GrAvatar/themes/light.css'), 'utf8'),
)

const SLOTS = [1, 2, 3, 4, 5, 6] as const
const THEMES = Object.keys(themeVarsByName) as ThemeName[]

function colorOf(theme: ThemeName, token: string) {
  const expression = paletteVars[token]
  if (!expression)
    throw new Error(`слот ${token} не объявлен в теме компонента`)

  return resolveColorExpression(expression, themeVarsByName[theme], derivedThemeVars)
}

describe('палитра автоцвета GrAvatar', () => {
  it('все двенадцать слотов объявлены', () => {
    const missing = SLOTS
      .flatMap(slot => [`--gr-avatar-${slot}-bg`, `--gr-avatar-${slot}-fg`])
      .filter(token => !paletteVars[token])

    expect(missing, missing.join(', ')).toEqual([])
  })

  it.each(THEMES)('в теме %s инициалы читаются на своей подложке', (theme) => {
    const failures = SLOTS
      .map((slot) => {
        const ratio = getContrastRatio(
          colorOf(theme, `--gr-avatar-${slot}-fg`),
          colorOf(theme, `--gr-avatar-${slot}-bg`),
        )

        return { slot, ratio }
      })
      .filter(({ ratio }) => ratio < AA_TEXT)
      .map(({ slot, ratio }) => `слот ${slot}: ${ratio.toFixed(2)}`)

    expect(failures, failures.join(', ')).toEqual([])
  })

  it.each(THEMES)('в теме %s слоты различимы между собой', (theme) => {
    const collisions: string[] = []

    for (let i = 0; i < SLOTS.length; i += 1) {
      for (let j = i + 1; j < SLOTS.length; j += 1) {
        const distance = getColorDistance(
          colorOf(theme, `--gr-avatar-${SLOTS[i]}-bg`),
          colorOf(theme, `--gr-avatar-${SLOTS[j]}-bg`),
        )

        if (distance < MIN_DISTANCE)
          collisions.push(`${SLOTS[i]}↔${SLOTS[j]}: ${distance.toFixed(1)}`)
      }
    }

    expect(collisions, collisions.join(', ')).toEqual([])
  })
})
