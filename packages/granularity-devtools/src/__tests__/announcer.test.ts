// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'

import { announcementsFromMutations } from '../resolve/announcer'

function region(politeness: string, text: string): HTMLElement {
  const element = document.createElement('div')
  element.setAttribute('data-gr-announcer-region', politeness)
  element.textContent = text
  document.body.append(element)
  return element
}

function mutationOn(target: Node): MutationRecord {
  return { target, type: 'childList' } as unknown as MutationRecord
}

describe('объявления живого региона', () => {
  it('читает текст и вежливость', () => {
    const polite = region('polite', 'Ссылка скопирована')

    expect(announcementsFromMutations([mutationOn(polite)])).toEqual([
      { politeness: 'polite', text: 'Ссылка скопирована' },
    ])
  })

  it('очистку региона за объявление не считает', () => {
    const empty = region('polite', '')

    expect(announcementsFromMutations([mutationOn(empty)])).toEqual([])
  })

  it('мутация текстового узла тоже читается', () => {
    const assertive = region('assertive', 'Не удалось сохранить')

    expect(announcementsFromMutations([mutationOn(assertive.firstChild!)])).toEqual([
      { politeness: 'assertive', text: 'Не удалось сохранить' },
    ])
  })

  it('одна запись на объявление, даже если мутаций пришло несколько', () => {
    const polite = region('polite', 'Строка удалена')

    expect(announcementsFromMutations([mutationOn(polite), mutationOn(polite.firstChild!)])).toHaveLength(1)
  })

  it('мутации вне региона не трогаем', () => {
    const foreign = document.createElement('p')
    foreign.textContent = 'обычный текст страницы'
    document.body.append(foreign)

    expect(announcementsFromMutations([mutationOn(foreign)])).toEqual([])
  })
})
