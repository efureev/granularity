import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { useControlledOpen } from '../useControlledOpen'

describe('useControlledOpen', () => {
  it('uncontrolled: setOpen меняет состояние и зовёт onChange', () => {
    const onChange = vi.fn()
    const { open, setOpen } = useControlledOpen(() => undefined, onChange)

    expect(open.value).toBe(false)

    setOpen(true)
    expect(open.value).toBe(true)
    expect(onChange).toHaveBeenLastCalledWith(true)

    setOpen(false)
    expect(open.value).toBe(false)
    expect(onChange).toHaveBeenLastCalledWith(false)
  })

  it('no-op не эмитит: setOpen в текущее значение молчит', () => {
    const onChange = vi.fn()
    const { setOpen } = useControlledOpen(() => undefined, onChange)

    setOpen(false)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('controlled: состоянием владеет проп, onChange уходит, значение не меняется', () => {
    const prop = ref<boolean | undefined>(false)
    const onChange = vi.fn()
    const { open, setOpen } = useControlledOpen(() => prop.value, onChange)

    setOpen(true)
    expect(onChange).toHaveBeenLastCalledWith(true)
    // Родитель значение не применил — открытым состояние не стало.
    expect(open.value).toBe(false)

    prop.value = true
    expect(open.value).toBe(true)
  })

  it('переход controlled → uncontrolled сохраняет работоспособность', () => {
    const prop = ref<boolean | undefined>(true)
    const onChange = vi.fn()
    const { open, setOpen } = useControlledOpen(() => prop.value, onChange)

    expect(open.value).toBe(true)

    prop.value = undefined
    // Внутреннее состояние стартует закрытым — как у нового uncontrolled.
    expect(open.value).toBe(false)

    setOpen(true)
    expect(open.value).toBe(true)
  })
})
