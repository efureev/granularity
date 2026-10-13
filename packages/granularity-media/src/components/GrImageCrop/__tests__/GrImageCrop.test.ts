import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import GrImageCrop from '../GrImageCrop.vue'
import type { GrCropRect } from '../cropGeometry'

const NATURAL = { width: 1600, height: 900 }
const VIEWPORT_WIDTH = 300

/**
 * Заглушка `Image`: в jsdom загрузка не происходит вовсе, а компонент ждёт
 * события. Тест сам решает, когда картинка «приехала», — иначе проверять
 * нечего.
 */
class StubImage {
  static last: StubImage | null = null
  /** Собственный размер следующей картинки: тест меняет его до монтирования. */
  static natural = NATURAL

  crossOrigin = ''
  naturalWidth = StubImage.natural.width
  naturalHeight = StubImage.natural.height
  #src = ''
  #listeners = new Map<string, (event: unknown) => void>()

  constructor() {
    StubImage.last = this
  }

  get src(): string {
    return this.#src
  }

  set src(value: string) {
    this.#src = value
  }

  addEventListener(type: string, listener: (event: unknown) => void): void {
    this.#listeners.set(type, listener)
  }

  emit(type: string, payload?: unknown): void {
    this.#listeners.get(type)?.(payload)
  }
}

/** Колбэки наблюдателя: тест дёргает их сам — в jsdom раскладки нет. */
let resizeCallbacks: ResizeObserverCallback[] = []

const originalImage = globalThis.Image
const originalObserver = globalThis.ResizeObserver

beforeEach(() => {
  resizeCallbacks = []
  globalThis.Image = StubImage as unknown as typeof Image
  // `ResizeObserver` в jsdom нет: без заглушки монтирование падает.
  globalThis.ResizeObserver = class {
    constructor(public callback: ResizeObserverCallback) {
      resizeCallbacks.push(callback)
    }

    observe(): void {}
    disconnect(): void {}
  } as unknown as typeof ResizeObserver

  // Ширина окна кадра: в jsdom раскладки нет, а без ширины геометрия вырождена.
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => VIEWPORT_WIDTH,
  })
  // Высота теперь тоже измеряется, а не выводится из ширины.
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get: () => VIEWPORT_WIDTH,
  })
})

afterEach(() => {
  globalThis.Image = originalImage
  globalThis.ResizeObserver = originalObserver
  StubImage.last = null
  StubImage.natural = NATURAL
})

async function mountLoaded(props: Record<string, unknown> = {}) {
  const wrapper = mount(GrImageCrop, { props: { src: '/photo.jpg', ...props } })
  StubImage.last?.emit('load')
  await nextTick()

  return wrapper
}

type CropWrapper = Awaited<ReturnType<typeof mountLoaded>>

function lastRect(wrapper: CropWrapper): GrCropRect {
  const events = wrapper.emitted('change')

  return events![events!.length - 1]![0] as GrCropRect
}

/** Окно получило новый размер — так, как его отдаёт браузер: в дробных CSS-пикселях. */
async function resize(width: number, height: number): Promise<void> {
  resizeCallbacks.forEach(callback => callback(
    [{ contentRect: { width, height } } as ResizeObserverEntry],
    {} as ResizeObserver,
  ))
  await nextTick()
}

function frameOf(wrapper: CropWrapper): HTMLElement {
  return wrapper.find('[role="application"]').element as HTMLElement
}

function stubCanvas(): ReturnType<typeof vi.fn> {
  const drawImage = vi.fn()
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D)
  HTMLCanvasElement.prototype.toBlob = (callback: (blob: Blob | null) => void) => callback(new Blob())

  return drawImage
}

