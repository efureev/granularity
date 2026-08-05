import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { pushOverlayLayer, resetOverlayStack } from '../../../composables/internal/overlayStack'
import { resetScrollLock } from '../../../composables/internal/useScrollLock'

vi.mock('@headlessui/vue', async () => {
  const { defineComponent } = await import('vue')
  const pass = (name: string, testid: string) => defineComponent({ name, template: `<div data-testid="${testid}"><slot /></div>` })
  return {
    Dialog: pass('Dialog', 'hu-dialog'),
    DialogPanel: pass('DialogPanel', 'hu-panel'),
    TransitionChild: pass('TransitionChild', 'hu-child'),
    TransitionRoot: defineComponent({
      name: 'TransitionRoot',
      props: { show: { type: Boolean, default: false } },
      template: '<div v-if="show"><slot /></div>',
    }),
  }
})

import GrImageViewer from '../GrImageViewer.vue'

afterEach(() => {
  resetScrollLock()
  resetOverlayStack()
})

function mountViewer(extra: Record<string, unknown> = {}) {
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
  return mount(Harness, { attrs: extra, global: { stubs: { teleport: true } } })
}

describe('GrImageViewer (decomposed)', () => {

  it('помечает корень inert, когда поверх открыт другой модальный слой', async () => {
    const wrapper = mountViewer()

    expect(wrapper.find('[data-testid="hu-dialog"]').attributes('inert')).toBeUndefined()

    pushOverlayLayer({ modal: true, shouldClose: () => true, close: () => {} })
    await nextTick()

    expect(wrapper.find('[data-testid="hu-dialog"]').attributes('inert')).toBe('')

    wrapper.unmount()
  })
  it('renders the current image, progress and zoom value', () => {
    const wrapper = mountViewer()
    expect(wrapper.find('[data-gr-image-viewer-image]').attributes('src')).toBe('/a.jpg')
    expect(wrapper.find('[data-gr-image-viewer-progress]').text()).toBe('1 / 2')
    expect(wrapper.find('[data-gr-image-viewer-zoom-value]').text()).toBe('100%')
  })

  it('zoom in/out updates the zoom value (useZoomPan)', async () => {
    const wrapper = mountViewer()
    await wrapper.find('[data-gr-image-viewer-zoom-in]').trigger('click')
    expect(wrapper.find('[data-gr-image-viewer-zoom-value]').text()).toBe('120%')
    await wrapper.find('[data-gr-image-viewer-zoom-reset]').trigger('click')
    expect(wrapper.find('[data-gr-image-viewer-zoom-value]').text()).toBe('100%')
  })

  it('rotate buttons emit rotate with cumulative degrees', async () => {
    const wrapper = mountViewer()
    const viewer = wrapper.findComponent(GrImageViewer)
    await wrapper.find('[data-gr-image-viewer-rotate-right]').trigger('click')
    await wrapper.find('[data-gr-image-viewer-rotate-right]').trigger('click')
    expect(viewer.emitted('rotate')?.at(-1)).toEqual([180])
  })

  it('switches image via next/prev (index management)', async () => {
    const wrapper = mountViewer()
    await wrapper.find('[data-gr-image-viewer-next]').trigger('click')
    expect(wrapper.find('[data-gr-image-viewer-image]').attributes('src')).toBe('/b.jpg')
    expect(wrapper.find('[data-gr-image-viewer-progress]').text()).toBe('2 / 2')
  })

  it('keyboard: ArrowRight switches (useViewerKeyboard)', async () => {
    const wrapper = mountViewer()
    const dialog = wrapper.find('[data-testid="hu-dialog"]')

    await dialog.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.find('[data-gr-image-viewer-image]').attributes('src')).toBe('/b.jpg')
  })

  // Esc идёт через общий стек слоёв, а не через локальный `@keydown`, поэтому
  // и проверяется настоящим событием на `window`, а не триггером по элементу.
  it('Escape закрывает просмотрщик через общий стек слоёв', async () => {
    const wrapper = mountViewer()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await nextTick()

    expect(wrapper.find('[data-gr-image-viewer-image]').exists()).toBe(false)
  })

  it('close button closes the viewer', async () => {
    const wrapper = mountViewer()
    await wrapper.find('[data-gr-image-viewer-close]').trigger('click')
    await nextTick()
    expect(wrapper.find('[data-gr-image-viewer-image]').exists()).toBe(false)
  })
})

describe('GrImageViewer — доступное имя слоя', () => {
  // `role="dialog" aria-modal="true"` без имени: диктор объявит «диалог» и всё,
  // axe роняет это как `aria-dialog-name`.
  it('диалог называет себя из локали', () => {
    const wrapper = mountViewer()

    expect(wrapper.get('[data-testid="hu-dialog"]').attributes('aria-label')).toBe('Image viewer')

    wrapper.unmount()
  })

  it('ariaLabel перекрывает имя из локали', () => {
    const wrapper = mountViewer({ 'aria-label': undefined, 'ariaLabel': 'Фотографии объекта' })

    expect(wrapper.get('[data-testid="hu-dialog"]').attributes('aria-label')).toBe('Фотографии объекта')

    wrapper.unmount()
  })
})

