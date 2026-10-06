import { mount } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import GrSelect from '../GrSelect.vue'

/**
 * Опции из слота нативного режима следуют `v-model`.
 *
 * Свои опции компонент отмечал `:selected`, а опциям из слота не ставил
 * ничего: при `country = ''` браузер показывал первую доступную опцию
 * («Ireland»), а программная смена модели на экран не доходила.
 */
function countries(model: { value: string }) {
  return defineComponent({
    setup: () => () => h(GrSelect, {
      'modelValue': model.value,
      'name': 'country',
      'onUpdate:modelValue': (value: unknown) => { model.value = String(value) },
    }, {
      default: () => [
        h('option', { value: '', disabled: true }, 'Choose a country'),
        h('optgroup', { label: 'Next working day' }, [
          h('option', { value: 'ie' }, 'Ireland'),
          h('option', { value: 'pt' }, 'Portugal'),
        ]),
        h('option', { value: 'de' }, 'Germany'),
      ],
    }),
  })
}

describe('GrSelect: опции из слота в нативном режиме', () => {
  it('пустая модель выбирает опцию с пустым значением, а не первую доступную', async () => {
    const model = ref('')
    const wrapper = mount(countries(model), { attachTo: document.body })
    await nextTick()

    const select = wrapper.get('select').element as HTMLSelectElement
    expect(select.value).toBe('')
    expect(select.selectedOptions[0]?.textContent).toBe('Choose a country')
    wrapper.unmount()
  })

  it('программная смена модели доходит до DOM — и внутри optgroup', async () => {
    const model = ref('')
    const wrapper = mount(countries(model), { attachTo: document.body })
    const select = wrapper.get('select').element as HTMLSelectElement

    model.value = 'pt'
    await nextTick()
    expect(select.value).toBe('pt')

    model.value = 'de'
    await nextTick()
    expect(select.value).toBe('de')
    wrapper.unmount()
  })

  it('выбор пользователя уходит в модель', async () => {
    const model = ref('')
    const wrapper = mount(countries(model), { attachTo: document.body })

    await wrapper.get('select').setValue('ie')
    expect(model.value).toBe('ie')
    wrapper.unmount()
  })

  it('сервер отдаёт выбранную опцию из слота', async () => {
    const html = await renderToString(createSSRApp(countries({ value: 'pt' })))

    expect(html).toMatch(/<option value="pt" selected>Portugal<\/option>/)
    expect(html).not.toMatch(/<option value="ie" selected>/)
  })
})
