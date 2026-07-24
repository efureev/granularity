import { mount } from '@vue/test-utils'
import { defineComponent, reactive, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import GrForm from '../GrForm.vue'
import GrFormField from '../../GrFormField/GrFormField.vue'
import GrInput from '../../GrInput/GrInput.vue'
import type { GrFormRules } from '../validation'

// jsdom не реализует layout; глушим scrollIntoView, чтобы scroll-to-error не падал.
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn()
})
afterEach(() => {
  vi.restoreAllMocks()
})

function makeHarness(rules: GrFormRules, initial: Record<string, string> = { email: '', name: '' }) {
  return defineComponent({
    components: { GrForm, GrFormField, GrInput },
    setup() {
      const model = reactive({ ...initial })
      const formRef = ref<InstanceType<typeof GrForm>>()
      const submitted = ref(0)
      return { model, rules, formRef, submitted, onSubmit: () => { submitted.value++ } }
    },
    template: `
      <GrForm ref="formRef" :model="model" :rules="rules" @submit="onSubmit">
        <GrFormField name="email" label="Email">
          <GrInput v-model="model.email" />
        </GrFormField>
        <GrFormField name="name" label="Name">
          <GrInput v-model="model.name" />
        </GrFormField>
        <button type="submit">Submit</button>
      </GrForm>
    `,
  })
}

const requiredRules: GrFormRules = {
  email: [{ required: true, type: 'email' }],
  name: [{ required: true }],
}

function errorTexts(wrapper: ReturnType<typeof mount>): string[] {
  return wrapper.findAll('[data-gr-form-field-error]').map(w => w.text())
}

describe('GrForm', () => {
  it('validate() раскладывает ошибки по полям и не эмитит submit при невалидной форме', async () => {
    const wrapper = mount(makeHarness(requiredRules))
    const form = wrapper.vm.formRef!

    const valid = await form.validate()
    await wrapper.vm.$nextTick()

    expect(valid).toBe(false)
    expect(errorTexts(wrapper)).toEqual(['This field is required', 'This field is required'])
    expect(wrapper.vm.submitted).toBe(0)
  })

  it('submit проходит и эмитит event при валидной модели', async () => {
    const wrapper = mount(makeHarness(requiredRules, { email: 'a@b.co', name: 'Alan' }))

    await wrapper.get('form').trigger('submit')
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(errorTexts(wrapper)).toEqual([])
    expect(wrapper.vm.submitted).toBe(1)
  })

  it('маркер обязательности (*) выводится из правил required', () => {
    const wrapper = mount(makeHarness(requiredRules))
    // Оба поля required по правилам → два маркера.
    expect(wrapper.findAll('[data-gr-form-field-required]')).toHaveLength(2)
  })

  it('контрол получает aria-invalid из контекста поля при ошибке формы', async () => {
    const wrapper = mount(makeHarness(requiredRules))
    await wrapper.vm.formRef!.validate()
    await wrapper.vm.$nextTick()
    const inputs = wrapper.findAll('input')
    expect(inputs[0].attributes('aria-invalid')).toBe('true')
  })

  it('валидация по blur (focusout всплывает от контрола)', async () => {
    const wrapper = mount(makeHarness({ email: [{ required: true, type: 'email', trigger: 'blur' }], name: [] }))

    // Пусто + blur → ошибка required.
    await wrapper.get('[data-gr-form-field] input').trigger('focusout')
    await wrapper.vm.$nextTick()
    expect(errorTexts(wrapper)).toEqual(['This field is required'])
  })

  it('ошибка снимается/обновляется по мере исправления значения (re-validate on change)', async () => {
    const wrapper = mount(makeHarness(requiredRules))
    await wrapper.vm.formRef!.validate()
    await wrapper.vm.$nextTick()
    // Оба поля пустые → две ошибки required.
    expect(errorTexts(wrapper)).toEqual(['This field is required', 'This field is required'])

    // Исправляем name (валидно) и вводим невалидный email → name-ошибка уходит,
    // email-ошибка ре-валидируется и обновляется на формат.
    await wrapper.findAll('input')[1].setValue('Alan')
    await wrapper.findAll('input')[0].setValue('abc')
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(errorTexts(wrapper)).toEqual(['Enter a valid email'])
  })

  it('clearValidate() и resetFields() очищают ошибки', async () => {
    const wrapper = mount(makeHarness(requiredRules, { email: 'x', name: 'y' }))
    const form = wrapper.vm.formRef!
    await form.validate()
    await wrapper.vm.$nextTick()
    expect(errorTexts(wrapper).length).toBeGreaterThan(0)

    form.clearValidate()
    await wrapper.vm.$nextTick()
    expect(errorTexts(wrapper)).toEqual([])

    // resetFields возвращает начальные значения.
    await form.validate()
    await wrapper.vm.$nextTick()
    form.resetFields()
    await wrapper.vm.$nextTick()
    expect(errorTexts(wrapper)).toEqual([])
    expect(wrapper.vm.model.email).toBe('x')
  })

  it('явный проп error на GrFormField перекрывает форму', async () => {
    const Harness = defineComponent({
      components: { GrForm, GrFormField, GrInput },
      setup() {
        const model = reactive({ email: '' })
        return { model, rules: { email: [{ required: true }] } }
      },
      template: `
        <GrForm :model="model" :rules="rules">
          <GrFormField name="email" error="Custom override"><GrInput v-model="model.email" /></GrFormField>
        </GrForm>
      `,
    })
    const wrapper = mount(Harness)
    expect(errorTexts(wrapper)).toEqual(['Custom override'])
  })
})
