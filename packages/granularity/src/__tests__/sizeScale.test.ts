import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * Гейт единой шкалы размеров.
 *
 * Шкал в пакете было пять: `xs sm md lg`, `sm md lg`, `sm md lg xl full`,
 * `sm md lg full`, `md lg xl`, `sm md`, плюс `GrAvatar.size: number`. Из-за
 * этого `<GrConfigProvider size="xs">` не мог примениться к половине пакета, а
 * `size="xl"` компилировался у одного компонента и падал у соседнего.
 *
 * Инвариант: каждый публичный `Gr*Size` — это либо `GrComponentSize`
 * (контролы), либо `GrOverlaySize` (ширина оверлея). Собственных кортежей
 * размеров в компонентах не заводим.
 */

const componentsDir = resolve(process.cwd(), 'src/components')

/** Литеральное объявление шкалы: `= 'sm' | 'md' | ...`. */
const LITERAL_SIZE = /export type (Gr\w*Size)\s*=\s*'[^\n]*/g

/** Состояние контрола, объявленное копией вместо `GrControlState`. */
const LITERAL_STATE = /export type (Gr\w*State)\s*=\s*'[^\n]*/g

function componentSources(): { path: string, source: string }[] {
  return readdirSync(componentsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.startsWith('Gr'))
    .flatMap(entry => readdirSync(resolve(componentsDir, entry.name))
      .filter(file => (file.endsWith('.ts') || file.endsWith('.vue')) && !file.includes('.test.'))
      .map(file => ({
        path: `${entry.name}/${file}`,
        source: readFileSync(resolve(componentsDir, entry.name, file), 'utf8'),
      })))
}

function findAll(re: RegExp, sources: { path: string, source: string }[]): string[] {
  return sources.flatMap(({ path, source }) =>
    [...source.matchAll(new RegExp(re.source, 'g'))].map(match => `${path}: ${match[0].trim()}`),
  )
}

describe('единая шкала размеров', () => {
  it('ни один компонент не объявляет свою шкалу размеров литералами', () => {
    const offenders = findAll(LITERAL_SIZE, componentSources())

    expect(offenders, offenders.join('\n')).toEqual([])
  })

  it('состояние контрола не переобъявляется копиями', () => {
    const offenders = findAll(LITERAL_STATE, componentSources())

    expect(offenders, offenders.join('\n')).toEqual([])
  })

  it('канонические шкалы объявлены ровно в одном месте', async () => {
    const { GR_COMPONENT_SIZES, GR_OVERLAY_SIZES, GR_CONTROL_STATES } = await import('../components/shared/sizes')

    expect(GR_COMPONENT_SIZES).toEqual(['xs', 'sm', 'md', 'lg'])
    expect(GR_OVERLAY_SIZES).toEqual(['sm', 'md', 'lg', 'xl', 'full'])
    expect(GR_CONTROL_STATES).toEqual(['default', 'success', 'warning', 'danger'])
  })
})
