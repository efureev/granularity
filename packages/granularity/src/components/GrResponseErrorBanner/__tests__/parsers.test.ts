import { describe, expect, it } from 'vitest'

import {
  abortErrorParser,
  fileValidationParser,
  httpStatusParser,
  jsonApiErrorParser,
  laravelValidationParser,
  networkErrorParser,
  plainMessageParser,
  problemDetailsParser,
} from '../parsers'
import { DEFAULT_RESPONSE_ERROR_TEXTS } from '../responseError.defaults'
import type { ResponseErrorContext } from '../responseError.types'

/**
 * Парсеры — чистые функции от `ResponseErrorContext`, поэтому проверяются
 * таблицей «вход → kind/message/status/details/fieldErrors/stop» без
 * монтирования и без классификатора: тот проверяется отдельно, на порядке
 * цепочки.
 */
function ctx(partial: Partial<ResponseErrorContext> = {}): ResponseErrorContext {
  return {
    raw: partial.raw ?? null,
    status: partial.status,
    body: partial.body,
    headers: partial.headers,
    isAbort: partial.isAbort,
    isNetwork: partial.isNetwork,
    meta: partial.meta ?? {},
    texts: partial.texts ?? DEFAULT_RESPONSE_ERROR_TEXTS,
  }
}

describe('httpStatusParser', () => {
  it.each([
    [500, 'server'],
    [503, 'server'],
    [400, 'validation'],
    [422, 'validation'],
    [401, 'client'],
    [404, 'client'],
    [429, 'client'],
  ])('статус %i даёт kind=%s', (status, kind) => {
    expect(httpStatusParser(ctx({ status }))).toMatchObject({ kind, status })
  })

  it('успешные и отсутствующие статусы не трогает — это не его дело', () => {
    expect(httpStatusParser(ctx({ status: 200 }))).toBeNull()
    expect(httpStatusParser(ctx())).toBeNull()
  })

  it('не ставит stop: специализированные парсеры должны уточнить сообщение', () => {
    expect(httpStatusParser(ctx({ status: 422 }))?.stop).toBeUndefined()
  })
})

describe('abortErrorParser', () => {
  it('отмена останавливает цепочку, чтобы status=0 не выглядел сетью', () => {
    expect(abortErrorParser(ctx({ isAbort: true }))).toMatchObject({
      kind: 'aborted',
      stop: true,
    })
  })

  it('без признака отмены молчит', () => {
    expect(abortErrorParser(ctx({ status: 500 }))).toBeNull()
  })
})

describe('networkErrorParser', () => {
  it('явный признак сети даёт kind=network со stop', () => {
    expect(networkErrorParser(ctx({ isNetwork: true }))).toMatchObject({
      kind: 'network',
      stop: true,
    })
  })

  it('отмена сильнее: сначала abort, сеть молчит', () => {
    expect(networkErrorParser(ctx({ isAbort: true, isNetwork: true }))).toBeNull()
  })

  it('эвристика по коду и тексту, когда нормализатор не пометил', () => {
    expect(networkErrorParser(ctx({ raw: { code: 'ERR_NETWORK' } }))).toMatchObject({ kind: 'network' })
    expect(networkErrorParser(ctx({ raw: { message: 'Failed to fetch' } }))).toMatchObject({ kind: 'network' })
  })

  it('при известном статусе эвристика не срабатывает: ответ от сервера был', () => {
    expect(networkErrorParser(ctx({ status: 500, raw: { message: 'network trouble' } }))).toBeNull()
  })
})

