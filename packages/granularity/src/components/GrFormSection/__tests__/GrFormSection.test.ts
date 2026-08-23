import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'

import GrFormSection from '../GrFormSection.vue'
import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'

describe('GrFormSection', () => {
  it('рендерит title, description и slot content', () => {
    const wrapper = mount(GrFormSection, {
      props: {
        title: 'Profile settings',
        description: 'Manage your public information',
      },
      slots: {
        default: '<input type="text" value="Alice" />',
      },
    })

    expect(wrapper.text()).toContain('Profile settings')
    expect(wrapper.text()).toContain('Manage your public information')
    expect(wrapper.get('input').element).toBeInstanceOf(HTMLInputElement)
  })

  it('не рендерит description-блок, если описание не передано', () => {
    const wrapper = mount(GrFormSection, {
      props: {
        title: 'Security',
      },
    })

    expect(wrapper.text()).toContain('Security')
    expect(wrapper.find('[data-gr-form-section-description]').exists()).toBe(false)
    expect(wrapper.get('section').attributes('aria-describedby')).toBeUndefined()
  })
})

describe('GrFormSection — структура для скринридера', () => {
  it('заголовок настоящий: по нему форму и обходят', () => {
    const wrapper = mount(GrFormSection, { props: { title: 'Профиль' } })
    const heading = wrapper.get('[data-gr-form-section-title]')

    // Жирный `div` в обзор по заголовкам не попадает вовсе.
    expect(heading.element.tagName).toBe('H3')
    expect(heading.text()).toBe('Профиль')
  })

  it('уровень заголовка задаётся пропом', () => {
    const wrapper = mount(GrFormSection, { props: { title: 'Профиль', headingLevel: 5 } })

    expect(wrapper.get('[data-gr-form-section-title]').element.tagName).toBe('H5')
  })

  it('уровень приходит из `GrConfigProvider`, локальный проп сильнее', () => {
    const Harness = defineComponent({
      components: { GrConfigProvider, GrFormSection },
      props: { headingLevel: { type: Number, default: undefined } },
      template: `
        <GrConfigProvider :component-defaults="{ GrFormSection: { headingLevel: 2 } }">
          <GrFormSection title="Профиль" :heading-level="headingLevel" />
        </GrConfigProvider>
      `,
    })

    expect(mount(Harness).get('[data-gr-form-section-title]').element.tagName).toBe('H2')
    expect(mount(Harness, { props: { headingLevel: 4 } }).get('[data-gr-form-section-title]').element.tagName).toBe('H4')
  })

  it('по умолчанию секция не лендмарк: пять секций — не пять регионов', () => {
    const wrapper = mount(GrFormSection, { props: { title: 'Профиль' } })

    expect(wrapper.get('section').attributes('aria-labelledby')).toBeUndefined()
  })

  it('`landmark` возвращает регион и даёт ему имя от заголовка', () => {
    const wrapper = mount(GrFormSection, { props: { title: 'Профиль', landmark: true } })
    const section = wrapper.get('section')
    const labelledBy = section.attributes('aria-labelledby')

    expect(labelledBy).toBeTruthy()
    expect(wrapper.get(`#${labelledBy}`).text()).toBe('Профиль')
  })

  it('описание связано с секцией', () => {
    const wrapper = mount(GrFormSection, { props: { title: 'Профиль', description: 'Публичные данные' } })
    const describedBy = wrapper.get('section').attributes('aria-describedby')

    expect(wrapper.get(`#${describedBy}`).text()).toBe('Публичные данные')
  })
})

describe('GrFormSection — слоты', () => {
  it('слоты подменяют заголовок и описание', () => {
    const wrapper = mount(GrFormSection, {
      props: { title: 'Строкой', description: 'Строкой' },
      slots: {
        title: '<span data-custom-title>Разметкой</span>',
        description: '<span data-custom-description>Разметкой</span>',
      },
    })

    expect(wrapper.get('[data-gr-form-section-title]').text()).toBe('Разметкой')
    expect(wrapper.find('[data-custom-title]').exists()).toBe(true)
    expect(wrapper.find('[data-custom-description]').exists()).toBe(true)
  })

  it('действия живут в шапке справа', () => {
    const wrapper = mount(GrFormSection, {
      props: { title: 'Участники' },
      slots: { actions: '<button data-add>Добавить</button>' },
    })

    const actions = wrapper.get('[data-gr-form-section-actions]')
    expect(actions.find('[data-add]').exists()).toBe(true)
    // Шапка одна: заголовок и действия должны стоять в одной строке.
    expect(actions.element.parentElement).toBe(wrapper.get('[data-gr-form-section-title]').element.parentElement?.parentElement)
  })

  it('без заголовка, описания и действий шапки нет вовсе', () => {
    const wrapper = mount(GrFormSection, { slots: { default: '<input>' } })

    expect(wrapper.find('[data-gr-form-section-title]').exists()).toBe(false)
    expect(wrapper.get('section').element.children).toHaveLength(1)
  })
})
