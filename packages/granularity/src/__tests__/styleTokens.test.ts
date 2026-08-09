import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

// В jsdom `import.meta.url` не file-scheme — пути от cwd пакета, как в `cssContrast.ts`.
const componentsDir = resolve(process.cwd(), 'src/components')

function readComponentSources(dir = componentsDir): { path: string, source: string }[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = resolve(dir, entry.name)

    if (entry.isDirectory())
      return entry.name === '__tests__' ? [] : readComponentSources(full)

    if (!/\.(?:vue|ts|css)$/.test(entry.name) || entry.name.includes('.test.'))
      return []

    return [{ path: full.slice(componentsDir.length + 1), source: readFileSync(full, 'utf8') }]
  })
}

const sources = readComponentSources()

function offenders(pattern: RegExp): string[] {
  return [...new Set(sources.flatMap(({ path, source }) =>
    [...source.matchAll(pattern)].map(match => `${match[0]} (${path})`)))].sort()
}

/**
 * Гейт против «шкала есть, а в компонентах литералы».
 *
 * Кегли, радиусы, длительности и кривые объявлены токенами (`tokens/*.json`) —
 * и ровно поэтому выглядят настраиваемыми. Пиксельный литерал или утилита
 * `duration-150` этого обещания не держит: тема их не видит. Проверка от
 * исходников, а не от `dist`: класс живёт в разметке, а CSS собирает потребитель
 * своим конфигом.
 */
describe('стили берут значения из токенов', () => {
  it('кегли и радиусы — не пиксельные литералы', () => {
    expect(
      offenders(/(?:text|rounded)-\[\d+(?:\.\d+)?px\]/g),
      'используй `text-[length:var(--gr-*-text-*)]` / `rounded-[var(--gr-radius-*)]`; нет ступени — заведи токен',
    ).toEqual([])
  })

  it('длительности анимаций — из `--gr-duration-*`', () => {
    expect(
      offenders(/(?<![\w-])duration-\d+(?![\w-])/g),
      'используй `duration-[var(--gr-duration-fast|base|slow)]`',
    ).toEqual([])
  })

  it('кривые ускорения — из `--gr-ease-*`', () => {
    expect(
      offenders(/(?<![\w-])ease-(?:in-out|in|out|linear)(?![\w-])/g),
      'используй `ease-[var(--gr-ease-out)]` / `ease-[var(--gr-ease-in)]`: кривые задаёт дизайн-система, а не пресет',
    ).toEqual([])
  })

  it('время в собственном CSS компонента — тоже токеном', () => {
    expect(
      offenders(/(?<![\w.-])\d+ms(?![\w-])/g),
      'literal в `transition`/`animation` — на `var(--gr-duration-*)`',
    ).toEqual([])
  })

  /**
   * Обратная сторона: токены движения уже были сгенерированы и не использованы
   * ни разу. Гейт держит связь живой — иначе следующая правка тихо вернёт
   * литералы, а шкала снова станет декоративной.
   */
  it('токены движения действительно используются', () => {
    const uses = (pattern: RegExp) => sources.filter(({ source }) => pattern.test(source)).length

    expect(uses(/var\(--gr-duration-/), '--gr-duration-* не используется ни одним компонентом').toBeGreaterThan(0)
    expect(uses(/var\(--gr-ease-/), '--gr-ease-* не используется ни одним компонентом').toBeGreaterThan(0)
  })
})
