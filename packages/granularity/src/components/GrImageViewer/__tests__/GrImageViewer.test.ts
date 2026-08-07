import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { pushOverlayLayer, resetOverlayStack } from '../../../composables/internal/overlayStack'
import { resetScrollLock } from '../../../composables/internal/useScrollLock'
import { resetAnnouncer } from '../../../composables/useAnnouncer'

import GrImageViewer from '../GrImageViewer.vue'

afterEach(() => {
  resetAnnouncer()
  resetScrollLock()
  resetOverlayStack()
})

/**
 * Хелпер асинхронный: поддерево слоя появляется на такт позже монтирования —
 * телепорт включается только после маунта, чтобы серверный рендер и первый
 * клиентский совпадали (см. `useTeleportEnabled`).
 */
async function mountViewer(extra: Record<string, unknown> = {}) {
  const Harness = defineComponent({
    components: { GrImageViewer },
    setup() {
      const open = ref(true)
      return { open }
    },
    template: `<GrImageViewer v-model="open" :url-list="['/a.jpg','/b.jpg']" show-progress v-bind="$attrs" />`,
    inheritAttrs: false,
  })
  // Стаб teleport: рендерим контент инлайн, чтобы `wrapper.find` его видел.
  const wrapper = mount(Harness, { attrs: extra, global: { stubs: { teleport: true } } })
  await nextTick()
  return wrapper
}

describe('GrImageViewer (decomposed)', () => {

  it('помечает корень inert, когда поверх открыт другой модальный слой', async () => {
    const wrapper = await mountViewer()

    expect(wrapper.find('[data-gr-overlay-root]').attributes('inert')).toBeUndefined()

    pushOverlayLayer({ modal: true, shouldClose: () => true, close: () => {} })
    await nextTick()

    expect(wrapper.find('[data-gr-overlay-root]').attributes('inert')).toBeDefined()

    wrapper.unmount()
  })
  it('renders the current image, progress and zoom value', async () => {
    const wrapper = await mountViewer()
    expect(wrapper.find('[data-gr-image-viewer-image]').attributes('src')).toBe('/a.jpg')
    expect(wrapper.find('[data-gr-image-viewer-progress]').text()).toBe('1 / 2')
    expect(wrapper.find('[data-gr-image-viewer-zoom-value]').text()).toBe('100%')
  })

  it('zoom in/out updates the zoom value (useZoomPan)', async () => {
    const wrapper = await mountViewer()
    await wrapper.find('[data-gr-image-viewer-zoom-in]').trigger('click')
    expect(wrapper.find('[data-gr-image-viewer-zoom-value]').text()).toBe('120%')
    await wrapper.find('[data-gr-image-viewer-zoom-reset]').trigger('click')
    expect(wrapper.find('[data-gr-image-viewer-zoom-value]').text()).toBe('100%')
  })

  it('rotate buttons emit rotate with cumulative degrees', async () => {
    const wrapper = await mountViewer()
    const viewer = wrapper.findComponent(GrImageViewer)
    await wrapper.find('[data-gr-image-viewer-rotate-right]').trigger('click')
    await wrapper.find('[data-gr-image-viewer-rotate-right]').trigger('click')
    expect(viewer.emitted('rotate')?.at(-1)).toEqual([180])
  })

  it('switches image via next/prev (index management)', async () => {
    const wrapper = await mountViewer()
    await wrapper.find('[data-gr-image-viewer-next]').trigger('click')
    expect(wrapper.find('[data-gr-image-viewer-image]').attributes('src')).toBe('/b.jpg')
    expect(wrapper.find('[data-gr-image-viewer-progress]').text()).toBe('2 / 2')
  })

  it('keyboard: ArrowRight switches (useViewerKeyboard)', async () => {
    const wrapper = await mountViewer()
    const dialog = wrapper.find('[data-gr-overlay-root]')

    await dialog.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.find('[data-gr-image-viewer-image]').attributes('src')).toBe('/b.jpg')
  })

  // Esc идёт через общий стек слоёв, а не через локальный `@keydown`, поэтому
  // и проверяется настоящим событием на `window`, а не триггером по элементу.
  it('Escape закрывает просмотрщик через общий стек слоёв', async () => {
    const wrapper = await mountViewer()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await nextTick()

    expect(wrapper.find('[data-gr-image-viewer-image]').exists()).toBe(false)
  })

  it('close button closes the viewer', async () => {
    const wrapper = await mountViewer()
    await wrapper.find('[data-gr-image-viewer-close]').trigger('click')
    await nextTick()
    expect(wrapper.find('[data-gr-image-viewer-image]').exists()).toBe(false)
  })
})

