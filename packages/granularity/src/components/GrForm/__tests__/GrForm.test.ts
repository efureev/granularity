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

/**
 * Видимые тексты ошибок. Контейнер ошибки у `GrFormField` живёт в DOM всегда
 * (иначе AT не перечитывает описание после смены `aria-describedby`), поэтому
 * пустые отбрасываем — интересны сообщения, а не узлы.
 */
function errorTexts(wrapper: ReturnType<typeof mount>): string[] {
  return wrapper.findAll('[data-gr-form-field-error]').map(w => w.text()).filter(Boolean)
}

/** Валидация асинхронна: даём отработать промисам правил и перерисовке. */
async function flushValidation(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0))
  await new Promise(resolve => setTimeout(resolve, 0))
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

describe('GrForm — обязательность из поля', () => {
  const Harness = defineComponent({
    components: { GrForm, GrFormField, GrInput },
    setup() {
      const model = reactive({ nickname: '' })
      const submitted = ref(0)
      const invalidPayloads = ref<Record<string, string>[]>([])
      return {
        model,
        submitted,
        invalidPayloads,
        onSubmit: () => { submitted.value++ },
        onInvalid: (errors: Record<string, string>) => { invalidPayloads.value.push(errors) },
      }
    },
    template: `
      <GrForm :model="model" @submit="onSubmit" @invalid="onInvalid">
        <GrFormField name="nickname" label="Nickname" required>
          <GrInput v-model="model.nickname" />
        </GrFormField>
        <button type="submit">Submit</button>
      </GrForm>
    `,
  })

  it('`GrFormField required` без правила блокирует submit и показывает сообщение', async () => {
    const wrapper = mount(Harness)

    await wrapper.get('button[type="submit"]').trigger('submit')
    await flushValidation()

    // Раньше звёздочка была, а submit проходил: обязательность и валидация
    // жили в разных местах.
    expect(wrapper.vm.submitted).toBe(0)
    expect(errorTexts(wrapper)).toHaveLength(1)
  })

  it('заполненное поле пропускает submit', async () => {
    const wrapper = mount(Harness)

    wrapper.vm.model.nickname = 'gr'
    await wrapper.get('button[type="submit"]').trigger('submit')
    await flushValidation()

    expect(wrapper.vm.submitted).toBe(1)
    expect(errorTexts(wrapper)).toHaveLength(0)
  })

  it('submit с ошибками эмитит invalid с картой сообщений', async () => {
    const wrapper = mount(Harness)

    await wrapper.get('button[type="submit"]').trigger('submit')
    await flushValidation()

    expect(wrapper.vm.invalidPayloads).toHaveLength(1)
    expect(Object.keys(wrapper.vm.invalidPayloads[0])).toEqual(['nickname'])
  })
})

describe('GrForm — снимок, сброс и состояние', () => {
  function editHarness() {
    return defineComponent({
      components: { GrForm, GrFormField, GrInput },
      setup() {
        const model = reactive<Record<string, unknown>>({ name: '' })
        const formRef = ref<InstanceType<typeof GrForm>>()
        return { model, formRef }
      },
      template: `
        <GrForm ref="formRef" :model="model">
          <GrFormField name="name" label="Name">
            <GrInput v-model="model.name" />
          </GrFormField>
        </GrForm>
      `,
    })
  }

  it('setSnapshot делает resetFields осмысленным в форме редактирования', async () => {
    const wrapper = mount(editHarness())

    // Данные пришли с сервера уже после монтирования — снимок из `setup` пуст.
    wrapper.vm.model.name = 'из базы'
    wrapper.vm.formRef!.setSnapshot()

    wrapper.vm.model.name = 'правка пользователя'
    wrapper.vm.formRef!.resetFields()
    await flushValidation()

    expect(wrapper.vm.model.name).toBe('из базы')
  })

  it('ключ, появившийся после снимка, удаляется, а не превращается в undefined', async () => {
    const wrapper = mount(editHarness())

    wrapper.vm.model.extra = 'появилось позже'
    wrapper.vm.formRef!.resetFields()
    await flushValidation()

    expect('extra' in wrapper.vm.model).toBe(false)
  })

  it('isDirty гаснет после сброса, isValid отражает известные ошибки', async () => {
    const wrapper = mount(editHarness())
    const form = wrapper.vm.formRef!

    expect(form.isDirty).toBe(false)

    wrapper.vm.model.name = 'изменено'
    await flushValidation()
    expect(form.isDirty).toBe(true)

    form.resetFields()
    await flushValidation()
    expect(form.isDirty).toBe(false)
    expect(form.isValid).toBe(true)
  })
})

describe('GrForm — disabled и validating', () => {
  it('disabled формы доезжает до контролов через контекст поля', async () => {
    const Harness = defineComponent({
      components: { GrForm, GrFormField, GrInput },
      props: { disabled: { type: Boolean, default: false } },
      setup() {
        const model = reactive({ name: '' })
        return { model }
      },
      template: `
        <GrForm :model="model" :disabled="disabled">
          <GrFormField name="name" label="Name">
            <GrInput v-model="model.name" />
          </GrFormField>
        </GrForm>
      `,
    })

    const wrapper = mount(Harness, { props: { disabled: true } })

    expect(wrapper.get('input').attributes('disabled')).toBeDefined()

    await wrapper.setProps({ disabled: false })
    expect(wrapper.get('input').attributes('disabled')).toBeUndefined()
  })

  it('асинхронное правило показывает «проверяем» и aria-busy на поле', async () => {
    let release: (() => void) | undefined
    const rules: GrFormRules = {
      login: [{
        validator: () => new Promise<true>((resolve) => {
          release = () => resolve(true)
        }),
      }],
    }

    const Harness = defineComponent({
      components: { GrForm, GrFormField, GrInput },
      setup() {
        const model = reactive({ login: 'gr' })
        const formRef = ref<InstanceType<typeof GrForm>>()
        return { model, rules, formRef }
      },
      template: `
        <GrForm ref="formRef" :model="model" :rules="rules">
          <GrFormField name="login" label="Login">
            <GrInput v-model="model.login" />
          </GrFormField>
        </GrForm>
      `,
    })

    const wrapper = mount(Harness)
    const validating = wrapper.vm.formRef!.validateField('login')
    await flushValidation()

    const field = wrapper.get('[data-gr-form-field]')
    expect(field.attributes('aria-busy')).toBe('true')
    expect(field.find('[data-gr-form-field-validating]').exists()).toBe(true)

    release!()
    await validating
    await flushValidation()

    // Проверка кончилась — состояние снимается, поле снова молчит.
    expect(wrapper.get('[data-gr-form-field]').attributes('aria-busy')).toBeUndefined()
    expect(wrapper.find('[data-gr-form-field-validating]').exists()).toBe(false)
  })
})
