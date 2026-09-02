import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * Гейт `prefers-reduced-motion`.
 *
 * До него поддержка была ровно в одном месте (`GrSkeleton`) при 78 утилитах
 * `transition-*`, 7 `animate-spin`, анимациях всех оверлеев и трёх покомпонентных
 * `@keyframes`.
 *
 * Канал выбран не свободно: вариант `motion-safe:` / `motion-reduce:` под
 * `presetMini` **не генерирует CSS вовсе** — класс молча исчезает, а анимация
 * остаётся. Поэтому носитель контракта — глобальный блок в `base.css`, и гейт
 * следит именно за ним.
 */

const stylesDir = resolve(process.cwd(), 'src/styles')
const componentsDir = resolve(process.cwd(), 'src/components')

/** Объявления, без которых кламп не выполняет свою задачу. */
const REQUIRED_DECLARATIONS = [
  'animation-delay: 0ms !important',
  'animation-duration: 0.01ms !important',
  'animation-iteration-count: 1 !important',
  'transition-delay: 0ms !important',
  'transition-duration: 0.01ms !important',
  'scroll-behavior: auto !important',
]

/**
 * Компоненты со своими `@keyframes`, которым глобального клампа достаточно.
 *
 * Критерий ровно один: у анимации нет `animation-fill-mode: forwards`, поэтому,
 * отработав за `0.01ms`, элемент возвращается в исходное состояние. Для вращения
 * это `0deg` — статичная иконка в правильной ориентации, а не замерший под
 * случайным углом кадр; для «попа» счётчика `GrBadgeWrap` — `transform: none`,
 * то есть бейдж на своём месте и в своём размере.
 *
 * `GrToaster` в списке нет намеренно: у его полосы прогресса `fill-mode: forwards`,
 * из-за чего кламп фиксировал бы её на `scaleX(0)` — таймер выглядел бы истёкшим
 * при живом тосте. Он обязан иметь собственный блок.
 */
const CLAMP_SAFE_KEYFRAMES = new Set<string>(['GrBadgeWrap', 'GrTransfer'])

function readStyle(name: string): string {
  return readFileSync(resolve(stylesDir, name), 'utf8')
}

/** Тело `@media (prefers-reduced-motion: reduce)` — со сжатыми пробелами. */
function reducedMotionBlock(source: string): string | null {
  const start = source.indexOf('@media (prefers-reduced-motion: reduce)')
  if (start < 0)
    return null

  let depth = 0
  for (let i = source.indexOf('{', start); i < source.length; i++) {
    if (source[i] === '{') {
      depth++
    }
    else if (source[i] === '}') {
      depth--
      if (depth === 0)
        return source.slice(start, i + 1).replace(/\s+/g, ' ')
    }
  }

  return null
}

function componentSources(): { name: string, file: string, source: string }[] {
  return readdirSync(componentsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.startsWith('Gr'))
    .flatMap(entry => readdirSync(resolve(componentsDir, entry.name))
      .filter(file => (file.endsWith('.vue') || file.endsWith('.css')) && !file.includes('.test.'))
      .map(file => ({
        name: entry.name,
        file: `${entry.name}/${file}`,
        source: readFileSync(resolve(componentsDir, entry.name, file), 'utf8'),
      })))
}

describe('prefers-reduced-motion', () => {
  it.each(['base.css', 'preflight.css'])('%s объявляет кламп движения', (file) => {
    const block = reducedMotionBlock(readStyle(file))

    expect(block, `в ${file} нет блока prefers-reduced-motion`).not.toBeNull()

    const missing = REQUIRED_DECLARATIONS.filter(decl => !block!.includes(decl))
    expect(missing, `${file}: не хватает ${missing.join('; ')}`).toEqual([])
  })

  it('кламп применён к элементу и обоим псевдоэлементам', () => {
    const block = reducedMotionBlock(readStyle('base.css'))!

    // Без псевдоэлементов анимированные `::before`/`::after` (иконки, оверлеи)
    // остались бы в движении — селектор `*` их не покрывает.
    expect(block).toContain('*, *::before, *::after')
  })

  it('base.css и preflight.css держат блок синхронным', () => {
    // Файлы дублируют глобальный слой намеренно (data-URL preflight не резолвит
    // `@import`), и их синхронность до сих пор держалась только на комментарии.
    expect(reducedMotionBlock(readStyle('base.css')))
      .toBe(reducedMotionBlock(readStyle('preflight.css')))
  })

  it('каждый компонентный `@keyframes` либо обработан, либо безопасен под клампом', () => {
    const offenders = componentSources()
      .filter(({ source }) => source.includes('@keyframes'))
      .filter(({ name, source }) =>
        !CLAMP_SAFE_KEYFRAMES.has(name) && !source.includes('prefers-reduced-motion'),
      )
      .map(({ file }) => file)

    expect(offenders, `нет обработки reduced-motion: ${offenders.join(', ')}`).toEqual([])
  })

  it('список безопасных под клампом не протух', () => {
    // `fill-mode: forwards` — ровно тот признак, из-за которого кламп фиксирует
    // конечный кадр вместо возврата в исходный.
    const stale = componentSources()
      .filter(({ name }) => CLAMP_SAFE_KEYFRAMES.has(name))
      .filter(({ source }) => /animation-fill-mode:\s*(?:forwards|both)/.test(source)
        || /animation:[^;]*\b(?:forwards|both)\b/.test(source))
      .map(({ file }) => file)

    expect(stale, `появился fill-mode — нужен свой reduce-блок: ${stale.join(', ')}`).toEqual([])
  })
})
