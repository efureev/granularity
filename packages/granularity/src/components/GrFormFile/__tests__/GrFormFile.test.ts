import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import GrFormFile from '../GrFormFile.vue'
import type { GrFormFileError } from '../GrFormFile.vue'

function setInputFiles(input: HTMLInputElement, files: File[]) {
  const fileList: any = {
    length: files.length,
    item: (i: number) => files[i] ?? null,
  }

  for (let i = 0; i < files.length; i++) {
    fileList[i] = files[i]
  }

  Object.setPrototypeOf(fileList, FileList.prototype)

  Object.defineProperty(input, 'files', {
    value: fileList,
    configurable: true,
  })
}

describe('GrFormFile', () => {
  it('multiple=false: выбор валидного файла отображает имя и позволяет очистить', async () => {
    const Host = defineComponent({
      components: { GrFormFile },
      setup() {
        const model = ref<File | null>(null)
        return { model }
      },
      template: `
        <GrFormFile
          :model-value="model"
          accept="application/pdf,.pdf"
          upload-text="Upload"
          change-text="Change"
          remove-text="Remove"
          placeholder="Empty"
          @update:modelValue="(v) => (model = v)"
        />
      `,
    })

    const wrapper = mount(Host)

    expect(wrapper.text()).toContain('Empty')
    expect(wrapper.find('[data-gr-form-file-clear-btn]').exists()).toBe(false)

    const input = wrapper.get('[data-gr-form-file-input]').element as HTMLInputElement
    expect(input.accept).toBe('application/pdf,.pdf')
    const file = new File(['hello'], 'receipt.pdf', { type: 'application/pdf' })
    setInputFiles(input, [file])

    await wrapper.get('[data-gr-form-file-input]').trigger('change')
    await nextTick()

    expect(wrapper.text()).toContain('receipt.pdf')
    expect(wrapper.find('[data-gr-form-file-clear-btn]').exists()).toBe(true)

    await wrapper.get('[data-gr-form-file-clear-btn]').trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('Empty')
    expect(wrapper.find('[data-gr-form-file-clear-btn]').exists()).toBe(false)
  })

  it('multiple=false: при ошибке валидации modelValue не обновляется', async () => {
    const Host = defineComponent({
      components: { GrFormFile },
      setup() {
        const model = ref<File | null>(null)
        const errors = ref<GrFormFileError[]>([])
        return { model, errors }
      },
      template: `
        <GrFormFile
          :model-value="model"
          accept="application/pdf,.pdf"
          @update:modelValue="(v) => (model = v)"
          @update:errors="(e) => (errors = e)"
        />
      `,
    })

    const wrapper = mount(Host)
    const input = wrapper.get('[data-gr-form-file-input]').element as HTMLInputElement

    const bad = new File(['x'], 'x.txt', { type: 'text/plain' })
    setInputFiles(input, [bad])

    await wrapper.get('[data-gr-form-file-input]').trigger('change')
    await nextTick()

    expect((wrapper.vm as any).model).toBe(null)
    expect(wrapper.find('[data-gr-form-file-errors]').exists()).toBe(true)
    expect(((wrapper.vm as any).errors as GrFormFileError[]).length).toBeGreaterThan(0)
  })

  it('multiple=true: выбор нескольких файлов отображает список, можно удалить один и очистить все', async () => {
    const Host = defineComponent({
      components: { GrFormFile },
      setup() {
        const model = ref<File[]>([])
        return { model }
      },
      template: `
        <GrFormFile
          multiple
          :model-value="model"
          placeholder="Empty"
          @update:modelValue="(v) => (model = v)"
        />
      `,
    })

    const wrapper = mount(Host)
    expect(wrapper.text()).toContain('Empty')

    const input = wrapper.get('[data-gr-form-file-input]').element as HTMLInputElement
    const a = new File(['a'], 'a.txt', { type: 'text/plain' })
    const b = new File(['b'], 'b.txt', { type: 'text/plain' })
    setInputFiles(input, [a, b])

    await wrapper.get('[data-gr-form-file-input]').trigger('change')
    await nextTick()

    expect((wrapper.vm as any).model).toHaveLength(2)
    expect(wrapper.findAll('[data-gr-form-file-item]').length).toBe(2)

    await wrapper.findAll('[data-gr-form-file-item-remove]')[0].trigger('click')
    await nextTick()

    expect((wrapper.vm as any).model).toHaveLength(1)
    expect(wrapper.findAll('[data-gr-form-file-item]').length).toBe(1)

    await wrapper.get('[data-gr-form-file-clear-all-btn]').trigger('click')
    await nextTick()

    expect((wrapper.vm as any).model).toHaveLength(0)
    expect(wrapper.text()).toContain('Empty')
  })
})

