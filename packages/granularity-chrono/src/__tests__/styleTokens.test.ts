import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * Гейт «шкала есть, а в компонентах литералы» — копия того, что живёт в ядре
 * (`packages/granularity/src/__tests__/styleTokens.test.ts`).
 *
 * Копия, а не общий модуль: гейт читает файловую систему своего пакета, и
 * вынести его значило бы связать ядро с companion ради вторичного
 * функционала. Ровно из-за отсутствия такого гейта в предшественнике
 * (`granularity-datepicker`) там жили `text-[14px]` и ссылка на
 * несуществующий токен.
 *
 * Кегли, радиусы, длительности и кривые объявлены токенами и ровно поэтому
 * выглядят настраиваемыми. Пиксельный литерал или утилита `duration-150`
 * этого обещания не держат: тема их не видит.
 */

// В jsdom `import.meta.url` не file-scheme — пути от cwd пакета.
const srcDir = resolve(process.cwd(), 'src')

function readSources(dir = srcDir): { path: string, source: string }[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = resolve(dir, entry.name)

    if (entry.isDirectory())
      return entry.name === '__tests__' ? [] : readSources(full)

    if (!/\.(?:vue|ts|css)$/.test(entry.name) || entry.name.includes('.test.'))
      return []

    return [{ path: full.slice(srcDir.length + 1), source: readFileSync(full, 'utf8') }]
  })
}

/**
 * Строки-комментарии выбрасываются до матчинга: в прозе встречаются те же
 * слова, и гейт, читающий комментарии, ловил бы объяснение как нарушение.
 */
function stripComments(source: string): string {
  return source
    .split('\n')
    .filter(line => !/^\s*(?:\/\/|\*|\/\*|<!--)/.test(line))
    .join('\n')
}

const sources = readSources().map(({ path, source }) => ({ path, source: stripComments(source) }))

function offenders(pattern: RegExp, input = sources): string[] {
  return [...new Set(input.flatMap(({ path, source }) =>
    [...source.matchAll(pattern)].map(match => `${match[0]} (${path})`)))].sort()
}

/** Утилиты кегля из шкалы `presetMini`: `text-sm` и соседи по лестнице. */
const UNO_TEXT_SCALE = /(?<![\w-])text-(?:xs|sm|base|lg|xl|[2-9]xl)(?![\w-])/g

/** Утилиты радиуса из шкалы `presetMini`, включая направленные (`rounded-l-md`). */
const UNO_RADIUS_SCALE = /(?<![\w:.-])(?<!:\s)rounded(?:-(?:[tblrse]|tl|tr|bl|br|ss|se|es|ee))?(?:-(?:none|sm|md|lg|xl|[2-9]xl|full))?(?![\w:?=[-])/g

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
      'используй `ease-[var(--gr-ease-out)]`: кривые задаёт дизайн-система, а не пресет',
    ).toEqual([])
  })

  it('время в собственном CSS — тоже токеном', () => {
    expect(
      offenders(/(?<![\w.-])\d+ms(?![\w-])/g),
      'literal в `transition`/`animation` — на `var(--gr-duration-*)`',
    ).toEqual([])
  })

  /**
   * Утилита совпадает с токеном по значению — и ровно поэтому опаснее литерала:
   * выглядит правильно, а тема её не видит. `text-sm` останется 14px, даже если
   * `--gr-text-sm` переопределён.
   */
  it('кегли — не утилиты uno-шкалы', () => {
    expect(
      offenders(UNO_TEXT_SCALE),
      'используй `text-[length:var(--gr-text-*|--gr-control-text-*)]` + парный `leading-[var(--gr-leading-*)]`',
    ).toEqual([])
  })

  it('радиусы — не утилиты uno-шкалы', () => {
    expect(
      offenders(UNO_RADIUS_SCALE),
      'используй `rounded-[var(--gr-radius-*)]`; шаги uno сдвинуты — `rounded-md` это 6px, то есть `--gr-radius-control`',
    ).toEqual([])
  })

  /**
   * Сам детектор проверяется отдельно: обе утилиты — обычные английские слова,
   * и гейт, ловящий их в прозе или в имени пропа, врёт ровно так же, как гейт,
   * не ловящий ничего.
   */
  it('детектор отличает утилиту от прозы и от имени пропа', () => {
    const fixture = [{
      path: 'fixture.vue',
      source: stripComments([
        '// If the target has rounded corners, we must clip its content',
        'export interface GrXProps { rounded?: string }',
        'const resolved = computed(() => props.rounded ?? roundedByVariant[props.variant])',
        ':style="{ height, width, borderRadius: rounded }"',
        'class="rounded-[var(--gr-radius-control)] rounded-l-[var(--gr-radius-md)]"',
        'class="text-left text-center text-transparent text-[length:var(--gr-text-sm)]"',
      ].join('\n')),
    }]

    expect(offenders(UNO_RADIUS_SCALE, fixture)).toEqual([])
    expect(offenders(UNO_TEXT_SCALE, fixture)).toEqual([])

    const broken = [{ path: 'broken.vue', source: 'class="rounded-md rounded-l-lg text-sm text-2xl"' }]

    expect(offenders(UNO_RADIUS_SCALE, broken)).toEqual([
      'rounded-l-lg (broken.vue)',
      'rounded-md (broken.vue)',
    ])
    expect(offenders(UNO_TEXT_SCALE, broken)).toEqual([
      'text-2xl (broken.vue)',
      'text-sm (broken.vue)',
    ])
  })

  /**
   * Обратная сторона: гейт держит связь с токенами живой. Иначе следующая
   * правка тихо вернёт литералы, а шкала снова станет декоративной.
   */
  it('токены движения и типографики действительно используются', () => {
    const uses = (pattern: RegExp) => sources.filter(({ source }) => pattern.test(source)).length

    expect(uses(/var\(--gr-duration-/), '--gr-duration-* не используется ни одним компонентом').toBeGreaterThan(0)
    expect(uses(/var\(--gr-ease-/), '--gr-ease-* не используется ни одним компонентом').toBeGreaterThan(0)
    expect(uses(/var\(--gr-leading-/), '--gr-leading-* не используется ни одним компонентом').toBeGreaterThan(0)
  })
})
