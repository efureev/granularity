import { mount } from '@vue/test-utils'
import { type Component, defineComponent, h, nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import GrColorPicker from '../components/GrColorPicker/GrColorPicker.vue'
import GrFormField from '../components/GrFormField/GrFormField.vue'
import GrSelect from '../components/GrSelect/GrSelect.vue'
import GrTransfer from '../components/GrTransfer/GrTransfer.vue'
import GrTreeSelect from '../components/GrTreeSelect/GrTreeSelect.vue'
import { resetGranularityDom } from '../testing'

afterEach(resetGranularityDom)

/**
 * Вспомогательные поля внутри контрола — поиск в панели, hex у палитры, поиск
 * у переноса — не контрол поля формы. `GrInput` в них забирал контекст
 * `GrFormField` целиком: id триггера (дубль в DOM навсегда — поиск
 * `GrTreeSelect` живёт в DOM и при закрытой панели), подсказку и ошибку в
 * `aria-describedby`, `aria-required` и `aria-invalid`: скринридер объявлял
 * поиск «обязательным, с ошибкой».
 */
interface Case {
  name: string
  component: Component
  props: Record<string, unknown>
  /** Как открыть панель, если поле живёт в ней. */
  open?: string
  helper: string
}

const cases: Case[] = [
  {
    name: 'GrTreeSelect',
    component: GrTreeSelect,
    props: { modelValue: null, filterable: true, data: [{ id: 'a', label: 'Travel', children: [{ id: 'a1', label: 'Flights' }] }], nodeKey: 'id' },
    open: '[data-gr-tree-select-trigger], [data-testid="gr-tree-select-trigger"], button',
    helper: 'input[data-gr-tree-select-filter]',
  },
  {
    name: 'GrSelect',
    component: GrSelect,
    props: { modelValue: '', optionsView: 'panel', filterable: true, options: [{ value: 'a', label: 'Travel' }] },
    open: '[data-gr-select-trigger]',
    helper: 'input[data-gr-select-search]',
  },
  {
    name: 'GrTransfer',
    component: GrTransfer,
    props: { items: [{ key: 'a', label: 'Read' }], modelValue: [], searchable: true },
    helper: '[data-gr-transfer-panel="source"] input[type="search"]',
  },
  {
    name: 'GrColorPicker',
    component: GrColorPicker,
    props: { modelValue: '#2563eb', inline: true },
    helper: 'input[data-gr-color-picker-hex]',
  },
]

describe('вспомогательное поле не забирает контекст GrFormField', () => {
  for (const item of cases) {
    it(item.name, async () => {
      const wrapper = mount(defineComponent({
        render: () => h(GrFormField, { label: 'Category', hint: 'Where the expense is booked', required: true, error: 'Choose a category' }, {
          default: () => h(item.component, item.props),
        }),
      }), { attachTo: document.body })
      await nextTick()

      if (item.open) {
        await wrapper.find(item.open).trigger('click')
        await nextTick()
        await nextTick()
      }

      const helper = document.querySelector<HTMLElement>(item.helper)
      expect(helper, `нет ${item.helper}`).not.toBeNull()

      const fieldControlId = wrapper.get('label').attributes('for')
      if (helper!.id)
        expect(document.querySelectorAll(`[id="${helper!.id}"]`)).toHaveLength(1)
      expect(helper!.id).not.toBe(fieldControlId)
      expect(helper!.getAttribute('aria-required')).toBeNull()
      expect(helper!.getAttribute('aria-invalid')).toBeNull()

      const hintId = wrapper.get('[data-gr-form-field-hint]').attributes('id')
      expect(helper!.getAttribute('aria-describedby') ?? '').not.toContain(hintId!)
      // Своё имя у поля есть.
      expect(helper!.getAttribute('aria-label') || helper!.getAttribute('aria-labelledby')).toBeTruthy()
      wrapper.unmount()
    })
  }
})

describe('поиск в панели остаётся с подсказкой', () => {
  /**
   * Панель уводит фокус в поиск сразу при открытии, а `GrInput` гасил
   * placeholder на фокусе — «Search…» не был виден ни разу, хотя это
   * единственная подсказка поля.
   */
  it('у `type="search"` placeholder не гаснет на фокусе, у прочих — как прежде', async () => {
    const { default: GrInput } = await import('../components/GrInput/GrInput.vue')
    const search = mount(GrInput, { props: { modelValue: '', type: 'search', placeholder: 'Search…' } })
    const text = mount(GrInput, { props: { modelValue: '', placeholder: 'Name' } })

    expect(search.get('input').classes()).not.toContain('focus:placeholder:text-transparent')
    expect(text.get('input').classes()).toContain('focus:placeholder:text-transparent')
  })

  /** Строки дерева в панели — на шаге контрола: на `md` 14px, как у триггера, а не 16px. */
  it('панель GrTreeSelect набирается кеглем контрола своего размера', async () => {
    const wrapper = mount(GrTreeSelect, {
      props: { modelValue: null, size: 'md', data: [{ id: 'a', label: 'Travel' }], nodeKey: 'id' },
      attachTo: document.body,
    })
    await wrapper.get('[data-gr-tree-select-trigger]').trigger('click')
    await nextTick()

    const scroller = document.querySelector('[data-gr-tree-select-panel] .min-h-0')
    expect(scroller?.classList.contains('text-[length:var(--gr-control-text-md)]')).toBe(true)
    wrapper.unmount()
  })
})
