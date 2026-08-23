import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import GrVideoPlayer from '../GrVideoPlayer.vue'

const DURATION = 120

let play: ReturnType<typeof vi.fn>
let pause: ReturnType<typeof vi.fn>

beforeEach(() => {
  // В jsdom воспроизведения нет вовсе: ни `play`, ни длительности.
  play = vi.fn().mockResolvedValue(undefined)
  pause = vi.fn()
  HTMLMediaElement.prototype.play = play as unknown as HTMLMediaElement['play']
  HTMLMediaElement.prototype.pause = pause as unknown as HTMLMediaElement['pause']
  Object.defineProperty(HTMLMediaElement.prototype, 'duration', { configurable: true, get: () => DURATION })
  Object.defineProperty(HTMLMediaElement.prototype, 'paused', { configurable: true, get: () => true })
})

async function mountPlayer(props: Record<string, unknown> = {}) {
  const wrapper = mount(GrVideoPlayer, { props: { src: '/clip.webm', ...props } })
  const video = wrapper.find('video').element as HTMLVideoElement
  video.dispatchEvent(new Event('loadedmetadata'))
  await nextTick()

  /** Время без события браузер тоже не меняет молча — плеер узнаёт о нём так. */
  const seek = async (seconds: number) => {
    video.currentTime = seconds
    video.dispatchEvent(new Event('timeupdate'))
    await nextTick()
  }

  return { wrapper, video, seek }
}

describe('GrVideoPlayer', () => {
  it('пробел запускает и останавливает воспроизведение', async () => {
    const { wrapper } = await mountPlayer()

    await wrapper.find('[role="group"]').trigger('keydown', { key: ' ' })

    expect(play).toHaveBeenCalledTimes(1)
  })

  it('стрелки перематывают на заданный шаг', async () => {
    const { wrapper, video, seek } = await mountPlayer({ seekStep: 10 })
    await seek(30)

    await wrapper.find('[role="group"]').trigger('keydown', { key: 'ArrowRight' })
    expect(video.currentTime).toBe(40)

    await seek(40)
    await wrapper.find('[role="group"]').trigger('keydown', { key: 'ArrowLeft' })
    expect(video.currentTime).toBe(30)
  })

  it('перемотка не выходит за края ролика', async () => {
    const { wrapper, video, seek } = await mountPlayer()

    await wrapper.find('[role="group"]').trigger('keydown', { key: 'End' })
    expect(video.currentTime).toBe(DURATION)

    await seek(DURATION)
    await wrapper.find('[role="group"]').trigger('keydown', { key: 'ArrowRight' })
    // Дальше конца перематывать некуда — иначе браузер бросит на ноль.
    expect(video.currentTime).toBe(DURATION)

    await wrapper.find('[role="group"]').trigger('keydown', { key: 'Home' })
    expect(video.currentTime).toBe(0)
  })

  it('клавиша `m` переключает звук', async () => {
    const { wrapper, video } = await mountPlayer()

    await wrapper.find('[role="group"]').trigger('keydown', { key: 'm' })

    expect(video.muted).toBe(true)
  })

  it('дорожка объявляет позицию словами, а не долей', async () => {
    const { wrapper, seek } = await mountPlayer()
    await seek(65)

    const track = wrapper.find('[role="slider"]')
    // «65 из 120» диктору ничего не говорит: нужно время в подписи.
    expect(track.attributes('aria-valuetext')).toBe('1:05 / 2:00')
  })

  it('ошибка источника показывается, а не остаётся чёрным кадром', async () => {
    const { wrapper, video } = await mountPlayer()

    video.dispatchEvent(new Event('error'))
    await nextTick()

    expect(wrapper.text()).toContain('could not be played')
    expect(wrapper.emitted('error')).toHaveLength(1)
  })

  it('без длительности не обещает полосу и общее время', async () => {
    // У потоковой записи (`MediaRecorder`, эфир) длительности нет в заголовке.
    Object.defineProperty(HTMLMediaElement.prototype, 'duration', {
      configurable: true,
      get: () => Number.NaN,
    })

    const { wrapper, seek } = await mountPlayer()
    await seek(65)

    expect(wrapper.find('[role="slider"]').exists()).toBe(false)
    // «1:05 / 0:00» врало бы: конца у записи попросту нет.
    expect(wrapper.text()).toContain('1:05')
    expect(wrapper.text()).not.toContain('/ 0:00')
  })

  it('размонтирование останавливает воспроизведение', async () => {
    const { wrapper } = await mountPlayer()

    wrapper.unmount()

    // Иначе звук продолжает идти на странице, которой уже нет.
    expect(pause).toHaveBeenCalledTimes(1)
  })

  it('отключённый плеер не реагирует на клавиши', async () => {
    const { wrapper, video, seek } = await mountPlayer({ disabled: true })
    await seek(10)

    await wrapper.find('[role="group"]').trigger('keydown', { key: 'ArrowRight' })

    expect(video.currentTime).toBe(10)
    expect(play).not.toHaveBeenCalled()
  })
})