describe('laravelValidationParser', () => {
  it('раскладывает errors по полям и поднимает kind до validation', () => {
    const result = laravelValidationParser(ctx({
      status: 200,
      body: {
        message: 'The given data was invalid.',
        errors: { email: ['Email is required.'], amount: 'Too small.' },
      },
    }))

    expect(result).toMatchObject({
      kind: 'validation',
      message: 'The given data was invalid.',
      fieldErrors: [
        { field: 'email', messages: ['Email is required.'] },
        { field: 'amount', messages: ['Too small.'] },
      ],
      details: ['Email is required.', 'Too small.'],
    })
  })

  it('пустой errors — не его случай', () => {
    expect(laravelValidationParser(ctx({ body: { errors: {} } }))).toBeNull()
    expect(laravelValidationParser(ctx({ body: { errors: { email: [] } } }))).toBeNull()
  })

  it('массив errors — это JSON:API, а не Laravel', () => {
    expect(laravelValidationParser(ctx({ body: { errors: [{ title: 'x' }] } }))).toBeNull()
  })

  it('без message берёт error, а совсем без текста сообщения не выдумывает', () => {
    expect(laravelValidationParser(ctx({ body: { error: 'Bad input', errors: { a: ['x'] } } })))
      .toMatchObject({ message: 'Bad input' })

    // Общий текст по `kind` подставит классификатор и пометит его фолбэком —
    // иначе баннер не смог бы заменить его переводом.
    expect(laravelValidationParser(ctx({ body: { errors: { a: ['x'] } } }))?.message).toBeUndefined()
  })
})

describe('jsonApiErrorParser', () => {
  it('собирает поля из source.pointer и details из detail', () => {
    const result = jsonApiErrorParser(ctx({
      body: {
        errors: [
          {
            status: '422',
            title: 'Invalid Attribute',
            detail: 'Email is required.',
            source: { pointer: '/data/attributes/email' },
          },
          {
            title: 'Invalid Attribute',
            detail: 'Name is too short.',
            source: { pointer: '/data/attributes/name' },
          },
        ],
      },
    }))

    expect(result).toMatchObject({
      kind: 'validation',
      message: 'Invalid Attribute',
      details: ['Email is required.', 'Name is too short.'],
      fieldErrors: [
        { field: 'email', messages: ['Email is required.'] },
        { field: 'name', messages: ['Name is too short.'] },
      ],
    })
  })

  it('без pointer полей нет, и kind остаётся за статусом', () => {
    const result = jsonApiErrorParser(ctx({
      body: { errors: [{ title: 'Out of credit', detail: 'Balance is 30.' }] },
    }))

    expect(result?.kind).toBeUndefined()
    expect(result?.fieldErrors).toBeUndefined()
    expect(result).toMatchObject({ message: 'Out of credit', details: ['Balance is 30.'] })
  })

  it('чужие формы не трогает', () => {
    expect(jsonApiErrorParser(ctx({ body: { errors: { email: ['x'] } } }))).toBeNull()
    expect(jsonApiErrorParser(ctx({ body: { errors: [] } }))).toBeNull()
    // Массив без title/detail/source — не JSON:API.
    expect(jsonApiErrorParser(ctx({ body: { errors: [{ code: 'x' }] } }))).toBeNull()
  })
})

describe('problemDetailsParser', () => {
  it('title становится сообщением, detail — деталью, status берётся из тела', () => {
    expect(problemDetailsParser(ctx({
      status: 500,
      body: {
        type: 'https://example.com/probs/out-of-credit',
        title: 'You do not have enough credit.',
        status: 403,
        detail: 'Your current balance is 30.',
      },
    }))).toMatchObject({
      message: 'You do not have enough credit.',
      details: ['Your current balance is 30.'],
      status: 403,
    })
  })

  it('опознаётся и по content-type, когда формы недостаточно', () => {
    const result = problemDetailsParser(ctx({
      headers: { 'content-type': 'application/problem+json' },
      body: { detail: 'Something' },
      status: 409,
    }))

    expect(result).toMatchObject({ status: 409, details: ['Something'] })
    // `title` нет — сообщение остаётся за классификатором.
    expect(result?.message).toBeUndefined()
  })

  it('обычный JSON без type/status и без заголовка не его случай', () => {
    expect(problemDetailsParser(ctx({ body: { title: 'Just a title' } }))).toBeNull()
    expect(problemDetailsParser(ctx({ body: 'plain text' }))).toBeNull()
  })
})

