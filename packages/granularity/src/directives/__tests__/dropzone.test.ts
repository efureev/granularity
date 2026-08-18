import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { FileValidationError } from '../../fileValidation'
import { resetGranularityDom } from '../../testing'
import { vDropzone } from '../dropzone'

import type { FileValidator } from '../../fileValidation'
import type { DropzoneBindingValue, DropzoneOnFiles } from '../dropzone'

/**
 * Тесты `v-dropzone`.
 *
 * `DragEvent` в jsdom не конструктор, но директива читает у события только
 * `dataTransfer`, `preventDefault` и `stopPropagation` — значит хватает обычного
 * `Event` с дописанным переносом. Это и проверяет заодно, что директива не
 * полагается на браузерный тип события.
 */

const Harness = defineComponent({
  name: 'HarnessDropzone',
  directives: { dropzone: vDropzone },
  props: {
    binding: { type: [Function, Object] as unknown as () => DropzoneBindingValue, required: true },
  },
  template: '<div v-dropzone="binding" data-zone><span data-child>внутри</span></div>',
})

function fileList(files: File[]): FileList {
  return Object.assign(files.slice(), { item: (i: number) => files[i] ?? null })
}

/** Пустой обработчик там, где тесту важно не «сколько раз», а «не упало». */
const noop: DropzoneOnFiles = () => {}

/** Событие переноса: настоящего `DragEvent` в jsdom нет. */
function dragEvent(type: string, files: File[] = []): Event {
  const event = new Event(type, { bubbles: true, cancelable: true })
  const dataTransfer = { files: fileList(files), dropEffect: '' }

  Object.defineProperty(event, 'dataTransfer', { value: dataTransfer })

  return event
}

const sample = (name = 'a.pdf') => new File(['x'], name, { type: 'application/pdf' })

function mountZone(binding: DropzoneBindingValue) {
  return mount(Harness, { props: { binding }, attachTo: document.body })
}

const zoneOf = (wrapper: ReturnType<typeof mountZone>) => wrapper.get('[data-zone]').element as HTMLElement

afterEach(() => {
  resetGranularityDom()
})

