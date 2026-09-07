import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrNavbar from '../GrNavbar.vue'
import { GR_NAVBAR_HEADING_LEVELS, navbarTitleClass } from '../grNavbarStyles'

function title(wrapper: ReturnType<typeof mount>) {
  return wrapper.get('[data-gr-navbar-title]')
}

describe('GrNavbar — заголовок', () => {
  it('без уровня остаётся div: бренд заголовком не является', () => {
    const wrapper = mount(GrNavbar, { props: { title: 'Granularity' } })

    expect(title(wrapper).element.tagName).toBe('DIV')
  })

  it('уровень делает заголовок настоящим', () => {
    for (const level of GR_NAVBAR_HEADING_LEVELS) {
      const wrapper = mount(GrNavbar, { props: { title: 'Договоры', headingLevel: level } })

      expect(title(wrapper).element.tagName).toBe(`H${level}`)
    }
  })

  it('единица разрешена: имя раздела в шапке и есть заголовок страницы', () => {
    const wrapper = mount(GrNavbar, { props: { title: 'Договоры', headingLevel: 1 } })

    expect(title(wrapper).element.tagName).toBe('H1')
  })

  it('слот живёт внутри заголовка, а не рядом с ним', () => {
    const wrapper = mount(GrNavbar, {
      props: { headingLevel: 2 },
      slots: { title: '<span data-test="own">Свой заголовок</span>' },
    })

    expect(title(wrapper).element.tagName).toBe('H2')
    expect(title(wrapper).find('[data-test="own"]').exists()).toBe(true)
  })

  it('браузерный отступ заголовка погашен', () => {
    // Префлайт пакета сбрасывает `margin` только у `body`, поэтому у потребителя
    // без tailwind-совместимого сброса `h1` принёс бы свой отступ и разогнал ряд.
    expect(navbarTitleClass).toContain('m-0')

    const wrapper = mount(GrNavbar, { props: { title: 'Договоры', headingLevel: 1 } })
    expect(title(wrapper).classes()).toContain('m-0')
  })

  it('вид заголовка не зависит от того, заголовок он или div', () => {
    const plain = mount(GrNavbar, { props: { title: 'Договоры' } })
    const heading = mount(GrNavbar, { props: { title: 'Договоры', headingLevel: 1 } })

    expect(title(heading).classes()).toEqual(title(plain).classes())
  })
})
