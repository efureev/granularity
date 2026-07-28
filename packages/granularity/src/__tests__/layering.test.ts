import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { grFoundationTokens } from '../tokens'

// В jsdom `import.meta.url` не file-scheme — пути от cwd пакета, как в `cssContrast.ts`.
const componentsDir = resolve(process.cwd(), 'src/components')

function readComponentSources(): { path: string, source: string }[] {
  return readdirSync(componentsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.startsWith('Gr'))
    .flatMap(entry => readdirSync(resolve(componentsDir, entry.name))
      .filter(file => (file.endsWith('.vue') || file.endsWith('.ts')) && !file.includes('.test.'))
      .map(file => ({
        path: `${entry.name}/${file}`,
        source: readFileSync(resolve(componentsDir, entry.name, file), 'utf8'),
      })))
}

/**
 * Компоненты, сидящие вне шкалы слоёв. Это зафиксированное отклонение, а не
 * образец — см. `docs/z-index.md`, раздел «Отклонения». Список закрытый:
 * новый компонент со своим числом уронит тест.
 */
const KNOWN_OFF_SCALE = new Set([
  'GrDrawer/GrDrawer.vue', // z-50 на оверлее — ниже всей шкалы
  'GrLoading/grLoadingStyles.ts', // fullscreen-оверлей на z-50
  'GrImageViewer/GrImageViewer.vue', // DEFAULT_Z_INDEX = 2000, выше тостов
])

describe('слоирование (docs/z-index.md)', () => {
  it('шкала объявлена токенами', () => {
    const scale = grFoundationTokens.filter(token => token.name.startsWith('--gr-z-'))

    expect(scale.map(token => token.name)).toEqual([
      '--gr-z-dropdown',
      '--gr-z-tooltip',
      '--gr-z-modal',
      '--gr-z-toast',
    ])

    // Порядок значений = порядок слоёв, шаг оставляет место приложению.
    const values = scale.map(token => Number.parseInt(token.value, 10))
    expect(values).toEqual([...values].sort((left, right) => left - right))
    expect(new Set(values).size).toBe(values.length)
  })

  it('компоненты берут слой из токена, а не из числа', () => {
    // Смотрим только на диапазон страничных оверлеев (≥ 50). Меньшие значения
    // (`z-0`, `z-10`) — порядок внутри собственного stacking-контекста
    // компонента: панель над бэкдропом у `GrModal`, контент над подложкой
    // у `GrImageViewer`. Это не глобальный слой и запрету не подлежит.
    const rawLayer = /z-\[(?:[5-9]\d|\d{3,})\]|z-(?:[5-9]\d|\d{3,})\b|z-index:\s*(?:[5-9]\d|\d{3,})/

    const offenders = readComponentSources()
      .filter(({ path, source }) => !KNOWN_OFF_SCALE.has(path) && rawLayer.test(source))
      .map(({ path }) => path)

    expect(offenders, 'используй `z-[var(--gr-z-*)]`; новый слой — новый токен').toEqual([])
  })

  it('зафиксированные отклонения всё ещё на месте', () => {
    // Если отклонение починили — обнови `docs/z-index.md` и убери запись отсюда.
    const sources = new Map(readComponentSources().map(({ path, source }) => [path, source]))

    for (const path of KNOWN_OFF_SCALE)
      expect(sources.get(path), path).toMatch(/z-(?:[5-9]\d|\d{3,})|\d{4,}/)
  })
})