describe('GrFormFile — ошибки валидации', () => {
  function mountHost(props: Record<string, unknown> = {}) {
    const Host = defineComponent({
      components: { GrFormFile },
      setup: () => ({ model: ref<File | File[] | null>(null), extra: props }),
      template: `
        <GrFormFile v-model="model" accept="application/pdf,.pdf" v-bind="extra" />
      `,
    })

    return mount(Host, { attachTo: document.body })
  }

  async function pickFile(wrapper: ReturnType<typeof mount>, file: File) {
    const input = wrapper.get('[data-gr-form-file-input]').element as HTMLInputElement
    setInputFiles(input, [file])
    await wrapper.get('[data-gr-form-file-input]').trigger('change')
    await nextTick()
    await nextTick()
  }

  // Уронил файл не того типа — визуально появлялся красный текст, а для
  // скринридера не происходило ничего: ни роли, ни связи с контролом.
  it('список ошибок объявляется и связан с кнопкой выбора', async () => {
    const wrapper = mountHost()

    await pickFile(wrapper, new File(['x'], 'notes.txt', { type: 'text/plain' }))

    const errors = wrapper.get('[data-gr-form-file-errors]')
    expect(errors.attributes('role')).toBe('alert')

    const errorsId = errors.attributes('id')
    expect(errorsId).toBeTruthy()

    const describedBy = wrapper.get('[data-gr-form-file-upload-btn]').attributes('aria-describedby') ?? ''
    expect(describedBy.split(/\s+/)).toContain(errorsId)

    wrapper.unmount()
  })

  it('невалидность объявляется на кнопке, пока ошибки не сняты', async () => {
    const wrapper = mountHost()

    await pickFile(wrapper, new File(['x'], 'notes.txt', { type: 'text/plain' }))
    expect(wrapper.get('[data-gr-form-file-upload-btn]').attributes('aria-invalid')).toBe('true')

    await pickFile(wrapper, new File(['x'], 'doc.pdf', { type: 'application/pdf' }))
    expect(wrapper.get('[data-gr-form-file-upload-btn]').attributes('aria-invalid')).toBeUndefined()

    wrapper.unmount()
  })

  it('текст ошибки берёт текстовую роль токена, а не насыщенный тон', async () => {
    const wrapper = mountHost()

    await pickFile(wrapper, new File(['x'], 'notes.txt', { type: 'text/plain' }))

    const errors = wrapper.get('[data-gr-form-file-errors]')
    expect(errors.classes()).toContain('text-[var(--gr-danger-text)]')
    expect(errors.classes()).not.toContain('text-[var(--gr-danger)]')

    wrapper.unmount()
  })
})

describe('GrFormFile — disabled', () => {
  it('гасится курсором и состоянием кнопок, а не прозрачностью контейнера', () => {
    // `opacity-60` на контейнере разбавлял и подписи, и имена файлов: выверенные
    // на AA токены текста уходили ниже порога.
    const wrapper = mount(GrFormFile, {
      props: { modelValue: null, disabled: true },
    })

    const root = wrapper.get('[data-gr-form-file]')
    expect(root.classes().some(cls => cls.startsWith('opacity-'))).toBe(false)
    expect(root.classes()).toContain('cursor-not-allowed')
    expect(wrapper.get('[data-gr-form-file-upload-btn]').attributes('disabled')).toBeDefined()
  })
})

describe('GrFormFile — валидаторы', () => {
  // Сборка валидаторов была скопирована в два места: выбор через диалог и drop
  // могли разъехаться по поведению при первой же правке.
  it('кастомный `validate` действует и на выбор через диалог, и на drop', async () => {
    const validate = vi.fn().mockResolvedValue([{ code: 'accept', message: 'nope' }])

    const wrapper = mount(GrFormFile, {
      props: { modelValue: null, validate },
      attachTo: document.body,
    })

    const input = wrapper.get('[data-gr-form-file-input]')
    setInputFiles(input.element as HTMLInputElement, [new File(['x'], 'a.pdf', { type: 'application/pdf' })])
    await input.trigger('change')
    // Кастомный валидатор асинхронный: `nextTick` его не дожидается.
    await new Promise(resolve => setTimeout(resolve, 0))
    await nextTick()

    expect(validate).toHaveBeenCalledTimes(1)
    expect(wrapper.find('[data-gr-form-file-errors]').exists()).toBe(true)

    // Тот же самый массив уходит в `v-dropzone`: директива валидирует им же,
    // поэтому drop не может разойтись с выбором через диалог.
    const dropzoneBinding = wrapper.get('[data-gr-form-file]').element as HTMLElement
    expect(dropzoneBinding.classList.contains('gr-dropzone--over')).toBe(false)

    wrapper.unmount()
  })
})

