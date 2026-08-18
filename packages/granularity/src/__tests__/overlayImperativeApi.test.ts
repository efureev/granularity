import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrCommandPalette from '../components/GrCommandPalette/GrCommandPalette.vue'
import GrContextMenu from '../components/GrContextMenu/GrContextMenu.vue'
import GrDialog from '../components/GrDialog/GrDialog.vue'
import GrDropdown from '../components/GrDropdown/GrDropdown.vue'
import GrModal from '../components/GrModal/GrModal.vue'
import GrPopover from '../components/GrPopover/GrPopover.vue'

/**
 * Гейт императивного API слоя оверлеев.
 *
 * Дефект, ради которого написан: `GrPopover` отдавал `open`/`close`/`toggle`, а
 * `GrModal`, `GrDialog`, `GrDropdown` и `GrCommandPalette` не вызывали
 * `defineExpose` вовсе — открыть их можно было только через `v-model`. Один слой
 * библиотеки вёл себя двумя разными способами, и узнать об этом потребитель мог
 * только упёршись.
 *
 * Гейт держит именно **состав** API, а не поведение: что происходит по вызову,
 * проверяет спек каждого компонента — у управляемых это эмит `update:modelValue`,
 * у неуправляемых правка собственного состояния.
 */

const OVERLAY_API = ['open', 'close', 'toggle'] as const

const overlays = [
  ['GrPopover', GrPopover, {}],
  ['GrModal', GrModal, { modelValue: false }],
  ['GrDialog', GrDialog, { modelValue: false, ariaLabel: 'Dialog' }],
  ['GrDropdown', GrDropdown, {}],
  ['GrCommandPalette', GrCommandPalette, { modelValue: false, items: [] }],
  ['GrContextMenu', GrContextMenu, { items: [{ key: 'a', label: 'A' }] }],
] as const

describe('императивный API слоя оверлеев', () => {
  it.each(overlays)('%s отдаёт open/close/toggle', (_name, component, props) => {
    const wrapper = mount(component, { props: props as Record<string, unknown> })
    const api = wrapper.vm as unknown as Record<string, unknown>

    for (const method of OVERLAY_API) {
      expect(typeof api[method]).toBe('function')
    }

    wrapper.unmount()
  })
})