describe('GrImageViewer — доступное имя слоя', () => {
  // `role="dialog" aria-modal="true"` без имени: диктор объявит «диалог» и всё,
  // axe роняет это как `aria-dialog-name`.
  it('диалог называет себя из локали', async () => {
    const wrapper = await mountViewer()

    expect(wrapper.get('[data-gr-overlay-root]').attributes('aria-label')).toBe('Image viewer')

    wrapper.unmount()
  })

  it('ariaLabel перекрывает имя из локали', async () => {
    const wrapper = await mountViewer({ 'aria-label': undefined, 'ariaLabel': 'Фотографии объекта' })

    expect(wrapper.get('[data-gr-overlay-root]').attributes('aria-label')).toBe('Фотографии объекта')

    wrapper.unmount()
  })
})

describe('GrImageViewer — альтернативный текст', () => {
  async function mountWith(urlList: unknown[]) {
    const Harness = defineComponent({
      components: { GrImageViewer },
      setup: () => ({ open: ref(true), urlList }),
      template: '<GrImageViewer v-model="open" :url-list="urlList" show-progress />',
    })

    const wrapper = mount(Harness, { global: { stubs: { teleport: true } } })
    await nextTick()
    return wrapper
  }

  // `alt=""` был захардкожен, а `urlList: string[]` не позволял передать текст
  // в принципе: компонент, чьё содержимое — только картинка, был пуст для
  // незрячего пользователя.
  it('объект {src, alt} доносит alt до изображения', async () => {
    const wrapper = await mountWith([
      { src: '/plan.png', alt: 'План второго этажа' },
      { src: '/facade.png', alt: 'Фасад со стороны двора' },
    ])

    expect(wrapper.get('[data-gr-image-viewer-image]').attributes('alt')).toBe('План второго этажа')

    wrapper.unmount()
  })

  it('строки в списке продолжают работать — alt пустой', async () => {
    const wrapper = await mountWith(['/a.jpg', '/b.jpg'])

    const img = wrapper.get('[data-gr-image-viewer-image]')
    expect(img.attributes('src')).toBe('/a.jpg')
    expect(img.attributes('alt')).toBe('')

    wrapper.unmount()
  })

  it('смешанный список тоже допустим', async () => {
    const wrapper = await mountWith(['/a.jpg', { src: '/b.jpg', alt: 'Второй кадр' }])

    await wrapper.get('[data-gr-image-viewer-next]').trigger('click')

    expect(wrapper.get('[data-gr-image-viewer-image]').attributes('alt')).toBe('Второй кадр')

    wrapper.unmount()
  })
})

describe('GrImageViewer — изменение списка', () => {
  async function mountGallery(initial: string[]) {
    const urlList = ref<string[]>(initial)
    const Harness = defineComponent({
      components: { GrImageViewer },
      setup: () => ({ open: ref(true), urlList }),
      template: '<GrImageViewer v-model="open" :url-list="urlList" show-progress />',
    })

    const wrapper = mount(Harness, { global: { stubs: { teleport: true } } })
    await nextTick()
    return { wrapper, urlList }
  }

  // `watch(urlList, deep)` дергал `syncIndexFromInitial()`: догрузка следующей
  // страницы галереи отбрасывала на `initialIndex` и сбрасывала зум.
  it('догрузка кадров не сдвигает текущий и не сбрасывает зум', async () => {
    const { wrapper, urlList } = await mountGallery(['/a.jpg', '/b.jpg'])

    await wrapper.get('[data-gr-image-viewer-next]').trigger('click')
    await wrapper.get('[data-gr-image-viewer-zoom-in]').trigger('click')
    expect(wrapper.get('[data-gr-image-viewer-image]').attributes('src')).toBe('/b.jpg')
    expect(wrapper.get('[data-gr-image-viewer-zoom-value]').text()).toBe('120%')

    urlList.value = [...urlList.value, '/c.jpg', '/d.jpg']
    await nextTick()

    expect(wrapper.get('[data-gr-image-viewer-image]').attributes('src')).toBe('/b.jpg')
    expect(wrapper.get('[data-gr-image-viewer-progress]').text()).toBe('2 / 4')
    expect(wrapper.get('[data-gr-image-viewer-zoom-value]').text()).toBe('120%')

    wrapper.unmount()
  })

  it('кадр остаётся тем же, даже если сдвинулся по позиции', async () => {
    const { wrapper, urlList } = await mountGallery(['/a.jpg', '/b.jpg'])

    await wrapper.get('[data-gr-image-viewer-next]').trigger('click')

    urlList.value = ['/new.jpg', '/a.jpg', '/b.jpg']
    await nextTick()

    expect(wrapper.get('[data-gr-image-viewer-image]').attributes('src')).toBe('/b.jpg')
    expect(wrapper.get('[data-gr-image-viewer-progress]').text()).toBe('3 / 3')

    wrapper.unmount()
  })

  it('исчезнувший кадр — держимся позиции, а не прыгаем на initialIndex', async () => {
    const { wrapper, urlList } = await mountGallery(['/a.jpg', '/b.jpg', '/c.jpg'])

    await wrapper.get('[data-gr-image-viewer-next]').trigger('click')
    await wrapper.get('[data-gr-image-viewer-next]').trigger('click')
    expect(wrapper.get('[data-gr-image-viewer-image]').attributes('src')).toBe('/c.jpg')

    urlList.value = ['/a.jpg', '/b.jpg']
    await nextTick()

    // Третьего кадра больше нет — показываем последний доступный.
    expect(wrapper.get('[data-gr-image-viewer-image]').attributes('src')).toBe('/b.jpg')
    expect(wrapper.get('[data-gr-image-viewer-progress]').text()).toBe('2 / 2')

    wrapper.unmount()
  })
})

