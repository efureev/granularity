import { defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'

import { iconClass, iconTag } from '../icon'

const Custom = defineComponent({ name: 'Custom', render: () => h('svg') })
const Fallback = defineComponent({ name: 'Fallback', render: () => h('svg') })

describe('иконка пропом', () => {
  it('компонент рисуется как есть, класс — на пустом `span`', () => {
    expect(iconTag(Custom)).toBe(Custom)
    expect(iconTag('i-lucide-heart')).toBe('span')

    expect(iconClass('i-lucide-heart')).toBe('i-lucide-heart')
    expect(iconClass(Custom)).toBe('')
  })

  it('без иконки берётся запасная: у встроенной картинки контракта с потребителем нет', () => {
    expect(iconTag(undefined, Fallback)).toBe(Fallback)
    expect(iconTag('', Fallback)).toBe(Fallback)
    // Без запасной остаётся пустой `span` — место под иконку, но не картинка.
    expect(iconTag(undefined)).toBe('span')
  })
})
