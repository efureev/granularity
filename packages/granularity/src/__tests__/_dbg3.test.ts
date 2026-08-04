import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, it } from 'vitest'
import { writeFileSync } from 'node:fs'
import GrAutocomplete from '../components/GrAutocomplete/GrAutocomplete.vue'

describe('dbg', () => {
  it('open', async () => {
    const w = mount(GrAutocomplete, {
      props: { modelValue: 0 as never, options: [{ value: 0, label: 'Ноль' }, { value: 7, label: 'Семь' }] as never },
      attachTo: document.body,
    })
    await nextTick()
    await w.get('input').trigger('focus')
    await w.get('input').setValue('')
    await nextTick()
    writeFileSync('/tmp/ac.txt', JSON.stringify({
      optsInDoc: document.querySelectorAll('[data-gr-autocomplete-option]').length,
      roleOption: document.querySelectorAll('[role="option"]').length,
      panel: document.querySelectorAll('[data-gr-autocomplete-panel]').length,
      html: w.html().slice(0, 400),
    }, null, 1))
  })
})
