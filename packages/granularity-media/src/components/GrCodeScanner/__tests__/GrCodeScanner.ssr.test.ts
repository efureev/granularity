import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'

import GrCodeScanner from '../GrCodeScanner.vue'
import type { GrCameraStatus } from '../index'

/**
 * Первый рендер одинаков на сервере и в браузере.
 *
 * Решение «нативного `BarcodeDetector` нет» принималось в рендере: на сервере
 * его нет никогда, и сервер писал «не умеет читать коды» без кнопки, а Chrome —
 * «камера выключена» с кнопкой. Гидрация расходилась на каждой странице со
 * сканером, а до неё мелькало ложное сообщение.
 */
const BARCODE = (globalThis as { BarcodeDetector?: unknown }).BarcodeDetector

beforeEach(() => {
  delete (globalThis as { BarcodeDetector?: unknown }).BarcodeDetector
})

afterEach(() => {
  if (BARCODE)
    (globalThis as { BarcodeDetector?: unknown }).BarcodeDetector = BARCODE
  else
    delete (globalThis as { BarcodeDetector?: unknown }).BarcodeDetector
  vi.restoreAllMocks()
})

describe('GrCodeScanner: серверный рендер и гидрация', () => {
  it('разметка сервера без `BarcodeDetector` совпадает с первым рендером браузера с ним', async () => {
    const server = await renderToString(createSSRApp({ render: () => h(GrCodeScanner) }))

    // В браузере детектор есть — первый рендер обязан быть тем же.
    ;(globalThis as { BarcodeDetector?: unknown }).BarcodeDetector = class {}

    const container = document.createElement('div')
    container.innerHTML = server
    document.body.append(container)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    createSSRApp({ render: () => h(GrCodeScanner) }).mount(container)
    await nextTick()

    const mismatches = [...warn.mock.calls, ...error.mock.calls].map(call => String(call[0])).filter(message => /hydration/i.test(message))

    expect(mismatches).toEqual([])
    expect(server).not.toContain('cannot read codes')
    container.remove()
  })

  it('«не умеет читать коды» появляется после монтирования — там, где это правда', async () => {
    const wrapper = mount(GrCodeScanner)
    await nextTick()

    expect(wrapper.text()).toContain('cannot read codes')
    wrapper.unmount()
  })
})

describe('GrCodeScanner: слот `#controls`', () => {
  it('со своим слотом встроенной кнопки «Начать» в рамке нет', async () => {
    ;(globalThis as { BarcodeDetector?: unknown }).BarcodeDetector = class {}

    const wrapper = mount(GrCodeScanner, {
      slots: {
        controls: ({ start }: { status: GrCameraStatus, start: () => void }) => h('button', { 'data-own-start': '', 'onClick': start }, 'Сканировать'),
      },
    })
    await nextTick()

    expect(wrapper.findAll('button')).toHaveLength(1)
    expect(wrapper.find('[data-own-start]').exists()).toBe(true)
    // Текст состояния остаётся: слот забирает действия, а не объяснение.
    expect(wrapper.text()).toContain('camera')
    wrapper.unmount()
  })

  it('без слота кнопка в рамке на месте', async () => {
    ;(globalThis as { BarcodeDetector?: unknown }).BarcodeDetector = class {}

    const wrapper = mount(GrCodeScanner)
    await nextTick()

    expect(wrapper.text()).toContain('Start scanning')
    wrapper.unmount()
  })
})
