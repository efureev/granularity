import { describe, expect, it } from 'vitest'

import { autocompletePanelClasses } from '../../GrAutocomplete/grAutocompleteStyles'
import { grSelectPanelClasses } from '../../GrSelect/grSelectStyles'
import { grTreeSelectPanelClass } from '../../GrTreeSelect/grTreeSelectStyles'
import { overlayListPanelClass } from '../overlayListPanel'
import { floatingAvailableHeightVar } from '../../../composables/useFloating'

/**
 * Панели списков ужимаются до места, оставшегося до края вьюпорта.
 *
 * Замер публикует слой позиционирования, и до этой правки его читал только
 * `GrPopover`: три списочные панели резались фиксированным `dropdownMaxHeight`
 * и о доступном месте не знали. Проверяется связка целиком — имя переменной,
 * потолок и колонка, — потому что порознь каждая часть выглядит безобидно, а
 * без любой из них список либо не ужимается, либо получает вторую полосу
 * прокрутки.
 */
const PANELS: [string, string][] = [
  ['GrSelect', grSelectPanelClasses],
  ['GrAutocomplete', autocompletePanelClasses],
  ['GrTreeSelect', grTreeSelectPanelClass],
]

describe('панель списка знает о доступном месте', () => {
  it('потолок берётся из замера слоя, а не из числа', () => {
    // Имя переменной приходит из `useFloating`, а не переписывается строкой:
    // разойдись они на букву — потолок молча перестал бы применяться.
    expect(overlayListPanelClass).toContain(`max-h-[var(${floatingAvailableHeightVar},100vh)]`)
  })

  it('панель — колонка: ужимается список, а не она целиком', () => {
    // Без колонки у панели с полем поиска и строками состояний вместо одного
    // скролла вышло бы два.
    expect(overlayListPanelClass).toContain('flex')
    expect(overlayListPanelClass).toContain('flex-col')
  })

  it.each(PANELS)('%s берёт общий класс панели списка', (_name, classes) => {
    for (const token of overlayListPanelClass.split(' '))
      expect(classes).toContain(token)
  })
})