describe('GrImageViewer — слой', () => {
  // `DEFAULT_Z_INDEX = 2000` был выше тостов: просмотрщик перекрывал уведомления
  // уровня приложения — единственный слой, который обязан быть виден поверх всего.
  it('по умолчанию живёт на модальном слое шкалы', async () => {
    const wrapper = await mountViewer()

    expect(wrapper.get('[data-gr-overlay-root]').attributes('style')).toContain('var(--gr-z-modal)')

    wrapper.unmount()
  })

  it('проп zIndexVar остаётся escape-hatch’ем', async () => {
    const wrapper = await mountViewer({ zIndexVar: '--app-z-lightbox' })

    expect(wrapper.get('[data-gr-overlay-root]').attributes('style'))
      .toContain('z-index: var(--app-z-lightbox)')

    wrapper.unmount()
  })
})

describe('GrImageViewer — событие смены кадра и живой регион', () => {
  it('смена кадра эмитит change с новым индексом', async () => {
    const wrapper = await mountViewer()
    const viewer = wrapper.findComponent(GrImageViewer)

    await wrapper.find('[data-gr-image-viewer-next]').trigger('click')

    expect(viewer.emitted('change')?.[0]).toEqual([1])

    wrapper.unmount()
  })

  // Позиция уходит в общий живой регион: при открытии её говорить незачем —
  // это скажет имя диалога, — а на смене кадра сказать больше нечем.
  it('позиция объявляется только после смены кадра', async () => {
    const wrapper = await mountViewer()
    const live = () => document.querySelector('[data-gr-announcer-region="polite"]')

    expect(live()?.getAttribute('role')).toBe('status')
    expect(live()?.textContent).toBe('')

    await wrapper.find('[data-gr-image-viewer-next]').trigger('click')
    await new Promise(resolve => setTimeout(resolve, 2))

    expect(live()?.textContent).toBe('Image 2 of 2')

    wrapper.unmount()
  })

  // Просмотрщик накрывает страницу `inert`, а живой регион лежит вне него:
  // без пропуска по `data-gr-live-region` объявление никто бы не услышал.
  it('хост объявителя не гасится инертом просмотрщика', async () => {
    const wrapper = await mountViewer()

    await wrapper.find('[data-gr-image-viewer-next]').trigger('click')
    await new Promise(resolve => setTimeout(resolve, 2))

    const announcerHost = document.getElementById('gr-announcer')!
    expect(announcerHost.hasAttribute('inert')).toBe(false)
    expect(announcerHost.hasAttribute('aria-hidden')).toBe(false)

    wrapper.unmount()
  })
})

