import { readdirSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * Гейт на снятые deprecated-приёмы.
 *
 * Все четыре — одного класса: алиас или не-канонический префикс, который после
 * 1.0 остался бы навсегда. CLAUDE.md §5 запрещает алиасы CSS-токенов, но три из
 * четырёх жили в коде именно так.
 */

const srcDir = resolve(process.cwd(), 'src')

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = resolve(dir, entry.name)
    if (entry.isDirectory()) return sourceFiles(full)
    return /\.(?:ts|vue|css)$/.test(entry.name) && !entry.name.includes('.test.') ? [full] : []
  })
}

function grep(pattern: RegExp): string[] {
  return sourceFiles(srcDir)
    .filter(file => statSync(file).isFile())
    .flatMap((file) => {
      const rel = file.slice(srcDir.length + 1)
      return readFileSync(file, 'utf8')
        .split('\n')
        .map((line, i) => ({ line, n: i + 1 }))
        .filter(({ line }) => pattern.test(line))
        .map(({ n }) => `${rel}:${n}`)
    })
}

describe('снятые deprecated-приёмы', () => {
  it('нет токенов с префиксом --pb-*', () => {
    // Канонический префикс один — `--gr-*`. `GrProgressBar` был единственным
    // исключением: `--pb-bg` и соседи прямо нарушали CLAUDE.md §5.
    const offenders = grep(/--pb-/)

    expect(offenders, offenders.join('\n')).toEqual([])
  })

  it('нет роли --gr-destructive: она слита с --gr-danger', () => {
    // Две семантически одинаковые роли с независимыми значениями расходились:
    // в тёмной теме `danger` был `#f87171`, а `destructive` — `#ef4444`.
    const offenders = grep(/--gr-destructive/)

    expect(offenders, offenders.join('\n')).toEqual([])
  })

  it('нет класса .theme-dark: тема переключается только data-атрибутом', () => {
    const offenders = grep(/theme-dark/)

    expect(offenders, offenders.join('\n')).toEqual([])
  })

  it('GrAlert не принимает variant="light"', async () => {
    const styles = await import('../components/GrAlert/grAlertStyles')

    expect(styles.GR_ALERT_VARIANTS).toEqual(['soft', 'outline'])
    // Вместе с алиасом ушла и нормализация: без него она была тождеством.
    expect('normalizeGrAlertVariant' in styles, 'нормализация алиаса больше не нужна').toBe(false)
    expect(grep(/GrAlertVariantInput/), 'тип-алиас снят').toEqual([])
  })
})
