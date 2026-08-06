import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createLoading, vLoading } from '../loading'

function mountHost(loading = ref<any>(false)) {
  const wrapper = mount(defineComponent({
    directives: { loading: vLoading },
    setup: () => ({ loading }),
    template: `
      <div class="host" v-loading="loading">
        <form data-testid="form"><input data-testid="input"></form>
        <p data-testid="note">рядом</p>
      </div>
    `,
  }), { attachTo: document.body })

  return { wrapper, loading }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('granularity/v-loading (unit)', () => {
  it('монтирует и снимает оверлей по значению биндинга', async () => {
    const { wrapper, loading } = mountHost()
    const host = wrapper.get('.host').element

    expect(host.querySelector('[data-gr-loading]')).toBeNull()

    loading.value = true
    await nextTick()
    expect(host.querySelector('[data-gr-loading]')).not.toBeNull()

    loading.value = false
    await nextTick()
    expect(host.querySelector('[data-gr-loading]')).toBeNull()
    expect(host.querySelector('[data-gr-loading-host]')).toBeNull()
  })

  it('блокирует контент под оверлеем и возвращает его в исходное состояние', async () => {
    const { wrapper, loading } = mountHost()
    const host = wrapper.get('.host').element
    const form = wrapper.get('[data-testid="form"]').element
    const note = wrapper.get('[data-testid="note"]').element

    loading.value = true
    await nextTick()

    expect(host.getAttribute('aria-busy')).toBe('true')
    expect(form.hasAttribute('inert')).toBe(true)
    expect(note.hasAttribute('inert')).toBe(true)
    // Сам оверлей блокировать нельзя — иначе `role="status"` не прочитается.
    expect(host.querySelector('[data-gr-loading-host]')!.hasAttribute('inert')).toBe(false)

    loading.value = false
    await nextTick()

    expect(host.hasAttribute('aria-busy')).toBe(false)
    expect(form.hasAttribute('inert')).toBe(false)
    expect(note.hasAttribute('inert')).toBe(false)
  })

  it('чужой `inert` не снимает', async () => {
    const { wrapper, loading } = mountHost()
    const note = wrapper.get('[data-testid="note"]').element
    note.setAttribute('inert', '')

    loading.value = true
    await nextTick()
    loading.value = false
    await nextTick()

    expect(note.hasAttribute('inert')).toBe(true)
  })

  it('уводит фокус из заблокированного поддерева и возвращает его при закрытии', async () => {
    const { wrapper, loading } = mountHost()
    const input = wrapper.get('[data-testid="input"]').element as HTMLInputElement

    input.focus()
    expect(document.activeElement).toBe(input)

    loading.value = true
    await nextTick()
    // Браузер фокус из ставшего инертным поддерева не забирает — это делаем мы.
    expect(document.activeElement).not.toBe(input)

    loading.value = false
    await nextTick()

    expect(document.activeElement).toBe(input)
  })

  it('не отбирает фокус, если пользователь увёл его сам', async () => {
    const { wrapper, loading } = mountHost()
    const input = wrapper.get('[data-testid="input"]').element as HTMLInputElement
    const outside = document.createElement('button')
    document.body.appendChild(outside)

    input.focus()
    loading.value = true
    await nextTick()

    outside.focus()
    loading.value = false
    await nextTick()

    expect(document.activeElement).toBe(outside)
  })

  it('с задержкой блокирует контент только вместе с показом оверлея', async () => {
    vi.useFakeTimers()
    try {
      const loading = ref<any>({ delay: 200 })
      const { wrapper } = mountHost(loading)
      const host = wrapper.get('.host').element
      const form = wrapper.get('[data-testid="form"]').element

      // Директива монтирует оверлей вручную (`render`), и его `onMounted` —
      // post-flush задача: до неё таймер задержки ещё не заведён.
      await nextTick()

      expect(form.hasAttribute('inert')).toBe(false)
      expect(host.hasAttribute('aria-busy')).toBe(false)

      vi.advanceTimersByTime(200)
      await nextTick()

      expect(host.querySelector('[data-gr-loading]')).not.toBeNull()
      expect(form.hasAttribute('inert')).toBe(true)
      expect(host.getAttribute('aria-busy')).toBe('true')
    }
    finally {
      vi.useRealTimers()
    }
  })

  it('createLoading без биндинга управляется контроллером', async () => {
    const target = document.createElement('div')
    target.innerHTML = '<p data-testid="content">контент</p>'
    document.body.appendChild(target)

    const controller = createLoading({ target, text: 'Секунду' })
    await nextTick()

    expect(controller.target).toBe(target)
    expect(target.textContent).toContain('Секунду')
    expect(target.querySelector('[data-testid="content"]')!.hasAttribute('inert')).toBe(true)

    controller.setText('Почти готово')
    await nextTick()
    expect(target.textContent).toContain('Почти готово')

    controller.close()
    expect(target.querySelector('[data-gr-loading]')).toBeNull()
    expect(target.querySelector('[data-testid="content"]')!.hasAttribute('inert')).toBe(false)
  })
})
