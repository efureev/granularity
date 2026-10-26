import { describe, expect, it } from 'vitest'

import { breadcrumbs, type CrumbTitles } from '../app/breadcrumbs'

const titles: CrumbTitles = {
  foundation: id => ({ color: 'Цвет' } as Record<string, string>)[id],
  theme: id => ({ clay: 'Глина' } as Record<string, string>)[id],
  component: id => ({ button: 'Button' } as Record<string, string>)[id],
  componentGroup: id => (id === 'button' ? { id: 'buttons', title: 'Кнопки' } : undefined),
}

describe('хлебные крошки шапки', () => {
  it('страница темы: обзор и каталог — ссылки, тема — текущая', () => {
    expect(breadcrumbs('theme', { theme: 'slate', slug: 'clay' }, 'slate', titles)).toEqual([
      { label: 'Обзор', to: { name: 'overview', params: { theme: 'slate' } } },
      { label: 'Каталог тем', to: { name: 'themes', params: { theme: 'slate' } } },
      { label: 'Глина' },
    ])
  })

  it('компонент: каталог и группа — ссылки, группа — якорем каталога', () => {
    expect(breadcrumbs('component', { component: 'button' }, 'slate', titles)).toEqual([
      { label: 'Обзор', to: { name: 'overview', params: { theme: 'slate' } } },
      { label: 'Компоненты', to: { name: 'components', params: { theme: 'slate' } } },
      { label: 'Кнопки', to: { name: 'components', params: { theme: 'slate' }, hash: '#group-buttons' } },
      { label: 'Button' },
    ])
    expect(breadcrumbs('components', {}, 'slate', titles).at(-1)).toEqual({ label: 'Компоненты' })
  })

  it('раздел без своей страницы — без ссылки', () => {
    expect(breadcrumbs('foundation', { foundation: 'color' }, 'slate', titles).at(-1)).toEqual({ label: 'Цвет' })
  })

  it('обзор — один пункт; чужой адрес — «не найдено»', () => {
    expect(breadcrumbs('overview', {}, 'slate', titles)).toEqual([{ label: 'Обзор' }])
    expect(breadcrumbs('theme', { slug: 'ink' }, 'slate', titles).at(-1)).toEqual({ label: 'Не найдено' })
    // У адреса «не найдено» темы нет: ссылка домой — в тему документа.
    expect(breadcrumbs('not-found', {}, 'clay', titles)).toEqual([{ label: 'Обзор', to: { name: 'overview', params: { theme: 'clay' } } }, { label: 'Не найдено' }])
  })
})