describe('GrImageCrop', () => {
  it('без картинки показывает пустое состояние и не берёт фокус', async () => {
    const wrapper = mount(GrImageCrop)

    expect(wrapper.find('img').exists()).toBe(false)
    // Фокусировать пустую рамку не на чем: там нечего двигать.
    expect(wrapper.find('[role="application"]').attributes('tabindex')).toBe('-1')
  })

  it('после загрузки показывает картинку и сообщает её размер', async () => {
    const wrapper = await mountLoaded()

    expect(wrapper.find('img').exists()).toBe(true)
    expect(wrapper.emitted('load')?.[0]?.[0]).toEqual(NATURAL)
  })

  it('стрелки берут кадр по направлению клавиши, а не против', async () => {
    const wrapper = await mountLoaded({ zoom: 2 })
    const frame = wrapper.find('[role="application"]')
    const start = lastRect(wrapper)

    await frame.trigger('keydown', { key: 'ArrowRight' })
    const right = lastRect(wrapper)
    expect(right.sx).toBeGreaterThan(start.sx)

    await frame.trigger('keydown', { key: 'ArrowLeft' })
    // Возврат ровно на шаг: обратная клавиша обязана отменять предыдущую.
    expect(lastRect(wrapper).sx).toBeCloseTo(start.sx)

    await frame.trigger('keydown', { key: 'ArrowDown' })
    const down = lastRect(wrapper)
    expect(down.sy).toBeGreaterThan(start.sy)

    await frame.trigger('keydown', { key: 'ArrowUp' })
    expect(lastRect(wrapper).sy).toBeCloseTo(start.sy)
  })

  it('плюс и минус меняют увеличение, не выходя за границы', async () => {
    const wrapper = await mountLoaded({ zoom: 1, maxZoom: 2 })
    const frame = wrapper.find('[role="application"]')

    await frame.trigger('keydown', { key: '-' })
    // Меньше единицы кадр не уменьшается: картинка перестала бы покрывать окно.
    expect(wrapper.emitted('update:zoom')?.[0]?.[0]).toBe(1)

    await frame.trigger('keydown', { key: '+' })
    expect(wrapper.emitted('update:zoom')?.[1]?.[0]).toBeCloseTo(1.15)
  })

  it('Home возвращает исходный кадр', async () => {
    const wrapper = await mountLoaded({ zoom: 2 })
    const frame = wrapper.find('[role="application"]')

    await frame.trigger('keydown', { key: 'ArrowLeft' })
    await frame.trigger('keydown', { key: 'Home' })

    const emitted = wrapper.emitted('update:zoom') as [number][]
    expect(emitted[emitted.length - 1]![0]).toBe(1)
  })

  it('увеличение работает и без `v-model:zoom`', async () => {
    const wrapper = await mountLoaded()
    const frame = wrapper.find('[role="application"]')
    const before = lastRect(wrapper)

    await frame.trigger('keydown', { key: '+' })

    // Без собственного состояния проп остался бы единицей, и встроенный
    // слайдер был бы мёртвым у всех, кто модель не подключил.
    expect(lastRect(wrapper).sw).toBeLessThan(before.sw)
  })

  it('переданный `zoom` перекрывает собственное состояние', async () => {
    const wrapper = await mountLoaded({ zoom: 2 })
    const frame = wrapper.find('[role="application"]')
    const before = lastRect(wrapper)

    await frame.trigger('keydown', { key: '+' })

    // Управляет потребитель: пока он не обновил проп, кадр не меняется.
    expect(lastRect(wrapper).sw).toBeCloseTo(before.sw)
    expect(wrapper.emitted('update:zoom')?.at(-1)?.[0]).toBeCloseTo(2.15)
  })

  it('пустая рамка уже держит соотношение кадра — картинка не сдвигает раскладку', async () => {
    const wrapper = mount(GrImageCrop, { props: { aspectRatio: 4 / 3 } })
    const empty = frameOf(wrapper)

    // Высоту пустой рамке задаёт соотношение, а не своя минимальная высота:
    // иначе с приходом картинки рамка прыгала бы со 192px на высоту кадра.
    const emptyRatio = empty.style.aspectRatio
    expect(Number.parseFloat(emptyRatio)).toBeCloseTo(4 / 3)
    expect(empty.className).not.toMatch(/\bmin-h-/)

    await wrapper.setProps({ src: '/photo.jpg' })
    StubImage.last?.emit('load')
    await nextTick()

    expect(wrapper.find('img').exists()).toBe(true)
    expect(frameOf(wrapper)).toBe(empty)
    expect(frameOf(wrapper).style.aspectRatio).toBe(emptyRatio)
  })

  it('кадр держит соотношение рамки, хотя окно меряется с долей пикселя', async () => {
    StubImage.natural = { width: 1600, height: 1200 }
    const wrapper = await mountLoaded({ aspectRatio: 4 / 3 })

    // Рамка 669px шириной: CSS держит 4:3 вместе с бордером, а внутри — 667×499.75,
    // это 1.3347. Снятый прямо с окна, кадр вышел бы 1600×1198.8 со сдвигом 0.6 вниз.
    await resize(667, 499.75)

    const whole = { sx: 0, sy: 0, sw: 1600, sh: 1200 }
    expect(lastRect(wrapper)).toEqual(whole)
    expect((wrapper.vm as unknown as { rect: () => GrCropRect }).rect()).toEqual(whole)
  })

  it('кадр держит соотношение рамки и после увеличения', async () => {
    StubImage.natural = { width: 1600, height: 1200 }
    const wrapper = await mountLoaded({ aspectRatio: 4 / 3 })
    await resize(298, 223)

    await wrapper.find('[role="application"]').trigger('keydown', { key: '+' })

    const rect = lastRect(wrapper)
    expect(rect.sw).toBeLessThan(1600)
    expect(rect.sw / rect.sh).toBeCloseTo(4 / 3, 12)
  })

  it('изменение размера окна сообщается как изменение кадра', async () => {
    const wrapper = await mountLoaded({ zoom: 2 })
    await wrapper.find('[role="application"]').trigger('keydown', { key: 'ArrowLeft' })
    const before = lastRect(wrapper)

    // Окно стало вдвое уже: у адаптивной раскладки это происходит и без участия
    // пользователя. Тот же сдвиг в пикселях экрана теперь вдвое длиннее в
    // пикселях исходника — потребитель, собравший файл по прежнему кадру,
    // получил бы не то, что видит.
    await resize(VIEWPORT_WIDTH / 2, VIEWPORT_WIDTH / 2)

    const after = lastRect(wrapper)
    expect(after.sx).not.toBeCloseTo(before.sx)
    expect(after.sw / after.sh).toBeCloseTo(1)
  })

  it('отключённый компонент не двигает кадр', async () => {
    const wrapper = await mountLoaded({ disabled: true })
    const frame = wrapper.find('[role="application"]')
    const before = lastRect(wrapper)

    await frame.trigger('keydown', { key: 'ArrowRight' })

    expect(lastRect(wrapper)).toEqual(before)
  })

  it('экспорт рисует захваченную область в размер исходника', async () => {
    const drawImage = vi.fn()
    const toBlob = vi.fn((callback: (blob: Blob | null) => void) => callback(new Blob()))
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D)
    HTMLCanvasElement.prototype.toBlob = toBlob

    const wrapper = await mountLoaded()
    const blob = await (wrapper.vm as unknown as { crop: () => Promise<Blob | null> }).crop()

    expect(blob).toBeInstanceOf(Blob)
    expect(toBlob).toHaveBeenCalledTimes(1)
    // Квадратное окно на пейзаже: в кадр идёт 900×900 пикселей исходника.
    const call = drawImage.mock.calls[0]!
    expect(call[3]).toBeCloseTo(900)
    expect(call[4]).toBeCloseTo(900)
    // И холст того же размера: без `output` разрешение исходника не теряется.
    expect(call[7]).toBe(900)
    expect(call[8]).toBe(900)
  })

  it('экспорт по одной ширине получает высоту из соотношения рамки, а не из доли пикселя', async () => {
    StubImage.natural = { width: 1200, height: 1600 }
    const drawImage = stubCanvas()

    const wrapper = await mountLoaded({ aspectRatio: 3 / 4, output: { width: 1200, type: 'image/jpeg' } })
    // Рамка 400px шириной: снаружи 400×533.33, внутри — 398×531.33, это 0.749.
    await resize(398, 531.33)
    await (wrapper.vm as unknown as { crop: () => Promise<Blob | null> }).crop()

    // Картинка того же соотношения целиком: 1200×1600, а не 1200×1602.
    const call = drawImage.mock.calls[0]!
    expect(call.slice(1, 5)).toEqual([0, 0, 1200, 1600])
    expect(call.slice(7, 9)).toEqual([1200, Math.round(1200 / (3 / 4))])
  })

  it('одна сторона в `output` не растягивает кадр', async () => {
    const drawImage = vi.fn()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D)
    HTMLCanvasElement.prototype.toBlob = (callback: (blob: Blob | null) => void) => callback(new Blob())

    const wrapper = await mountLoaded({ output: { width: 512 } })
    await (wrapper.vm as unknown as { crop: () => Promise<Blob | null> }).crop()

    // Квадратная область 900×900 при ширине 512 обязана дать 512×512.
    const call = drawImage.mock.calls[0]!
    expect(call[7]).toBe(512)
    expect(call[8]).toBe(512)
  })

  it('непригодный для чтения холст не роняет вызов, а сообщает об ошибке', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage: vi.fn() } as unknown as CanvasRenderingContext2D)
    HTMLCanvasElement.prototype.toBlob = () => {
      throw new Error('SecurityError')
    }
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = await mountLoaded()
    const blob = await (wrapper.vm as unknown as { crop: () => Promise<Blob | null> }).crop()

    expect(blob).toBeNull()
    expect(wrapper.emitted('error')).toHaveLength(1)
    expect(warn.mock.calls[0]?.[0]).toContain('Access-Control-Allow-Origin')
  })
})
