import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { presetGranular } from '@feugene/unocss-preset-granular'
import { createGenerator, presetMini } from 'unocss'
import { describe, expect, it } from 'vitest'

import { granularityProvider } from '../granular-provider'

/**
 * Гейт «класс есть — CSS есть».
 *
 * Дефект, ради которого написан: компоненты пользовались `animate-spin`,
 * `divide-y`, `space-y-1`, `backdrop-blur-sm`, а `presetMini` таких правил не
 * знает. Витрина держала недостающие правила в своём `uno.config.ts` и потому
 * выглядела исправной — а у любого потребителя, собравшего конфиг по
 * `docs/installation.md`, эти утилиты не генерировались вовсе: класс в разметке
 * есть, CSS к нему нет. Сборка при этом успешна, тесты зелёные, ошибок нет;
 * увидеть можно было только глазами на живом приложении.
 *
 * Поэтому проверяем не «правило где-то существует», а **документированный
 * конфиг**: ровно `presetMini` + granular-пресет, как в `installation.md`.
 */

const componentsDir = resolve(process.cwd(), 'src/components')

/**
 * Семейства, которых в `presetMini` нет и которые приезжают только из
 * `@feugene/unocss-mini-extra-rules` (пресет подмешивает их с 0.6.1).
 * Литералы этих семейств живут в шаблонах, а не в safelist, поэтому их
 * приходится вычитывать из исходников — иначе гейт их не увидит.
 */
const FRAGILE_PREFIXES = ['animate-', 'space-x-', 'space-y-', 'divide-', 'backdrop-']

/**
 * Иконки — осознанное исключение: `i-*` требуют `presetIcons`, а он в
 * минимальном конфиге не участвует и подключается потребителем отдельно.
 */
const ICON_PREFIX = 'i-'

/**
 * Классы-метки: собственного CSS не дают и не должны. Это точки зацепа для
 * вариантов (`group-hover/segmented-item:`, `peer-checked:`), поэтому пустой
 * вывод для них — норма, а не дефект.
 */
const MARKER_CLASSES = new Set(['peer'])
const MARKER_PREFIXES = ['group/', 'peer/']

function isMarker(token: string): boolean {
  return MARKER_CLASSES.has(token) || MARKER_PREFIXES.some(p => token.startsWith(p))
}

function componentSources(): string[] {
  return readdirSync(componentsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.startsWith('Gr'))
    .flatMap(entry => readdirSync(resolve(componentsDir, entry.name))
      .filter(file => (file.endsWith('.vue') || file.endsWith('.ts')) && !file.includes('.test.'))
      .map(file => readFileSync(resolve(componentsDir, entry.name, file), 'utf8')))
}

function safelistTokens(): string[] {
  return granularityProvider.components.flatMap(component => [...(component.safelist ?? [])])
}

function scannedFragileTokens(): string[] {
  const found = new Set<string>()
  const token = /[\w-]+(?:\[[^\]\s]*\])?[\w./-]*/g

  for (const source of componentSources()) {
    for (const match of source.match(token) ?? []) {
      if (FRAGILE_PREFIXES.some(prefix => match.startsWith(prefix)))
        found.add(match)
    }
  }

  return [...found]
}

describe('документированный конфиг генерирует CSS для всех утилит пакета', () => {
  // `components: []` — чтобы safelist пресета не подмешивал в вывод посторонние
  // классы: иначе «CSS непустой» получалось бы всегда, и гейт был бы слепым.
  // На этом ровно и обжёгся первый замер этого дефекта.
  const uno = createGenerator({
    presets: [
      presetMini(),
      presetGranular({ providers: [granularityProvider], components: [] }),
    ],
  })

  async function ungeneratable(tokens: readonly string[]): Promise<string[]> {
    const generator = await uno
    const dead: string[] = []

    for (const token of tokens) {
      const { css } = await generator.generate(token, { preflights: false })
      if (css.replace(/\/\*[\s\S]*?\*\//g, '').trim() === '')
        dead.push(token)
    }

    return dead
  }

  function candidates(tokens: readonly string[]): string[] {
    return [...new Set(tokens)].filter(t => !t.startsWith(ICON_PREFIX) && !isMarker(t))
  }

  it('safelist каждого компонента генерируется', async () => {
    const tokens = candidates(safelistTokens())
    expect(tokens.length).toBeGreaterThan(100)

    const dead = await ungeneratable(tokens)

    expect(dead, `объявлены в safelist, но CSS не дают: ${dead.join(', ')}`).toEqual([])
  })

  it('утилиты вне presetMini, встречающиеся в шаблонах, генерируются', async () => {
    const tokens = candidates(scannedFragileTokens())
    expect(tokens.length).toBeGreaterThan(0)

    const dead = await ungeneratable(tokens)

    expect(dead, `используются в компонентах, но CSS не дают: ${dead.join(', ')}`).toEqual([])
  })

  it.each([
    // Оба когда-то были мертвы: `presetMini` не знает ни `text-transform`, ни
    // цвета для `divide-*`. Правила заведены в `@feugene/unocss-mini-extra-rules`
    // 0.4.0, пресет подмешивает их с 0.6.2 — держим на них отдельный якорь,
    // чтобы откат зависимости не прошёл незамеченным.
    ['uppercase', 'text-transform:uppercase'],
    ['divide-[var(--gr-brd)]', 'border-color:var(--gr-brd)'],
  ])('%s даёт CSS, а не пустоту', async (token, declaration) => {
    const { css } = await (await uno).generate(token, { preflights: false })

    expect(css).toContain(declaration)
  })

  it('`animate-spin` получает свои @keyframes, а не только правило', async () => {
    // Правило без preflight'а — молчаливый полудефект: класс есть, анимации нет.
    const { css } = await (await uno).generate('animate-spin')

    expect(css).toContain('@keyframes granularity-spin')
  })
})
