// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'

import { classNamesFromSelector, collectClassNames, unstyledClasses } from '../resolve/unstyledClasses'

describe('классы из селектора', () => {
  it('берёт все классы составного селектора', () => {
    expect(classNamesFromSelector('.a .b > .c')).toEqual(['a', 'b', 'c'])
  })

  it('снимает экранирование: в разметке живёт неэкранированное имя', () => {
    // Без этого весь UnoCSS числился бы «без правил».
    expect(classNamesFromSelector('.hover\\:bg-red')).toEqual(['hover:bg-red'])
    expect(classNamesFromSelector('.text-\\[13px\\]')).toEqual(['text-[13px]'])
  })

  it('не путает класс с тегом и идентификатором', () => {
    expect(classNamesFromSelector('button#save.primary')).toEqual(['primary'])
  })

  it('псевдоклассы не считает классами', () => {
    expect(classNamesFromSelector('.btn:hover')).toEqual(['btn'])
  })
})

describe('сбор классов элемента', () => {
  it('берёт корень и потомков без повторов', () => {
    const root = document.createElement('div')
    root.className = 'panel panel-lg'
    const child = document.createElement('span')
    child.className = 'panel icon'
    root.append(child)

    expect(collectClassNames(root)).toEqual(['panel', 'panel-lg', 'icon'])
  })

  it('элемент без классов не ломает сбор', () => {
    expect(collectClassNames(document.createElement('div'))).toEqual([])
  })
})

describe('отчёт о классах без правил', () => {
  it('находит те, для которых правил нет', () => {
    const report = unstyledClasses(['known', 'orphan'], new Set(['known']), 0)

    expect(report).toMatchObject({ unstyled: ['orphan'], checked: 2 })
  })

  it('считает проверенные: «ничего не найдено» и «нечего проверять» — разное', () => {
    expect(unstyledClasses([], new Set(), 0).checked).toBe(0)
    expect(unstyledClasses(['a'], new Set(['a']), 0)).toMatchObject({ unstyled: [], checked: 1 })
  })

  it('непрочитанные листы доезжают до отчёта: без них вывод неполон', () => {
    expect(unstyledClasses(['a'], new Set(), 2).unreadableSheets).toBe(2)
  })
})
