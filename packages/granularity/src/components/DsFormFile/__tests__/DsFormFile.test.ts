import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { describe, expect, it } from 'vitest'

import DsFormFile from '../DsFormFile.vue'
import type { DsFormFileError } from '../DsFormFile.vue'

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

describe('DsFormFile', () => {
  it('multiple=false: выбор валидного файла отображает имя и позволяет очистить', async () => {
    const Host = defineComponent({
      components: { DsFormFile },
      setup() {
        const model = ref<File | null>(null)
        return { model }
      },
      template: `
        <DsFormFile
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
    expect(wrapper.find('[data-ds-form-file-clear-btn]').exists()).toBe(false)

    const input = wrapper.get('[data-ds-form-file-input]').element as HTMLInputElement
    expect(input.accept).toBe('application/pdf,.pdf')
    const file = new File(['hello'], 'receipt.pdf', { type: 'application/pdf' })
    setInputFiles(input, [file])

    await wrapper.get('[data-ds-form-file-input]').trigger('change')
    await nextTick()

    expect(wrapper.text()).toContain('receipt.pdf')
    expect(wrapper.find('[data-ds-form-file-clear-btn]').exists()).toBe(true)

    await wrapper.get('[data-ds-form-file-clear-btn]').trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('Empty')
    expect(wrapper.find('[data-ds-form-file-clear-btn]').exists()).toBe(false)
  })

  it('multiple=false: при ошибке валидации modelValue не обновляется', async () => {
    const Host = defineComponent({
      components: { DsFormFile },
      setup() {
        const model = ref<File | null>(null)
        const errors = ref<DsFormFileError[]>([])
        return { model, errors }
      },
      template: `
        <DsFormFile
          :model-value="model"
          accept="application/pdf,.pdf"
          @update:modelValue="(v) => (model = v)"
          @update:errors="(e) => (errors = e)"
        />
      `,
    })

    const wrapper = mount(Host)
    const input = wrapper.get('[data-ds-form-file-input]').element as HTMLInputElement

    const bad = new File(['x'], 'x.txt', { type: 'text/plain' })
    setInputFiles(input, [bad])

    await wrapper.get('[data-ds-form-file-input]').trigger('change')
    await nextTick()

    expect((wrapper.vm as any).model).toBe(null)
    expect(wrapper.find('[data-ds-form-file-errors]').exists()).toBe(true)
    expect(((wrapper.vm as any).errors as DsFormFileError[]).length).toBeGreaterThan(0)
  })

  it('multiple=true: выбор нескольких файлов отображает список, можно удалить один и очистить все', async () => {
    const Host = defineComponent({
      components: { DsFormFile },
      setup() {
        const model = ref<File[]>([])
        return { model }
      },
      template: `
        <DsFormFile
          multiple
          :model-value="model"
          placeholder="Empty"
          @update:modelValue="(v) => (model = v)"
        />
      `,
    })

    const wrapper = mount(Host)
    expect(wrapper.text()).toContain('Empty')

    const input = wrapper.get('[data-ds-form-file-input]').element as HTMLInputElement
    const a = new File(['a'], 'a.txt', { type: 'text/plain' })
    const b = new File(['b'], 'b.txt', { type: 'text/plain' })
    setInputFiles(input, [a, b])

    await wrapper.get('[data-ds-form-file-input]').trigger('change')
    await nextTick()

    expect((wrapper.vm as any).model).toHaveLength(2)
    expect(wrapper.findAll('[data-ds-form-file-item]').length).toBe(2)

    await wrapper.findAll('[data-ds-form-file-item-remove]')[0].trigger('click')
    await nextTick()

    expect((wrapper.vm as any).model).toHaveLength(1)
    expect(wrapper.findAll('[data-ds-form-file-item]').length).toBe(1)

    await wrapper.get('[data-ds-form-file-clear-all-btn]').trigger('click')
    await nextTick()

    expect((wrapper.vm as any).model).toHaveLength(0)
    expect(wrapper.text()).toContain('Empty')
  })
})