describe('fileValidationParser', () => {
  it('клиентская валидация файлов останавливает цепочку', () => {
    const raw = {
      name: 'FileValidationError',
      message: 'Files are invalid',
      issues: [
        { file: { name: 'a.pdf' }, message: 'Too large' },
        { message: 'Unsupported type' },
      ],
    }

    expect(fileValidationParser(ctx({ raw }))).toMatchObject({
      kind: 'validation',
      message: 'Files are invalid',
      details: ['a.pdf: Too large', 'Unsupported type'],
      stop: true,
    })
  })

  it('читает и errors вместо issues, а без сообщений ничего не выдумывает', () => {
    const result = fileValidationParser(ctx({
      raw: { name: 'FileValidationError', errors: [{ code: 'too-large' }] },
    }))

    expect(result).toMatchObject({ kind: 'validation', details: undefined, stop: true })
    expect(result?.message).toBeUndefined()
  })

  it('чужие ошибки пропускает: опознание строго по name', () => {
    expect(fileValidationParser(ctx({ raw: new Error('Too large') }))).toBeNull()
  })
})

describe('plainMessageParser', () => {
  it('строковое тело — это и есть сообщение', () => {
    expect(plainMessageParser(ctx({ body: 'Everything exploded' }))).toMatchObject({
      message: 'Everything exploded',
    })
  })

  it('ключ сообщения настраивается через meta._messageKey', () => {
    expect(plainMessageParser(ctx({
      body: { detail: 'Custom key wins' },
      meta: { _messageKey: 'detail' },
    }))).toMatchObject({ message: 'Custom key wins' })
  })

  it('порядок источников: message → error → Error.message', () => {
    expect(plainMessageParser(ctx({ body: { message: 'from message', error: 'from error' } })))
      .toMatchObject({ message: 'from message' })

    expect(plainMessageParser(ctx({ body: { error: 'from error' } })))
      .toMatchObject({ message: 'from error' })

    expect(plainMessageParser(ctx({ raw: new Error('from Error') })))
      .toMatchObject({ message: 'from Error' })
  })

  it('сообщение транспортной ошибки не выдаётся за ответ сервера', () => {
    // `Request failed with status 500` — строка axios, а не текст сервера.
    // При пустом теле пользователь должен увидеть переведённый текст по `kind`,
    // а не техническую фразу на английском.
    const axiosLike = new Error('Request failed with status 500')

    expect(plainMessageParser(ctx({ status: 500, raw: axiosLike }))).toBeNull()
    expect(plainMessageParser(ctx({ body: {}, raw: axiosLike }))).toBeNull()

    // Ответа не было вовсе — сообщение ошибки единственное, что есть.
    expect(plainMessageParser(ctx({ raw: axiosLike }))).toMatchObject({
      message: 'Request failed with status 500',
    })
  })

  it('kind не выставляет — это работа классификатора', () => {
    expect(plainMessageParser(ctx({ body: 'text' }))?.kind).toBeUndefined()
  })

  it('пустой вход оставляет решение следующим', () => {
    expect(plainMessageParser(ctx({ body: '   ' }))).toBeNull()
    expect(plainMessageParser(ctx({ body: { message: '' } }))).toBeNull()
    expect(plainMessageParser(ctx())).toBeNull()
  })
})

describe('generic-тексты по kind — работа классификатора, а не парсеров', () => {
  it('парсеры, знающие только тип ошибки, сообщения не заполняют', () => {
    // Иначе баннер не смог бы заменить их переводом: подмена идёт строго по
    // флагу `isFallbackMessage`, который ставит только классификатор.
    expect(httpStatusParser(ctx({ status: 500 }))?.message).toBeUndefined()
    expect(abortErrorParser(ctx({ isAbort: true }))?.message).toBeUndefined()
    expect(networkErrorParser(ctx({ isNetwork: true }))?.message).toBeUndefined()
  })
})