describe('vDropzone', () => {
  it('отдаёт файлы обработчику и помечает зону в DOM', async () => {
    const onFiles = vi.fn()
    const wrapper = mountZone(onFiles)
    const zone = zoneOf(wrapper)

    expect(zone.dataset.grDropzone).toBe('true')

    zone.dispatchEvent(dragEvent('drop', [sample()]))
    await nextTick()

    expect(onFiles).toHaveBeenCalledTimes(1)
    expect(onFiles.mock.calls[0]?.[0]).toHaveLength(1)

    wrapper.unmount()
  })

  /**
   * Счётчик вложенности — единственное лечение мигающей подсветки.
   *
   * `dragleave` прилетает при каждом переходе курсора на дочерний узел, и без
   * счётчика зона гасла бы, пока курсор ещё над ней. Проверяем, что подсветка
   * держится на промежуточном уходе и снимается только на последнем.
   */
  it('подсветка держится, пока курсор не покинул зону целиком', async () => {
    const states: boolean[] = []
    const wrapper = mountZone({
      onFiles: vi.fn(),
      onStateChange: ({ isOver }) => states.push(isOver),
    })
    const zone = zoneOf(wrapper)

    zone.dispatchEvent(dragEvent('dragenter'))
    zone.dispatchEvent(dragEvent('dragenter'))

    expect(zone.classList.contains('gr-dropzone--over')).toBe(true)
    expect(zone.dataset.grDropzoneOver).toBe('true')

    zone.dispatchEvent(dragEvent('dragleave'))
    expect(zone.classList.contains('gr-dropzone--over')).toBe(true)

    zone.dispatchEvent(dragEvent('dragleave'))
    expect(zone.classList.contains('gr-dropzone--over')).toBe(false)
    // Маркер снимается, а не гасится в `false`: селектор `[data-gr-dropzone-over]`
    // у потребителя должен перестать совпадать, а не совпадать со значением.
    expect(zone.dataset.grDropzoneOver).toBeUndefined()

    // Коллбек зовётся на смене состояния, а не на каждом событии.
    expect(states).toEqual([true, false])

    wrapper.unmount()
  })

  it('на dragover выставляет dropEffect: без него курсор показывает запрет', () => {
    const wrapper = mountZone(noop)
    const event = dragEvent('dragover')

    zoneOf(wrapper).dispatchEvent(event)

    expect((event as unknown as DragEvent).dataTransfer?.dropEffect).toBe('copy')

    wrapper.unmount()
  })

  it('drop гасит подсветку, даже если dragleave не пришёл', () => {
    const wrapper = mountZone(noop)
    const zone = zoneOf(wrapper)

    zone.dispatchEvent(dragEvent('dragenter'))
    zone.dispatchEvent(dragEvent('drop', [sample()]))

    expect(zone.classList.contains('gr-dropzone--over')).toBe(false)

    wrapper.unmount()
  })

  /**
   * Непрошедшие валидацию файлы не должны доехать до обработчика.
   *
   * Иначе валидатор превращается в украшение: компонент получит набор, который
   * сам же и отверг, и решать придётся ему повторно.
   */
  it('при ошибке валидации зовётся onError и не зовётся onFiles', async () => {
    const onFiles = vi.fn()
    const onError = vi.fn()
    const reject: FileValidator = () => [{ code: 'accept', message: 'Не тот тип' }]

    const wrapper = mountZone({ onFiles, onError, validators: [reject] })

    zoneOf(wrapper).dispatchEvent(dragEvent('drop', [sample()]))
    await nextTick()
    await nextTick()

    expect(onFiles).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0]?.[0]).toBeInstanceOf(FileValidationError)

    wrapper.unmount()
  })

  it('multiple: false оставляет один файл', async () => {
    const onFiles = vi.fn()
    const wrapper = mountZone({ onFiles, multiple: false })

    zoneOf(wrapper).dispatchEvent(dragEvent('drop', [sample('a.pdf'), sample('b.pdf')]))
    await nextTick()

    expect(onFiles.mock.calls[0]?.[0]).toHaveLength(1)

    wrapper.unmount()
  })

  it('пустой перенос обработчик не будит', async () => {
    const onFiles = vi.fn()
    const wrapper = mountZone(onFiles)

    zoneOf(wrapper).dispatchEvent(dragEvent('drop', []))
    await nextTick()

    expect(onFiles).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('выключенная директива не реагирует ни на drop, ни на подсветку', async () => {
    const onFiles = vi.fn()
    const wrapper = mountZone({ onFiles, enabled: false })
    const zone = zoneOf(wrapper)

    zone.dispatchEvent(dragEvent('dragenter'))
    zone.dispatchEvent(dragEvent('drop', [sample()]))
    await nextTick()

    expect(zone.classList.contains('gr-dropzone--over')).toBe(false)
    expect(onFiles).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('смена overClass на лету переносит подсветку на новый класс', async () => {
    const onFiles = vi.fn()
    const wrapper = mountZone({ onFiles, overClass: 'is-over' })
    const zone = zoneOf(wrapper)

    zone.dispatchEvent(dragEvent('dragenter'))
    expect(zone.classList.contains('is-over')).toBe(true)

    await wrapper.setProps({ binding: { onFiles, overClass: 'ring ring-2' } })
    await nextTick()

    expect(zone.classList.contains('is-over')).toBe(false)
    // Класс из нескольких токенов — `classList` не принимает строку с пробелом,
    // и без токенизации здесь был бы `InvalidCharacterError`.
    expect(zone.classList.contains('ring')).toBe(true)
    expect(zone.classList.contains('ring-2')).toBe(true)

    wrapper.unmount()
  })

  it('после размонтирования не остаётся ни слушателей, ни следов в DOM', async () => {
    const onFiles = vi.fn()
    const wrapper = mountZone(onFiles)
    const zone = zoneOf(wrapper)

    zone.dispatchEvent(dragEvent('dragenter'))
    wrapper.unmount()

    expect(zone.classList.contains('gr-dropzone--over')).toBe(false)
    expect(zone.dataset.grDropzone).toBeUndefined()

    zone.dispatchEvent(dragEvent('drop', [sample()]))
    await nextTick()

    expect(onFiles).not.toHaveBeenCalled()
  })
})
