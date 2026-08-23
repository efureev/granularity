import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import GrCodeScanner from '../GrCodeScanner.vue'
import type { GrCodeResult } from '../codeDetection'

const FRAME = { width: 1280, height: 720 }

function makeStream() {
  const stop = vi.fn()

  return { stream: { getTracks: () => [{ stop }] } as unknown as MediaStream, stop }
}

function stubMediaDevices(getUserMedia: () => Promise<MediaStream>) {
  Object.defineProperty(globalThis.navigator, 'mediaDevices', { configurable: true, value: { getUserMedia } })
}

beforeEach(() => {
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(HTMLVideoElement.prototype, 'videoWidth', { configurable: true, get: () => FRAME.width })
  Object.defineProperty(HTMLVideoElement.prototype, 'videoHeight', { configurable: true, get: () => FRAME.height })
  // В jsdom нативного `BarcodeDetector` нет — как в Safari и Firefox.
  delete (globalThis as { BarcodeDetector?: unknown }).BarcodeDetector
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

const QR: GrCodeResult = { value: 'https://example.com', format: 'qr_code' }

describe('GrCodeScanner', () => {
  it('без нативного API и без детектора честно говорит, что читать нечем', async () => {
    const wrapper = mount(GrCodeScanner)
    await nextTick()

    // «Включите камеру» тут отправило бы пользователя решать не ту задачу.
    expect(wrapper.text()).toContain('detector')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('детектор из пропа заменяет отсутствующий нативный', async () => {
    vi.useFakeTimers()
    const { stream } = makeStream()
    stubMediaDevices(vi.fn().mockResolvedValue(stream) as never)
    const detector = vi.fn().mockResolvedValue([QR])

    const wrapper = mount(GrCodeScanner, { props: { autoStart: true, detector, interval: 50 } })
    await vi.waitFor(() => expect(wrapper.emitted('start')).toBeTruthy())

    await vi.advanceTimersByTimeAsync(60)

    expect(detector).toHaveBeenCalled()
    expect(wrapper.emitted('detect')?.[0]?.[0]).toEqual([QR])
  })

  it('один код в кадре не сообщается на каждом кадре', async () => {
    vi.useFakeTimers()
    const { stream } = makeStream()
    stubMediaDevices(vi.fn().mockResolvedValue(stream) as never)
    const detector = vi.fn().mockResolvedValue([QR])

    const wrapper = mount(GrCodeScanner, { props: { autoStart: true, detector, interval: 20 } })
    await vi.waitFor(() => expect(wrapper.emitted('start')).toBeTruthy())

    await vi.advanceTimersByTimeAsync(200)

    // Кадров прошло много, событие одно: иначе оформилось бы двадцать заказов.
    expect(detector.mock.calls.length).toBeGreaterThan(3)
    expect(wrapper.emitted('detect')).toHaveLength(1)
  })

  it('в непрерывном режиме тот же код сообщается снова', async () => {
    vi.useFakeTimers()
    const { stream } = makeStream()
    stubMediaDevices(vi.fn().mockResolvedValue(stream) as never)
    const detector = vi.fn().mockResolvedValue([QR])

    const wrapper = mount(GrCodeScanner, { props: { autoStart: true, detector, interval: 20, continuous: true } })
    await vi.waitFor(() => expect(wrapper.emitted('start')).toBeTruthy())

    await vi.advanceTimersByTimeAsync(200)

    expect((wrapper.emitted('detect') ?? []).length).toBeGreaterThan(1)
  })

  it('сбой разбора кадра не роняет сканирование', async () => {
    vi.useFakeTimers()
    const { stream } = makeStream()
    stubMediaDevices(vi.fn().mockResolvedValue(stream) as never)
    const detector = vi.fn()
      .mockRejectedValueOnce(new Error('размытый кадр'))
      .mockResolvedValue([QR])

    const wrapper = mount(GrCodeScanner, { props: { autoStart: true, detector, interval: 20 } })
    await vi.waitFor(() => expect(wrapper.emitted('start')).toBeTruthy())

    await vi.advanceTimersByTimeAsync(120)

    // В объектив попала рука — это норма, а не повод остановиться.
    expect(wrapper.emitted('detect')?.[0]?.[0]).toEqual([QR])
  })

  it('остановка гасит и поток, и разбор кадров', async () => {
    vi.useFakeTimers()
    const { stream, stop } = makeStream()
    stubMediaDevices(vi.fn().mockResolvedValue(stream) as never)
    const detector = vi.fn().mockResolvedValue([])

    const wrapper = mount(GrCodeScanner, { props: { autoStart: true, detector, interval: 20 } })
    await vi.waitFor(() => expect(wrapper.emitted('start')).toBeTruthy())
    await vi.advanceTimersByTimeAsync(60)

    ;(wrapper.vm as unknown as { stop: () => void }).stop()
    const callsAfterStop = detector.mock.calls.length
    await vi.advanceTimersByTimeAsync(200)

    expect(stop).toHaveBeenCalledTimes(1)
    expect(detector.mock.calls.length).toBe(callsAfterStop)
  })

  it('размонтирование гасит разбор кадров, а не только поток', async () => {
    vi.useFakeTimers()
    const { stream } = makeStream()
    stubMediaDevices(vi.fn().mockResolvedValue(stream) as never)
    const detector = vi.fn().mockResolvedValue([])

    const wrapper = mount(GrCodeScanner, { props: { autoStart: true, detector, interval: 20 } })
    await vi.waitFor(() => expect(wrapper.emitted('start')).toBeTruthy())
    await vi.advanceTimersByTimeAsync(60)

    const live = vi.getTimerCount()
    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(200)

    // Считается именно таймер, а не вызовы детектора: после размонтирования
    // ссылки на `<video>` нет, и разбор кадра выходит рано сам — но цикл
    // продолжал бы планировать себя вечно, то есть течь. Сравнение
    // относительное: в окружении крутятся и посторонние таймеры.
    expect(vi.getTimerCount()).toBeLessThan(live)
  })

  it('разбор, завершившийся после остановки, не перезапускает цикл', async () => {
    vi.useFakeTimers()
    const { stream } = makeStream()
    stubMediaDevices(vi.fn().mockResolvedValue(stream) as never)

    let release: ((codes: GrCodeResult[]) => void) | null = null
    const detector = vi.fn(async () => new Promise<GrCodeResult[]>((resolve) => {
      release = resolve
    }))

    const wrapper = mount(GrCodeScanner, { props: { autoStart: true, detector, interval: 20 } })
    await vi.waitFor(() => expect(wrapper.emitted('start')).toBeTruthy())
    // Кадр ушёл в разбор и висит в `await`.
    await vi.advanceTimersByTimeAsync(25)
    await vi.waitFor(() => expect(release).not.toBeNull())

    // Пока разбор висит, своего таймера у цикла нет — он уже отработал.
    const idle = vi.getTimerCount()
    wrapper.unmount()
    // …и разбор возвращается уже после размонтирования: одного `clearTimeout`
    // мало, такой заход запланировал бы следующий и пережил бы страницу.
    release!([])
    await vi.advanceTimersByTimeAsync(100)

    expect(vi.getTimerCount()).toBeLessThanOrEqual(idle)
  })

  it('сканирует тыловой камерой: ей наводят на код', async () => {
    const { stream } = makeStream()
    const getUserMedia = vi.fn().mockResolvedValue(stream)
    stubMediaDevices(getUserMedia as never)

    const wrapper = mount(GrCodeScanner, { props: { autoStart: true, detector: vi.fn().mockResolvedValue([]) } })
    await vi.waitFor(() => expect(wrapper.emitted('start')).toBeTruthy())

    expect(getUserMedia).toHaveBeenCalledWith({ video: { facingMode: 'environment' }, audio: false })
  })
})
