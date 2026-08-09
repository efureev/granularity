import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import GrAutocomplete from '../GrAutocomplete.vue'

/**
 * `fetchOptions`: запрос под управлением компонента. Проверяется то, ради чего
 * проп заведён, — устаревший ответ не побеждает свежий.
 */

afterEach(() => {
  document.body.innerHTML = ''
  vi.useRealTimers()
})

type Deferred = {
  promise: Promise<{ value: string, label: string }[]>
  resolve: (options: { value: string, label: string }[]) => void
  reject: (error: unknown) => void
}

function deferred(): Deferred {
  let resolve!: Deferred['resolve']
  let reject!: Deferred['reject']
  const promise = new Promise<{ value: string, label: string }[]>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function renderedOptions(): string[] {
  return [...document.querySelectorAll('[data-gr-autocomplete-option]')].map(el => el.textContent.trim())
}

describe('GrAutocomplete — fetchOptions', () => {
  it('ответ устаревшего запроса не перебивает последний', async () => {
    vi.useFakeTimers()

    const first = deferred()
    const second = deferred()
    const calls: string[] = []
    const signals: AbortSignal[] = []

    const wrapper = mount(GrAutocomplete, {
      props: {
        modelValue: '',
        debounce: 10,
        ariaLabel: 'People',
        fetchOptions: (query: string, signal: AbortSignal) => {
          calls.push(query)
          signals.push(signal)
          return calls.length === 1 ? first.promise : second.promise
        },
      },
      attachTo: document.body,
    })

    const input = wrapper.get('input')
    await input.setValue('an')
    vi.advanceTimersByTime(10)
    await input.setValue('ann')
    vi.advanceTimersByTime(10)

    expect(calls).toEqual(['an', 'ann'])
    // Устаревший запрос отменён — приложению есть что отдать в `fetch`.
    expect(signals[0].aborted).toBe(true)
    expect(signals[1].aborted).toBe(false)

    second.resolve([{ value: 'anna', label: 'Anna' }])
    await nextTick()
    await nextTick()

    // Ответ первого запроса приходит последним — и обязан проиграть.
    first.resolve([{ value: 'andrew', label: 'Andrew' }])
    await nextTick()
    await nextTick()

    expect(renderedOptions()).toEqual(['Anna'])

    wrapper.unmount()
  })

  it('держит собственный `loading`, пока запрос в полёте', async () => {
    vi.useFakeTimers()
    const pending = deferred()

    const wrapper = mount(GrAutocomplete, {
      props: {
        modelValue: '',
        debounce: 10,
        ariaLabel: 'People',
        fetchOptions: () => pending.promise,
      },
      attachTo: document.body,
    })

    const input = wrapper.get('input')
    await input.setValue('an')
    vi.advanceTimersByTime(10)
    await nextTick()

    expect(document.querySelector('[data-gr-autocomplete-loading]')).toBeTruthy()

    pending.resolve([{ value: 'anna', label: 'Anna' }])
    await nextTick()
    await nextTick()

    expect(document.querySelector('[data-gr-autocomplete-loading]')).toBeNull()

    wrapper.unmount()
  })

  it('ошибка запроса уходит событием и показывает пустой результат', async () => {
    vi.useFakeTimers()
    const failing = deferred()

    const wrapper = mount(GrAutocomplete, {
      props: {
        modelValue: '',
        debounce: 10,
        ariaLabel: 'People',
        fetchOptions: () => failing.promise,
      },
      attachTo: document.body,
    })

    const input = wrapper.get('input')
    await input.setValue('an')
    vi.advanceTimersByTime(10)

    const error = new Error('network down')
    failing.reject(error)
    await nextTick()
    await nextTick()

    expect(wrapper.emitted('searchError')?.at(-1)).toEqual([error])
    expect(document.querySelector('[data-gr-autocomplete-empty]')).toBeTruthy()

    wrapper.unmount()
  })

  it('смена стартового списка отменяет летящий запрос, а не ждёт его', async () => {
    vi.useFakeTimers()
    const pending = deferred()

    const wrapper = mount(GrAutocomplete, {
      props: {
        modelValue: '',
        options: [{ value: 'start', label: 'Start' }],
        debounce: 10,
        ariaLabel: 'People',
        fetchOptions: () => pending.promise,
      },
      attachTo: document.body,
    })

    const input = wrapper.get('input')
    await input.setValue('an')
    vi.advanceTimersByTime(10)
    await nextTick()
    expect(document.querySelector('[data-gr-autocomplete-loading]')).toBeTruthy()

    await wrapper.setProps({ options: [{ value: 'fresh', label: 'Fresh' }] })
    await nextTick()

    // Ответ на прежний контекст данных больше не ждут: ни спиннера, ни права
    // перезаписать новый стартовый список.
    expect(document.querySelector('[data-gr-autocomplete-loading]')).toBeNull()

    pending.resolve([{ value: 'stale', label: 'Stale' }])
    await nextTick()
    await nextTick()

    expect(renderedOptions()).toEqual(['Fresh'])

    wrapper.unmount()
  })

  it('отмена при размонтировании не роняет обработчик', async () => {
    vi.useFakeTimers()
    const pending = deferred()
    const abortError = new Error('aborted')
    abortError.name = 'AbortError'

    const wrapper = mount(GrAutocomplete, {
      props: {
        modelValue: '',
        debounce: 10,
        ariaLabel: 'People',
        fetchOptions: () => pending.promise,
      },
      attachTo: document.body,
    })

    await wrapper.get('input').setValue('an')
    vi.advanceTimersByTime(10)
    wrapper.unmount()

    pending.reject(abortError)
    await nextTick()

    expect(wrapper.emitted('searchError')).toBeUndefined()
  })
})
