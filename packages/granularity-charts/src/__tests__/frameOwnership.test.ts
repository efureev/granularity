import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

import { describe, expect, it } from 'vitest'

import { chartFrameSafelist } from '../components/GrChartFrame/frameSafelist'
import { grChartLineSafelist } from '../components/GrChartLine/safelist'
import { GRANULARITY_CHARTS_COMPONENTS } from '../componentNames'
import { granularityChartsComponentConfigs } from '../granular-provider/shared'

/**
 * `GrChartFrame` — дом общей разметки и владелец токенов `--gr-chart-frame-*`,
 * но **не компонент**. Положение неочевидное, и держится оно на отсутствии
 * двух файлов, поэтому фиксируется здесь.
 *
 * Почему именно так. Гейт покомпонентных токенов ищет реестры по файлу
 * `tokens.json` в любой директории с префиксом `Gr`, а генератор реестров
 * считает компонентом только директорию, где есть **и** `index.ts`, **и**
 * `config.ts`. Пересечения нет — значит рама легально владеет своими токенами
 * и при этом не попадает ни в один реестр.
 *
 * Альтернативы отпадают: в `internal/` токены не найдёт ни один реестр, а под
 * владельцем `GrChartLine` они сломают проверку «токен встречается у
 * владельца». Сделать раму настоящим компонентом тоже нельзя: наружу она не
 * публикуется и своей публичной поверхности не имеет.
 */

const frameDir = resolve(process.cwd(), 'src/components/GrChartFrame')

describe('GrChartFrame — рама, а не компонент', () => {
  it('у неё нет ни index.ts, ни config.ts', () => {
    expect(existsSync(resolve(frameDir, 'index.ts')), 'index.ts сделал бы раму компонентом').toBe(false)
    expect(existsSync(resolve(frameDir, 'config.ts')), 'config.ts сделал бы раму компонентом').toBe(false)
  })

  it('свои токены у неё есть — иначе владельца у `--gr-chart-frame-*` не будет', () => {
    const registry = JSON.parse(readFileSync(resolve(frameDir, 'tokens.json'), 'utf8')) as { owner: string }

    expect(registry.owner).toBe('GrChartFrame')
  })

  it('её нет ни в одном реестре компонентов', () => {
    const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')) as {
      exports: Record<string, unknown>
    }

    expect(Object.keys(granularityChartsComponentConfigs)).not.toContain('GrChartFrame')
    expect([...GRANULARITY_CHARTS_COMPONENTS]).not.toContain('GrChartFrame')
    expect(Object.keys(pkg.exports)).not.toContain('./components/GrChartFrame')
    expect(readFileSync(resolve(process.cwd(), 'src/index.ts'), 'utf8')).not.toContain('GrChartFrame')
  })

  it('её safelist подмешан в каждый компонент, который её рендерит', () => {
    // Классы рамы живут в общем `.ts`-хелпере, который бандлер уносит в
    // `dist/chunks/`. Пресет сканирует только `dist/components/<Name>/`, и без
    // этой строки график приезжает к потребителю без цветов — при зелёной
    // сборке и зелёных тестах.
    const missing = chartFrameSafelist.filter(token => !grChartLineSafelist.includes(token))

    expect(missing, 'классы рамы не попали в safelist GrChartLine').toEqual([])
  })

  it('safelist рамы не пуст — иначе проверка выше зелена всегда', () => {
    expect(chartFrameSafelist.length).toBeGreaterThan(10)
  })

  it('шаблоны рамы лежат в `shared/` — иначе группа их не подхватит', () => {
    // Пресет сканирует `dist/groups/<group>/shared/`, а чанки туда кладёт
    // `granularChunkFileNames` по умолчанию из раскладки
    // `src/components/<group>/shared/<File>.vue`. Файл, оставленный на уровень
    // выше, уедет в общий `dist/chunks/` — и его классы не увидит никто.
    expect(readdirSync(frameDir).filter(file => file.endsWith('.vue'))).toEqual([])
    expect(readdirSync(resolve(frameDir, 'shared')).filter(file => file.endsWith('.vue')).length)
      .toBeGreaterThan(3)
  })

  it('каждый компонент, который рендерит раму, объявляет её группу', () => {
    // Без `group` shared-директория не сканируется, и классы из шаблонов рамы
    // молча выпадают из CSS — при зелёных сборке, тестах и `doctor`.
    const config = readFileSync(
      resolve(process.cwd(), 'src/components/GrChartLine/config.ts'),
      'utf8',
    )

    expect(config).toContain("group: 'GrChartFrame'")
  })
})
