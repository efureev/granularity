import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import GrCameraCapture from '../GrCameraCapture.vue'

const FRAME = { width: 1280, height: 720 }

function makeStream() {
  const stop = vi.fn()
  const stream = { getTracks: () => [{ stop }] } as unknown as MediaStream

  return { stream, stop }
}

function stubMediaDevices(getUserMedia: () => Promise<MediaStream>) {
  Object.defineProperty(globalThis.navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia },
  })
}

function dropMediaDevices() {
  Object.defineProperty(globalThis.navigator, 'mediaDevices', {
    configurable: true,
    value: undefined,
  })
}

beforeEach(() => {
  // В jsdom у `<video>` нет ни воспроизведения, ни размеров кадра.
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(HTMLVideoElement.prototype, 'videoWidth', { configurable: true, get: () => FRAME.width })
  Object.defineProperty(HTMLVideoElement.prototype, 'videoHeight', { configurable: true, get: () => FRAME.height })
})

afterEach(() => {
  vi.restoreAllMocks()
})

function domError(name: string): Error {
  const error = new Error('camera')
  error.name = name

  return error
}

describe('GrCameraCapture', () => {
  it('без `autoStart` камера не включается сама', async () => {
    const getUserMedia = vi.fn()
    stubMediaDevices(getUserMedia as never)

    mount(GrCameraCapture)
    await nextTick()

    // Запрос разрешения без действия пользователя отклоняют не глядя, а второй
    // раз браузер уже не спросит.
    expect(getUserMedia).not.toHaveBeenCalled()
  })

  it('с `autoStart` включается и сообщает об этом', async () => {
    const { stream } = makeStream()
    stubMediaDevices(vi.fn().mockResolvedValue(stream) as never)

    const wrapper = mount(GrCameraCapture, { props: { autoStart: true } })
    await vi.waitFor(() => expect(wrapper.emitted('start')).toBeTruthy())

    expect(wrapper.emitted('statusChange')?.at(-1)?.[0]).toBe('live')
  })

  it('отказ пользователя и отсутствие камеры — разные состояния', async () => {
    stubMediaDevices(vi.fn().mockRejectedValue(domError('NotAllowedError')) as never)
    const denied = mount(GrCameraCapture, { props: { autoStart: true } })
    await vi.waitFor(() => expect(denied.emitted('statusChange')?.at(-1)?.[0]).toBe('denied'))

    stubMediaDevices(vi.fn().mockRejectedValue(domError('NotFoundError')) as never)
    const missing = mount(GrCameraCapture, { props: { autoStart: true } })
    await vi.waitFor(() => expect(missing.emitted('statusChange')?.at(-1)?.[0]).toBe('missing'))
  })

  it('без HTTPS не спрашивает разрешение вовсе', async () => {
    dropMediaDevices()

    const wrapper = mount(GrCameraCapture, { props: { autoStart: true } })
    await vi.waitFor(() => expect(wrapper.emitted('statusChange')?.at(-1)?.[0]).toBe('insecure'))
    // Настройки, в которую отправляет сообщение «разрешите доступ», тут нет.
    expect(wrapper.text()).toContain('HTTPS')
  })

  it('снимок берёт центральный кадр под заданное соотношение', async () => {
    const drawImage = vi.fn()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D)
    HTMLCanvasElement.prototype.toBlob = (callback: (blob: Blob | null) => void) => callback(new Blob())

    const { stream } = makeStream()
    stubMediaDevices(vi.fn().mockResolvedValue(stream) as never)

    const wrapper = mount(GrCameraCapture, { props: { autoStart: true, aspectRatio: 1 } })
    await vi.waitFor(() => expect(wrapper.emitted('start')).toBeTruthy())

    const blob = await (wrapper.vm as unknown as { capture: () => Promise<Blob | null> }).capture()

    expect(blob).toBeInstanceOf(Blob)
    expect(wrapper.emitted('capture')).toHaveLength(1)
    // Кадр камеры 1280×720, соотношение 1: центральный квадрат 720×720.
    const call = drawImage.mock.calls[0]!
    expect(call[3]).toBeCloseTo(720)
    expect(call[4]).toBeCloseTo(720)
    expect(call[1]).toBeCloseTo((1280 - 720) / 2)
  })

  it('выключение гасит дорожки потока', async () => {
    const { stream, stop } = makeStream()
    stubMediaDevices(vi.fn().mockResolvedValue(stream) as never)

    const wrapper = mount(GrCameraCapture, { props: { autoStart: true } })
    await vi.waitFor(() => expect(wrapper.emitted('start')).toBeTruthy())

    ;(wrapper.vm as unknown as { stop: () => void }).stop()

    expect(stop).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('stop')).toHaveLength(1)
  })

  it('размонтирование гасит дорожки — иначе индикатор камеры остаётся гореть', async () => {
    const { stream, stop } = makeStream()
    stubMediaDevices(vi.fn().mockResolvedValue(stream) as never)

    const wrapper = mount(GrCameraCapture, { props: { autoStart: true } })
    await vi.waitFor(() => expect(wrapper.emitted('start')).toBeTruthy())

    wrapper.unmount()

    expect(stop).toHaveBeenCalledTimes(1)
  })

  it('заданное устройство требуется точно, а не пожеланием', async () => {
    const { stream } = makeStream()
    const getUserMedia = vi.fn().mockResolvedValue(stream)
    stubMediaDevices(getUserMedia as never)

    const wrapper = mount(GrCameraCapture, { props: { autoStart: true, deviceId: 'cam-2' } })
    await vi.waitFor(() => expect(wrapper.emitted('start')).toBeTruthy())

    // Без `exact` браузер вправе отдать другую камеру — приложение просит одну,
    // получает вторую, и узнать об этом неоткуда.
    expect(getUserMedia).toHaveBeenCalledWith({
      video: { deviceId: { exact: 'cam-2' } },
      audio: false,
    })
  })

  it('без устройства просит камеру по стороне', async () => {
    const { stream } = makeStream()
    const getUserMedia = vi.fn().mockResolvedValue(stream)
    stubMediaDevices(getUserMedia as never)

    const wrapper = mount(GrCameraCapture, { props: { autoStart: true, facing: 'environment' } })
    await vi.waitFor(() => expect(wrapper.emitted('start')).toBeTruthy())

    expect(getUserMedia).toHaveBeenCalledWith({
      video: { facingMode: 'environment' },
      audio: false,
    })
  })

  it('зеркалится превью фронтальной камеры, а не тыловой', async () => {
    const { stream } = makeStream()
    stubMediaDevices(vi.fn().mockResolvedValue(stream) as never)

    const front = mount(GrCameraCapture, { props: { autoStart: true } })
    await vi.waitFor(() => expect(front.emitted('start')).toBeTruthy())
    expect(front.find('video').classes()).toContain('scale-x-[-1]')

    const back = mount(GrCameraCapture, { props: { autoStart: true, facing: 'environment' } })
    await vi.waitFor(() => expect(back.emitted('start')).toBeTruthy())
    expect(back.find('video').classes()).not.toContain('scale-x-[-1]')
  })
})
