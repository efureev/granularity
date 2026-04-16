import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DsTable from '../DsTable.vue'

describe('DsTable', () => {
  it('рендерит head и body slots внутри таблицы', () => {
    const wrapper = mount(DsTable, {
      slots: {
        head: '<tr><th>Title</th></tr>',
        default: '<tr><td>Value</td></tr>',
      },
    })

    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.find('thead').text()).toContain('Title')
    expect(wrapper.find('tbody').text()).toContain('Value')
  })
})