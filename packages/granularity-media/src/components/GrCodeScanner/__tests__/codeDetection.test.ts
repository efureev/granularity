import { describe, expect, it, vi } from 'vitest'

import { createNativeDetector, freshCodes, nativeDetectorSupported } from '../codeDetection'

function scopeWithDetector(detect: () => Promise<{ rawValue: string, format: string }[]>) {
  return {
    BarcodeDetector: class {
      constructor(public options?: { formats?: string[] }) {}
      detect = detect
    },
  } as unknown as typeof globalThis
}

describe('nativeDetectorSupported', () => {
  it('без `BarcodeDetector` нативного пути нет', () => {
    expect(nativeDetectorSupported({} as typeof globalThis)).toBe(false)
  })

  it('с ним — есть', () => {
    expect(nativeDetectorSupported(scopeWithDetector(async () => []))).toBe(true)
  })
})

describe('createNativeDetector', () => {
  it('без нативного API возвращает null, а не заглушку', () => {
    // Заглушка молча «ничего не находила» бы, и приложение решило бы, что кодов
    // в кадре нет, вместо того чтобы подключить свой детектор.
    expect(createNativeDetector(undefined, {} as typeof globalThis)).toBeNull()
  })

  it('переводит `rawValue` спецификации в наше `value`', async () => {
    const detect = vi.fn().mockResolvedValue([{ rawValue: 'https://example.com', format: 'qr_code' }])
    const detector = createNativeDetector(['qr_code'], scopeWithDetector(detect))

    expect(await detector!(document.createElement('canvas'))).toEqual([
      { value: 'https://example.com', format: 'qr_code' },
    ])
  })
})

describe('freshCodes', () => {
  const code = { value: '4600051000057', format: 'ean_13' }

  it('код из предыдущего кадра не сообщается повторно', () => {
    // Камера отдаёт десятки кадров в секунду: без фильтра приложение оформило
    // бы двадцать заказов вместо одного.
    expect(freshCodes([code], [code], false)).toEqual([])
  })

  it('новый код рядом со старым проходит', () => {
    const other = { value: '5901234123457', format: 'ean_13' }

    expect(freshCodes([code], [code, other], false)).toEqual([other])
  })

  it('одинаковое значение в разных символиках — разные коды', () => {
    const asQr = { value: code.value, format: 'qr_code' }

    expect(freshCodes([code], [asQr], false)).toEqual([asQr])
  })

  it('в непрерывном режиме повтор — законное второе событие', () => {
    expect(freshCodes([code], [code], true)).toEqual([code])
  })
})
