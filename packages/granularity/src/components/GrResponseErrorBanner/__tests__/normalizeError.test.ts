import { describe, expect, it } from 'vitest'

import { normalizeError } from '../parsers'

/**
 * `normalizeError` отвечает ровно за одно: свести axios / fetch / xhr / голый
 * `Error` / строку к общему виду, чтобы парсеры не знали о транспорте. Тесты
 * держат именно эту границу — классификация проверяется отдельно.
 */
describe('normalizeError — транспорт', () => {
  it('axios с ответом отдаёт статус, тело и заголовки в нижнем регистре', async () => {
    const raw = Object.assign(new Error('Request failed'), {
      isAxiosError: true,
      response: {
        status: 422,
        data: { message: 'Invalid' },
        headers: { 'Content-Type': 'application/json' },
      },
    })

    expect(await normalizeError(raw)).toMatchObject({
      status: 422,
      body: { message: 'Invalid' },
      headers: { 'content-type': 'application/json' },
    })
  })

  it('axios без ответа: ERR_NETWORK — сеть, ERR_CANCELED — отмена', async () => {
    const network = Object.assign(new Error('Network Error'), { isAxiosError: true, code: 'ERR_NETWORK' })
    const canceled = Object.assign(new Error('canceled'), { isAxiosError: true, code: 'ERR_CANCELED' })

    expect(await normalizeError(network)).toMatchObject({ isNetwork: true, isAbort: false })
    expect(await normalizeError(canceled)).toMatchObject({ isAbort: true })
  })

  it('fetch Response читается клоном: тело остаётся доступным потребителю', async () => {
    const response = new Response(JSON.stringify({ message: 'Nope' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })

    const normalized = await normalizeError(response)

    expect(normalized).toMatchObject({
      status: 403,
      body: { message: 'Nope' },
      headers: { 'content-type': 'application/json' },
    })
    expect(response.bodyUsed).toBe(false)
  })

  it('не-JSON тело остаётся строкой, а не превращается в undefined', async () => {
    const response = new Response('<html>500</html>', { status: 500 })

    expect(await normalizeError(response)).toMatchObject({
      status: 500,
      body: '<html>500</html>',
    })
  })

  it('конверт `{ response, body }` берётся как есть: тело уже прочитано', async () => {
    const response = new Response('', { status: 409 })
    const body = { message: 'Conflict' }

    expect(await normalizeError({ response, body })).toMatchObject({ status: 409, body })
  })

  it('fetch TypeError — сеть, AbortError — отмена', async () => {
    expect(await normalizeError(new TypeError('Failed to fetch'))).toMatchObject({ isNetwork: true })

    const abort = Object.assign(new Error('The user aborted a request.'), { name: 'AbortError' })
    expect(await normalizeError(abort)).toMatchObject({ isAbort: true })
  })

  it('обычный TypeError сетью не считается', async () => {
    expect(await normalizeError(new TypeError('x is not a function'))).toMatchObject({
      body: { message: 'x is not a function' },
    })
  })

  it('голый Error и строка кладутся в тело единообразно', async () => {
    expect(await normalizeError(new Error('Boom'))).toMatchObject({ body: { message: 'Boom' } })
    expect(await normalizeError('Boom')).toMatchObject({ body: { message: 'Boom' } })
  })

  it('уже нормализованный вход проходит насквозь', async () => {
    const prepared = { raw: 'original', status: 500, body: { message: 'kept' } }

    expect(await normalizeError(prepared)).toMatchObject({ status: 500, body: { message: 'kept' } })
  })

  it('null и undefined не роняют нормализацию', async () => {
    expect(await normalizeError(null)).toEqual({ raw: null })
    expect(await normalizeError(undefined)).toEqual({ raw: undefined })
  })

  it('произвольный объект становится телом', async () => {
    const raw = { errors: { email: ['required'] } }
    expect(await normalizeError(raw)).toMatchObject({ body: raw })
  })
})