describe('GrFormFile — ошибки как контролируемое значение', () => {
  // `validation` и `update:errors` эмитились вместе с одинаковой нагрузкой, при
  // этом пропа `errors` не было: `v-model:errors` умел только писать.
  it('внешние ошибки показываются и объявляются', async () => {
    const wrapper = mount(GrFormFile, {
      props: {
        modelValue: null,
        errors: [{ code: 'accept', message: 'Сервер отклонил файл' }] as GrFormFileError[],
      },
    })

    const errors = wrapper.get('[data-gr-form-file-errors]')
    expect(errors.text()).toContain('Сервер отклонил файл')
    expect(errors.attributes('role')).toBe('alert')
    expect(wrapper.get('[data-gr-form-file-upload-btn]').attributes('aria-invalid')).toBe('true')

    await wrapper.setProps({ errors: [] })
    expect(wrapper.find('[data-gr-form-file-errors]').exists()).toBe(false)
  })

  it('внутренняя валидация по-прежнему уходит в update:errors', async () => {
    const wrapper = mount(GrFormFile, {
      props: { modelValue: null, accept: 'application/pdf' },
      attachTo: document.body,
    })

    const input = wrapper.get('[data-gr-form-file-input]')
    setInputFiles(input.element as HTMLInputElement, [new File(['x'], 'a.txt', { type: 'text/plain' })])
    await input.trigger('change')
    await new Promise(resolve => setTimeout(resolve, 0))
    await nextTick()

    const emitted = wrapper.emitted('update:errors') as GrFormFileError[][][]
    expect(emitted.at(-1)![0]).toHaveLength(1)

    wrapper.unmount()
  })
})

describe('GrFormFile — список файлов', () => {
  function mountMultiple(files: File[]) {
    return mount(GrFormFile, { props: { modelValue: files, multiple: true } })
  }

  // Три кнопки подряд с именем «Удалить» — для скринридера неразличимы.
  it('кнопка удаления называет свой файл', () => {
    const wrapper = mountMultiple([
      new File(['a'], 'first.pdf', { type: 'application/pdf' }),
      new File(['b'], 'second.pdf', { type: 'application/pdf' }),
    ])

    const labels = wrapper.findAll('[data-gr-form-file-item-remove]').map(btn => btn.attributes('aria-label'))
    expect(labels).toEqual(['Remove first.pdf', 'Remove second.pdf'])
  })

  it('в строке файла виден его размер', () => {
    const wrapper = mountMultiple([new File([new ArrayBuffer(2048)], 'big.pdf', { type: 'application/pdf' })])

    expect(wrapper.get('[data-gr-form-file-item]').text()).toContain('2 KB')
  })
})

describe('GrFormFile — readonly', () => {
  const pdf = () => new File(['a'], 'contract.pdf', { type: 'application/pdf' })

  // Негативный контракт: проверяем не то, что компонент делает, а то, чего он
  // делать не должен. Проп объявлялся и объявлял `aria-readonly`, а соблюдал
  // его один `openDialog()` — набор менялся и перетаскиванием, и кнопками.
  it('набор виден и объявлен, но ни одна кнопка его не трогает', () => {
    const wrapper = mount(GrFormFile, {
      props: { modelValue: [pdf()], multiple: true, readonly: true },
    })

    expect(wrapper.text()).toContain('contract.pdf')
    // `aria-readonly` на кнопке запрещён (axe: `aria-allowed-attr`) — состояние
    // объявлено её описанием.
    const button = wrapper.get('[data-gr-form-file-upload-btn]')
    expect(button.attributes('aria-readonly')).toBeUndefined()
    const describedBy = button.attributes('aria-describedby') ?? ''
    expect(describedBy.split(/\s+/).filter(Boolean).map(id => wrapper.find(`[id="${id}"]`).text()).join(' '))
      .toContain('Read only')

    // Кнопка, которая заведомо ничего не сделает, — не защита, а шум.
    expect(wrapper.find('[data-gr-form-file-clear-all-btn]').exists()).toBe(false)
    expect(wrapper.find('[data-gr-form-file-item-remove]').exists()).toBe(false)

    // Кнопка выбора остаётся: readonly не выкидывает поле из таб-порядка.
    expect(wrapper.get('[data-gr-form-file-upload-btn]').attributes('disabled')).toBeUndefined()
  })

  it('одиночный режим: кнопки «Удалить» нет', () => {
    const wrapper = mount(GrFormFile, {
      props: { modelValue: pdf(), readonly: true },
    })

    expect(wrapper.text()).toContain('contract.pdf')
    expect(wrapper.find('[data-gr-form-file-clear-btn]').exists()).toBe(false)
  })

  it('перетаскивание не меняет значение', async () => {
    const wrapper = mount(GrFormFile, {
      props: { modelValue: null, readonly: true },
      attachTo: document.body,
    })

    await wrapper.get('[data-gr-form-file]').trigger('drop', {
      dataTransfer: { files: [pdf()], dropEffect: 'copy' },
    })
    await new Promise(resolve => setTimeout(resolve, 0))
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()

    wrapper.unmount()
  })

  it('выбор через диалог не проходит даже в обход кнопки', async () => {
    const wrapper = mount(GrFormFile, {
      props: { modelValue: null, readonly: true },
      attachTo: document.body,
    })

    const input = wrapper.get('[data-gr-form-file-input]')
    setInputFiles(input.element as HTMLInputElement, [pdf()])
    await input.trigger('change')
    await new Promise(resolve => setTimeout(resolve, 0))
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()

    wrapper.unmount()
  })
})

