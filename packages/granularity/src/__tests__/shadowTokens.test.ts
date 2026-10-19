import { describe, expect, it } from 'vitest'

/**
 * Тень компонента — токен уровня, а не утилита uno-шкалы.
 *
 * Уровни `--gr-shadow-1..3` — роли режима: в тёмном тень чернее и плотнее
 * светлой (гейт `elevationPerMode` пакета токенов). Утилита со своим зашитым
 * цветом эту настройку обходит и на тёмном фоне тени не даёт.
 */
describe('тени компонентов', () => {
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

        if (!/\.(?:vue|ts)$/.test(entry) || entry.endsWith('.test.ts'))
          continue

        const source = readFileSync(full, 'utf-8')
        if (/(?<![\w-])shadow-(?:sm|md|lg|xl|2xl)(?![\w-])/.test(source))
          offenders.push(full.slice(root.length + 1))
      }
    }

    walk(root)

    expect(offenders, `используйте \`shadow-[var(--gr-shadow-*)]\`: ${offenders.join(', ')}`).toEqual([])
  })
})