describe('GrImageViewer — альтернативный текст', () => {
  function mountWith(urlList: unknown[]) {
    const Harness = defineComponent({
      components: { GrImageViewer },
      setup: () => ({ open: ref(true), urlList }),
      template: '<GrImageViewer v-model="open" :url-list="urlList" show-progress />',
    })

    return mount(Harness, { global: { stubs: { teleport: true } } })
  }

  // `alt=""` был захардкожен, а `urlList: string[]` не позволял передать текст
  // в принципе: компонент, чьё содержимое — только картинка, был пуст для
  // незрячего пользователя.
  it('объект {src, alt} доносит alt до изображения', () => {
    const wrapper = mountWith([
      { src: '/plan.png', alt: 'План второго этажа' },
      { src: '/facade.png', alt: 'Фасад со стороны двора' },
    ])

    expect(wrapper.get('[data-gr-image-viewer-image]').attributes('alt')).toBe('План второго этажа')

    wrapper.unmount()
  })

  it('строки в списке продолжают работать — alt пустой', () => {
    const wrapper = mountWith(['/a.jpg', '/b.jpg'])

    const img = wrapper.get('[data-gr-image-viewer-image]')
    expect(img.attributes('src')).toBe('/a.jpg')
    expect(img.attributes('alt')).toBe('')

    wrapper.unmount()
  })

  it('смешанный список тоже допустим', async () => {
    const wrapper = mountWith(['/a.jpg', { src: '/b.jpg', alt: 'Второй кадр' }])

    await wrapper.get('[data-gr-image-viewer-next]').trigger('click')

    expect(wrapper.get('[data-gr-image-viewer-image]').attributes('alt')).toBe('Второй кадр')

    wrapper.unmount()
  })
})

describe('GrImageViewer — изменение списка', () => {
  function mountGallery(initial: string[]) {
    const urlList = ref<string[]>(initial)
    const Harness = defineComponent({
      components: { GrImageViewer },
      setup: () => ({ open: ref(true), urlList }),
      template: '<GrImageViewer v-model="open" :url-list="urlList" show-progress />',
    })

    const wrapper = mount(Harness, { global: { stubs: { teleport: true } } })
    return { wrapper, urlList }
  }

  // `watch(urlList, deep)` дергал `syncIndexFromInitial()`: догрузка следующей
  // страницы галереи отбрасывала на `initialIndex` и сбрасывала зум.
  it('догрузка кадров не сдвигает текущий и не сбрасывает зум', async () => {
    const { wrapper, urlList } = mountGallery(['/a.jpg', '/b.jpg'])

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
    const { wrapper, urlList } = mountGallery(['/a.jpg', '/b.jpg'])

    await wrapper.get('[data-gr-image-viewer-next]').trigger('click')

    urlList.value = ['/new.jpg', '/a.jpg', '/b.jpg']
    await nextTick()

    expect(wrapper.get('[data-gr-image-viewer-image]').attributes('src')).toBe('/b.jpg')
    expect(wrapper.get('[data-gr-image-viewer-progress]').text()).toBe('3 / 3')

    wrapper.unmount()
  })

  it('исчезнувший кадр — держимся позиции, а не прыгаем на initialIndex', async () => {
    const { wrapper, urlList } = mountGallery(['/a.jpg', '/b.jpg', '/c.jpg'])

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
  it('по умолчанию живёт на модальном слое шкалы', () => {
    const wrapper = mountViewer()

    expect(wrapper.get('[data-testid="hu-dialog"]').attributes('style')).toContain('var(--gr-z-modal)')

    wrapper.unmount()
  })

  it('проп zIndex остаётся escape-hatch’ем', () => {
    const wrapper = mountViewer({ zIndex: 4200 })

    expect(wrapper.get('[data-testid="hu-dialog"]').attributes('style')).toContain('4200')

    wrapper.unmount()
  })
})

describe('GrImageViewer — событие смены кадра и живой регион', () => {
  it('смена кадра эмитит change с новым индексом', async () => {
    const wrapper = mountViewer()
    const viewer = wrapper.findComponent(GrImageViewer)

    await wrapper.find('[data-gr-image-viewer-next]').trigger('click')

    expect(viewer.emitted('change')?.[0]).toEqual([1])

    wrapper.unmount()
  })

  // Регион существует с первого рендера и пуст: регион, появляющийся сразу с
  // текстом, часть AT не объявляет вовсе.
  it('живой регион пуст до первой смены и получает позицию после неё', async () => {
    const wrapper = mountViewer()
    const live = wrapper.get('[data-gr-image-viewer-live]')

    expect(live.attributes('role')).toBe('status')
    expect(live.attributes('aria-live')).toBe('polite')
    expect(live.text()).toBe('')

    await wrapper.find('[data-gr-image-viewer-next]').trigger('click')

    expect(wrapper.get('[data-gr-image-viewer-live]').text()).toBe('Image 2 of 2')

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
