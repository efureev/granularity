import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

import { componentCodeFiles } from '@feugene/granularity-test-kit/gates'
import { describe, expect, it } from 'vitest'

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

/**
 * Потребители рамы находятся по факту, а не списком.
 *
 * Раньше здесь был захардкожен `GrChartLine`, и проверка стерегла ровно один
 * компонент из пяти: любой следующий мог уехать без рамы, и не заметил бы
 * никто — сборка зелёная, тесты зелёные, `doctor` зелёный, а цвета у
 * потребителя прозрачные.
 */
const frameConsumers = Object.entries(granularityChartsComponentConfigs)
  .filter(([name]) => existsSync(resolve(process.cwd(), `src/components/${name}/config.ts`)))
  .filter(([name]) => readFileSync(resolve(process.cwd(), `src/components/${name}/config.ts`), 'utf8')
    .includes('group: \'GrChartFrame\''))
  .map(([name]) => name)

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

  it('потребители рамы находятся, и их больше одного', () => {
    // Гейт ниже ходит по этому списку: пустой или короткий список зеленел бы
    // всегда, ничего не проверяя.
    expect(frameConsumers.length).toBeGreaterThan(1)
  })

  it.each(frameConsumers)('классы рамы доходят до %s по графу бандла', (name) => {
    // Классы рамы живут в общем `.ts`-хелпере, который бандлер уносит в
    // `dist/chunks/`. granum извлекает их, обходя от входа компонента все его
    // чанки, — тот же обход здесь по исходникам. При UnoCSS-пресете общий чанк
    // не сканировался, и рама держалась на `chartFrameSafelist`: без него
    // график приезжал без цветов при зелёной сборке.
    const files = componentCodeFiles(
      resolve(process.cwd(), 'src/components'),
      name,
      Object.keys(granularityChartsComponentConfigs),
    )

    expect(files, `${name} не дотягивается до классов рамы`).toContain(resolve(frameDir, 'chartFrameStyles.ts'))
  })

  it('шаблоны рамы лежат в `shared/` — раме принадлежит разметка, а не корень', () => {
    // Держим раму одним домом: `.vue` рядом с `tokens.json` и хелперами читался
    // бы как компонент, которым рама не является. Классы из общего чанка granum
    // находит и так — он входит в файлы каждого дотянувшегося компонента, — но
    // разъехавшиеся шаблоны стоили бы каждому читателю разбора, чья это рама.
    expect(readdirSync(frameDir).filter(file => file.endsWith('.vue'))).toEqual([])
    expect(readdirSync(resolve(frameDir, 'shared')).filter(file => file.endsWith('.vue')).length)
      .toBeGreaterThan(3)
  })

  it('каждый компонент с рамой в шаблоне объявляет её группу', () => {
    // `group` — единственная отметка, по которой видно, что рама у графиков
    // общая: по ней же выше находятся её потребители. Ищем по факту импорта
    // рамы, а не по списку: список устаревает молча.
    const renders = Object.keys(granularityChartsComponentConfigs).filter((name) => {
      const sfc = resolve(process.cwd(), `src/components/${name}/${name}.vue`)

      return existsSync(sfc) && readFileSync(sfc, 'utf8').includes('GrChartFrame/shared/ChartFrame.vue')
    })

    expect(renders.length).toBeGreaterThan(1)
    expect(renders.filter(name => !frameConsumers.includes(name)), 'рама в шаблоне есть, а группы нет').toEqual([])
  })
})