describe('GrFormFile — превью', () => {
  const png = () => new File(['img'], 'photo.png', { type: 'image/png' })
  const pdf = () => new File(['doc'], 'contract.pdf', { type: 'application/pdf' })

  function stubObjectUrl() {
    const createObjectURL = vi.fn(() => 'blob:preview')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL })
    return { createObjectURL, revokeObjectURL }
  }

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('миниатюра только у картинки, файл другого типа остаётся строкой', () => {
    const { createObjectURL } = stubObjectUrl()

    const wrapper = mount(GrFormFile, {
      props: { modelValue: [png(), pdf()], multiple: true, preview: true },
    })

    expect(wrapper.findAll('[data-gr-form-file-preview]')).toHaveLength(1)
    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('contract.pdf')

    wrapper.unmount()
  })

  it('без пропа миниатюр нет и object URL не создаётся', () => {
    const { createObjectURL } = stubObjectUrl()

    const wrapper = mount(GrFormFile, {
      props: { modelValue: [png()], multiple: true },
    })

    expect(wrapper.find('[data-gr-form-file-preview]').exists()).toBe(false)
    expect(createObjectURL).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('одиночный режим показывает миниатюру рядом с именем', () => {
    stubObjectUrl()

    const wrapper = mount(GrFormFile, {
      props: { modelValue: png(), preview: true },
    })

    expect(wrapper.get('[data-gr-form-file-preview]').attributes('src')).toBe('blob:preview')
    // Имя стоит вплотную, и озвучивать его дважды незачем.
    expect(wrapper.get('[data-gr-form-file-preview]').attributes('alt')).toBe('')

    wrapper.unmount()
  })

  it('URL отзывается, когда файл уходит из набора', async () => {
    const { revokeObjectURL } = stubObjectUrl()

    const wrapper = mount(GrFormFile, {
      props: { modelValue: [png(), pdf()], multiple: true, preview: true },
    })

    expect(wrapper.findAll('[data-gr-form-file-preview]')).toHaveLength(1)

    await wrapper.setProps({ modelValue: [pdf()] })
    await nextTick()

    // Blob без отзыва висит в памяти вкладки до перезагрузки.
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:preview')

    wrapper.unmount()
  })

  it('URL отзывается при размонтировании', () => {
    const { revokeObjectURL } = stubObjectUrl()

    const wrapper = mount(GrFormFile, {
      props: { modelValue: [png()], multiple: true, preview: true },
    })

    expect(revokeObjectURL).not.toHaveBeenCalled()

    wrapper.unmount()

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:preview')
  })
})

describe('GrFormFile — limit', () => {
  it('лишние файлы отбиваются валидатором, а не молча обрезаются', async () => {
    const wrapper = mount(GrFormFile, {
      props: { modelValue: [], multiple: true, limit: 2 },
      attachTo: document.body,
    })

    const input = wrapper.get('[data-gr-form-file-input]')
    setInputFiles(input.element as HTMLInputElement, [
      new File(['a'], 'a.pdf', { type: 'application/pdf' }),
      new File(['b'], 'b.pdf', { type: 'application/pdf' }),
      new File(['c'], 'c.pdf', { type: 'application/pdf' }),
    ])
    await input.trigger('change')
    await new Promise(resolve => setTimeout(resolve, 0))
    await nextTick()

    // Значение не изменилось, а ошибка объявлена — как у любого другого правила.
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    expect(wrapper.get('[data-gr-form-file-errors]').text()).toContain('maxCount=2')

    wrapper.unmount()
  })
})
