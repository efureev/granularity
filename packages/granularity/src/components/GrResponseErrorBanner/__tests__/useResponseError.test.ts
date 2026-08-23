import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { useResponseError } from '../useResponseError'
import type { ResponseErrorInfo, ResponseErrorKind, ResponseErrorParser } from '../responseError.types'

/**
 * Композабл — это состояние вокруг классификатора: что попало в `currentError`,
 * что осталось скрытым и что вернулось вызывающему. Классификация как таковая
 * проверяется в `responseErrorClassifier.test.ts`.
 */
describe('useResponseError', () => {
  it('setRaw классифицирует, сохраняет состояние и возвращает info', async () => {
    const { currentError, isVisible, lastRaw, setRaw } = useResponseError()

    const raw = { response: undefined, isAxiosError: true, code: 'ERR_NETWORK' }
    const info = await setRaw(raw)

    expect(info?.kind).toBe('network')
    expect(currentError.value?.kind).toBe('network')
    expect(isVisible.value).toBe(true)
    expect(lastRaw.value).toBe(raw)
  })

  it('autoHideKinds оставляет состояние пустым и возвращает null', async () => {
    const hidden = ref<ResponseErrorKind[]>(['aborted'])
    const { currentError, isVisible, setRaw } = useResponseError({
      autoHideKinds: () => hidden.value,
    })

    const abort = Object.assign(new Error('cancelled'), { name: 'AbortError' })
    expect(await setRaw(abort)).toBeNull()
    expect(currentError.value).toBeNull()
    expect(isVisible.value).toBe(false)

    // Опции — геттеры, поэтому смена списка действует сразу, без пересоздания.
    hidden.value = []
    expect((await setRaw(abort))?.kind).toBe('aborted')
    expect(currentError.value?.kind).toBe('aborted')
  })

  it('classify не трогает состояние — это предпросмотр', async () => {
    const { currentError, classify } = useResponseError()

    expect((await classify('Boom')).message).toBe('Boom')
    expect(currentError.value).toBeNull()
  })

  it('onClassify зовётся и для setRaw, и для classify', async () => {
    const onClassify = vi.fn()
    const { classify, setRaw } = useResponseError({ onClassify })

    await classify('one')
    await setRaw('two')

    expect(onClassify).toHaveBeenCalledTimes(2)
    expect(onClassify.mock.calls[1][0]).toMatchObject({ message: 'two' })
  })

  it('meta из опций сливается с meta вызова, вызов сильнее', async () => {
    const { classify } = useResponseError({ meta: () => ({ formId: 'signup', scope: 'options' }) })

    const info = await classify('Boom', { scope: 'call' })

    expect(info.meta).toMatchObject({ formId: 'signup', scope: 'call' })
  })

  it('свои парсеры и messageKey читаются из геттеров', async () => {
    const custom: ResponseErrorParser = ctx =>
      (ctx.status === 418 ? { kind: 'client', message: 'I am a teapot', stop: true } : null)

    const parsers = ref<ResponseErrorParser[]>([custom])
    const messageKey = ref('detail')
    const { classify } = useResponseError({
      parsers: () => parsers.value,
      messageKey: () => messageKey.value,
    })

    expect(await classify({ status: 418, raw: null })).toMatchObject({ message: 'I am a teapot' })

    // Своя цепочка не содержит plainMessage — сообщение станет фолбэком.
    const fallback = await classify({ status: 500, body: { detail: 'ignored' }, raw: null })
    expect(fallback.isFallbackMessage).toBe(true)
  })

  it('texts из опций подменяют дефолтные сообщения классификатора', async () => {
    const { classify } = useResponseError({
      texts: () => ({ serverMessage: 'Сервер прилёг' }),
    })

    expect(await classify({ status: 500, raw: null })).toMatchObject({ message: 'Сервер прилёг' })
  })

  it('setError кладёт готовый info мимо парсеров, dismiss/reset очищают', async () => {
    const { currentError, dismiss, reset, setError } = useResponseError()
    const info: ResponseErrorInfo = { kind: 'server', message: 'Уже разобрано', raw: null }

    setError(info)
    expect(currentError.value).toBe(info)

    dismiss()
    expect(currentError.value).toBeNull()

    setError(info)
    reset()
    expect(currentError.value).toBeNull()
  })

  it('retry сбрасывает состояние только при успешном обработчике', async () => {
    const { currentError, retry, setRaw } = useResponseError()
    await setRaw({ status: 500, raw: null })

    await expect(retry(async () => {
      throw new Error('again down')
    })).rejects.toThrow('again down')
    expect(currentError.value?.kind).toBe('server')

    await retry(() => {})
    expect(currentError.value).toBeNull()
  })

  it('retry без ошибки в состоянии ничего не вызывает', async () => {
    const handler = vi.fn()
    const { retry } = useResponseError()

    await retry(handler)

    expect(handler).not.toHaveBeenCalled()
  })
})
