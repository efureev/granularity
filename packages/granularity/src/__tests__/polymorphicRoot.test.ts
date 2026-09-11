import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import GrCard from '../components/GrCard/GrCard.vue'
import GrFilePreview from '../components/GrFilePreview/GrFilePreview.vue'
import GrListItem from '../components/GrList/GrListItem.vue'
import GrStatistic from '../components/GrStatistic/GrStatistic.vue'

/**
 * Гейт контракта полиморфного корня.
 *
 * `as` называет **тег**, а не поведение: интерактивность даёт то, что попадает
 * в таб-порядок само (`shared/polymorphicRoot.ts`). Правило родилось из одного
 * и того же дефекта, независимо повторённого четырьмя компонентами — каждый
 * выводил интерактивность из самого факта пропа, и `as="section"` получал
 * кольцо фокуса, обещая клавиатуру, которой у него нет.
 *
 * Поэтому проверка сквозная, а не покомпонентная: покомпонентный тест ловит
 * регрессию там, где о правиле уже знают, а пятый компонент с `as` напишут, не
 * заглядывая в соседей.
 *
 * Корень ищется по `data`-атрибуту, а не по `wrapper.element`: у `GrListItem`
 * роль пункта живёт на обёртке, а полиморфна вложенная строка.
 */
const CASES = [
  { name: 'GrCard', component: GrCard, props: {}, root: '[data-gr-card]' },
  { name: 'GrStatistic', component: GrStatistic, props: { value: 1284 }, root: '[data-gr-statistic]' },
  { name: 'GrListItem', component: GrListItem, props: { title: 'Row' }, root: '[data-gr-list-item] > *' },
  {
    name: 'GrFilePreview',
    component: GrFilePreview,
    props: { mime: 'application/pdf', name: 'счёт.pdf' },
    root: '[data-gr-file-preview]',
  },
] as const

const FOCUS_RING = 'focus-visible:ring-2'

describe('контракт полиморфного корня: as называет тег, а не поведение', () => {
  it.each(CASES)('$name: неинтерактивный as не включает кольцо фокуса', ({ component, props, root }) => {
    const wrapper = mount(component, { props: { ...props, as: 'section' } })
    const element = wrapper.get(root)

    expect(element.element.tagName).toBe('SECTION')
    expect(element.classes()).not.toContain(FOCUS_RING)
  })

  it.each(CASES)('$name: классы неинтерактивного as равны классам дефолтного корня', ({ component, props, root }) => {
    const plain = mount(component, { props })
    const semantic = mount(component, { props: { ...props, as: 'section' } })

    expect(semantic.get(root).attributes('class')).toBe(plain.get(root).attributes('class'))
  })

  // `<a>` без ссылки не фокусируется и роли ссылки не имеет: одного тега мало.
  it.each(CASES)('$name: as="a" без href не интерактивен', ({ component, props, root }) => {
    const wrapper = mount(component, { props: { ...props, as: 'a' } })

    expect(wrapper.get(root).classes()).not.toContain(FOCUS_RING)
  })

  it.each(CASES)('$name: as="button" интерактивен и без clickable', ({ component, props, root }) => {
    const wrapper = mount(component, { props: { ...props, as: 'button' } })

    expect(wrapper.get(root).classes()).toContain(FOCUS_RING)
  })

  /**
   * Зеркальная ловушка: потребитель попросил действие на теге вне таб-порядка.
   * Клик остаётся — гасить его молча значило бы сломать работающий код, — но
   * об ошибке говорят вслух.
   */
  it.each(CASES)('$name: clickable с неинтерактивным as предупреждает', ({ component, props }) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mount(component, { props: { ...props, as: 'section', clickable: true } })

    expect(warn.mock.calls.flat().join(' ')).toContain('таб-порядок')

    warn.mockRestore()
  })
})
