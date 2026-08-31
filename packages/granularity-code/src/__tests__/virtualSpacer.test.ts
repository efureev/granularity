import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Гейт контракта распорок виртуального списка.
 *
 * `useVirtualList` отдаёт только высоты переменными — сами псевдоэлементы
 * обязан объявить потребитель. `GrDiff` переменные ставил, а правило не
 * объявлял: контейнер оставался высотой в одно окно, прокрутки не было вовсе, и
 * из тысячи строк достижим был первый десяток. Раскрытие пропуска при этом
 * выглядело как «строки пропали» — на самом деле они уезжали за пределы
 * единственного отрисованного окна.
 *
 * Поймать это тестом на разметку нельзя: атрибуты стоят, стиль применён, DOM
 * валиден. Поэтому проверяется наличие самого правила — того, без которого
 * переменные некому прочитать.
 *
 * Копия дословно совпадает с ядерной: правило дублируется в каждом потребителе
 * намеренно (общий глобальный стиль потребитель вправе не подключать), и
 * расхождение копий — тот же молчаливый отказ.
 */

const componentsDir = resolve(import.meta.dirname, '../components')

const CANONICAL_CSS = `[data-gr-virtual]::before,
[data-gr-virtual]::after {
    content: '';
    display: block;
    flex: none;
}

[data-gr-virtual]::before {
    height: var(--gr-virtual-before, 0px);
}

[data-gr-virtual]::after {
    height: var(--gr-virtual-after, 0px);
}`

/** Компонент и его исходники одним куском: вызов и разметка могут быть в разных файлах. */
function sourcesOf(component: string): string {
  const dir = resolve(componentsDir, component)

  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter(entry => entry.endsWith('.vue') || entry.endsWith('.ts'))
    .map(entry => readFileSync(resolve(dir, entry), 'utf8'))
    .join('\n')
}

const components = readdirSync(componentsDir).filter(name => name.startsWith('Gr'))
const consumers = components.filter(name => sourcesOf(name).includes('useVirtualList'))

describe('распорки виртуального списка', () => {
  it('потребители примитива вообще есть', () => {
    // Гейт на пустом списке зелен всегда — проверяем, что список не опустел.
    expect(consumers).not.toHaveLength(0)
  })

  it.each(consumers)('%s объявляет правило распорок', (component) => {
    expect(sourcesOf(component)).toContain(CANONICAL_CSS)
  })

  it.each(consumers)('%s помечает контейнер атрибутом', (component) => {
    expect(sourcesOf(component)).toContain('data-gr-virtual')
  })

  /**
   * Переменные ставит `spacerStyle`, и писать их имена руками нельзя: разойдись
   * они с композаблом на букву — распорка не создастся, а отказ будет молчаливым.
   */
  it.each(consumers)('%s берёт высоты из spacerStyle, а не пишет переменные руками', (component) => {
    const source = sourcesOf(component)

    expect(source).toContain('spacerStyle')
    expect(source).not.toMatch(/'--gr-virtual-(?:before|after)'\s*:/)
  })
})
