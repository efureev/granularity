import { describe, expect, it } from 'vitest'

import {
  coreResponseErrorParsers,
  createResponseErrorClassifier,
  extendDefaultParsers,
  normalizeError,
} from '../parsers'

/**
 * Цепочка парсеров — чистая логика, поэтому тестируется напрямую, без
 * монтирования банера: так проверяется то, что действительно сложно (порядок
 * парсеров, приоритеты, нормализация транспорта), а не рендер трёх абзацев.
 */

const classify = createResponseErrorClassifier()

describe('normalizeError: транспорт отделён от классификации', () => {
  it('axios-подобная ошибка отдаёт статус и тело', async () => {
    const normalized = await normalizeError({
      isAxiosError: true,
      response: { status: 422, data: { message: 'Ошибка' }, headers: {} },
    })

    expect(normalized.status).toBe(422)
    expect(normalized.body).toEqual({ message: 'Ошибка' })
  })

  it('fetch TypeError распознаётся как сетевая ошибка', async () => {
    const normalized = await normalizeError(new TypeError('Failed to fetch'))

    expect(normalized.isNetwork).toBe(true)
  })

  it('отмена запроса помечается как abort', async () => {
    const normalized = await normalizeError(new DOMException('aborted', 'AbortError'))

    expect(normalized.isAbort).toBe(true)
  })

  it('fetch Response читается через клон тела', async () => {
    const response = new Response(JSON.stringify({ message: 'Нет доступа' }), {
      status: 403,
      headers: { 'content-type': 'application/json' },
    })

    const normalized = await normalizeError(response)

    expect(normalized.status).toBe(403)
    expect(normalized.body).toEqual({ message: 'Нет доступа' })
  })
})

describe('классификация: порядок парсеров и приоритеты', () => {
  it('laravel-формат даёт kind=validation и разбирает поля', async () => {
    const info = await classify({
      isAxiosError: true,
      response: {
        status: 422,
        headers: {},
        data: {
          message: 'Данные неверны',
          errors: { email: ['Неверный e-mail'], amount: 'Слишком мало' },
        },
      },
    })

    expect(info.kind).toBe('validation')
    expect(info.message).toBe('Данные неверны')
    expect(info.fieldErrors?.map(f => f.field).sort()).toEqual(['amount', 'email'])
    // Строковое значение поля нормализуется в массив сообщений.
    expect(info.fieldErrors?.find(f => f.field === 'amount')?.messages).toEqual(['Слишком мало'])
  })

  it('validation побеждает статус: поля важнее кода ответа', async () => {
    // Сервер прислал 200, но с полями ошибок — kind обязан стать validation.
    // `raw` в объекте — признак уже нормализованного входа (см. normalizeError).
    const info = await classify({ raw: null, status: 200, body: { errors: { name: ['Занято'] } } })

    expect(info.kind).toBe('validation')
  })

  it('отмена останавливает цепочку', async () => {
    const info = await classify(new DOMException('aborted', 'AbortError'))

    expect(info.kind).toBe('aborted')
  })

  it('сетевая ошибка отличается от серверной', async () => {
    const info = await classify(new TypeError('Failed to fetch'))

    expect(info.kind).toBe('network')
    expect(info.status).toBeUndefined()
  })

  it('голый HTTP-статус без тела даёт осмысленный kind и сообщение', async () => {
    const info = await classify({ raw: null, status: 503, body: undefined })

    expect(info.status).toBe(503)
    expect(info.kind).toBe('server')
    expect(info.message, 'сообщение обязано быть, даже когда тело пустое').toBeTruthy()
  })

  it('4xx и 5xx разводятся на client и server', async () => {
    // Шкала `kind` намеренно грубая: она управляет тоном баннера, а не текстом.
    // Точный статус остаётся в `info.status`.
    expect((await classify({ raw: null, status: 401, body: undefined })).kind).toBe('client')
    expect((await classify({ raw: null, status: 404, body: undefined })).kind).toBe('client')
    expect((await classify({ raw: null, status: 500, body: undefined })).kind).toBe('server')
  })

  it('неизвестный вход не роняет классификацию и даёт kind=unknown', async () => {
    const info = await classify({ что: 'то странное' })

    expect(info.kind).toBe('unknown')
    expect(info.message).toBeTruthy()
  })

  it('raw и meta пробрасываются в результат без изменений', async () => {
    const raw = new Error('оригинал')
    const info = await classify(raw, { requestId: 'abc' })

    expect(info.raw).toBe(raw)
    expect(info.meta).toEqual({ requestId: 'abc' })
  })
})

describe('состав цепочки настраивается', () => {
  it('core-набор не разбирает laravel-поля', async () => {
    const classifyCore = createResponseErrorClassifier({ parsers: coreResponseErrorParsers })

    const info = await classifyCore({ raw: null, status: 422, body: { errors: { email: ['Неверный'] } } })

    // Ядро намеренно не делает формат-специфичных допущений о бэкенде.
    expect(info.fieldErrors).toBeUndefined()
  })

  it('свой парсер имеет приоритет над дефолтными', async () => {
    const classifyCustom = createResponseErrorClassifier({
      // `extendDefaultParsers` ставит переданные парсеры ПЕРЕД дефолтными.
      parsers: extendDefaultParsers([
        ctx => (ctx.status === 418 ? { kind: 'server', message: 'Я чайник', stop: true } : null),
      ]),
    })

    const info = await classifyCustom({ raw: null, status: 418, body: { message: 'из тела' } })

    expect(info.message).toBe('Я чайник')
  })

  it('тексты по умолчанию переопределяются', async () => {
    const classifyRu = createResponseErrorClassifier({ texts: { networkMessage: 'Нет сети' } })

    expect((await classifyRu(new TypeError('Failed to fetch'))).message).toBe('Нет сети')
  })
})