describe('GrImageViewer — императивный API', () => {
  it('отдаёт наружу управление кадром и трансформациями', async () => {
    // Через template-ref, а не через `wrapper.vm`: наружу видна именно
    // exposed-поверхность, и имена в ней свои (`close`, а не `closeViewer`).
    const Harness = defineComponent({
      components: { GrImageViewer },
      setup() {
        const open = ref(true)
        const viewer = ref()
        return { open, viewer }
      },
      template: `<GrImageViewer ref="viewer" v-model="open" :url-list="['/a.jpg','/b.jpg']" />`,
    })

    const wrapper = mount(Harness, { global: { stubs: { teleport: true } } })
    const viewer = wrapper.findComponent(GrImageViewer)
    const api = (wrapper.vm as unknown as { viewer: Record<string, () => void> }).viewer

    api.next()
    await nextTick()
    expect(wrapper.get('[data-gr-image-viewer-image]').attributes('src')).toBe('/b.jpg')

    api.prev()
    await nextTick()
    expect(wrapper.get('[data-gr-image-viewer-image]').attributes('src')).toBe('/a.jpg')

    api.zoomIn()
    await nextTick()
    expect(wrapper.get('[data-gr-image-viewer-zoom-value]').text()).not.toBe('100%')

    api.reset()
    await nextTick()
    expect(wrapper.get('[data-gr-image-viewer-zoom-value]').text()).toBe('100%')

    api.rotateRight()
    expect(viewer.emitted('rotate')?.[0]).toEqual([90])

    api.close()
    expect(viewer.emitted('update:modelValue')?.at(-1)).toEqual([false])

    wrapper.unmount()
  })
})

describe('GrImageViewer — предзагрузка соседей', () => {
  /** Перехватываем `new Image()`: важен и адрес, и то, что загрузку обрывают. */
  function trackImages() {
    const created: { src: string, history: string[] }[] = []
    const OriginalImage = globalThis.Image

    class TrackedImage {
      decoding = 'auto'
      history: string[] = []
      #src = ''

      constructor() {
        created.push(this)
      }

      get src(): string {
        return this.#src
      }

      set src(value: string) {
        this.#src = value
        this.history.push(value)
      }
    }

    globalThis.Image = TrackedImage as unknown as typeof Image
    return { created, restore: () => { globalThis.Image = OriginalImage } }
  }

  it('закрытый просмотрщик не греет соседние кадры', async () => {
    const { created, restore } = trackImages()

    const wrapper = mount(defineComponent({
      components: { GrImageViewer },
      setup: () => ({ open: ref(false) }),
      template: `<GrImageViewer v-model="open" :url-list="['/a.jpg','/b.jpg','/c.jpg']" />`,
    }), { global: { stubs: { teleport: true } } })
    await nextTick()

    // Страница с закрытым просмотрщиком не должна тянуть полноразмерные кадры.
    expect(created).toHaveLength(0)

    wrapper.unmount()
    restore()
  })

  it('открытие греет соседей, а смена кадра обрывает неактуальные загрузки', async () => {
    const { created, restore } = trackImages()

    const wrapper = mount(defineComponent({
      components: { GrImageViewer },
      setup: () => ({ open: ref(false) }),
      template: `<GrImageViewer v-model="open" :url-list="['/a.jpg','/b.jpg','/c.jpg']" />`,
    }), { global: { stubs: { teleport: true } } })

    ;(wrapper.vm as unknown as { open: boolean }).open = true
    await nextTick()
    await nextTick()

    expect(created.map(image => image.src).sort()).toEqual(['/b.jpg', '/c.jpg'])

    const firstBatch = [...created]
    ;(wrapper.vm as unknown as { open: boolean }).open = false
    await nextTick()

    // Пустой `src` — это и есть отмена: браузер обрывает незавершённый запрос.
    expect(firstBatch.every(image => image.src === '')).toBe(true)

    wrapper.unmount()
    restore()
  })
})

describe('GrImageViewer — скачивание', () => {
  it('кнопки нет, пока её не попросили', async () => {
    const wrapper = await mountViewer()

    expect(wrapper.find('[data-gr-image-viewer-download]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('скачивает текущий кадр и сообщает об этом событием', async () => {
    const clicks: string[] = []
    const originalCreate = document.createElement.bind(document)

    const createSpy = vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      const el = originalCreate(tag)
      if (tag === 'a') el.click = () => { clicks.push((el as HTMLAnchorElement).href) }
      return el
    }))

    const wrapper = await mountViewer({ showDownload: true })
    await wrapper.get('[data-gr-image-viewer-download]').trigger('click')

    const viewer = wrapper.findComponent(GrImageViewer)
    expect(viewer.emitted('download')?.[0]).toEqual([{ src: '/a.jpg', alt: '', index: 0 }])
    expect(clicks.some(href => href.endsWith('/a.jpg'))).toBe(true)

    createSpy.mockRestore()
    wrapper.unmount()
  })
})
