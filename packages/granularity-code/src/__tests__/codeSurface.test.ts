import { describe, expect, it } from 'vitest'

import { codeBlockRootClass } from '../components/GrCodeBlock/grCodeBlockStyles'
import { editorRootClass } from '../components/GrCodeEditor/grCodeEditorStyles'
import { diffRootClass } from '../components/GrDiff/grDiffStyles'

/**
 * Все три поверхности прокручивают длинные строки сами — и все три обязаны
 * объявить `min-w-0`.
 *
 * У грид- и флекс-элемента `min-width` по умолчанию `auto`: без этого класса
 * элемент раздувается под содержимое вместо своей прокрутки и вылезает за
 * родителя вместе с кнопкой копирования. Поймали это на логе с длинной строкой —
 * то есть на обычном входе, а не на краю.
 *
 * Проверяется классом, а не отрисовкой: в jsdom нет раскладки, и отличить
 * прокрутку от распирания там нечем.
 */
describe('поверхность кода не распирает родителя', () => {
  it.each([
    ['GrCodeBlock', codeBlockRootClass],
    ['GrCodeEditor', editorRootClass],
    ['GrDiff', diffRootClass],
  ])('%s объявляет min-w-0', (_component, rootClass) => {
    expect(rootClass.split(/\s+/)).toContain('min-w-0')
  })
})
