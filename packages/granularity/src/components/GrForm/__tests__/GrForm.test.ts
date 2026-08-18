import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, reactive, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import GrForm from '../GrForm.vue'
import GrFormField from '../../GrFormField/GrFormField.vue'
import GrFormFile from '../../GrFormFile/GrFormFile.vue'
import GrInput from '../../GrInput/GrInput.vue'
import type { GrFormRules } from '../validation'
import type { GrFormInstance } from '..'

// jsdom не реализует layout; глушим scrollIntoView, чтобы scroll-to-error не падал.
// Мок стоит здесь ровно поэтому — и он же однажды скрыл дефект от нас самих:
// у потребителя без такой заглушки форма роняла тест необработанным отказом.
// Случай без мока проверяется отдельно, в самом конце файла.
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
      const formRef = ref<GrFormInstance>()
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
        const formRef = ref<GrFormInstance>()
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

  it('файл переживает снимок и сброс, а не превращается в пустой объект', async () => {
    const wrapper = mount(editHarness())
    const form = wrapper.vm.formRef!
    const original = new File(['pdf'], 'contract.pdf', { type: 'application/pdf' })

    wrapper.vm.model.doc = original
    form.setSnapshot()

    wrapper.vm.model.doc = new File(['other'], 'draft.pdf', { type: 'application/pdf' })
    form.resetFields()
    await flushValidation()

    // JSON-клон терял `File` (у него нет ни перечислимых свойств, ни `toJSON`),
    // и «сброс» клал в модель `{}` — мусор, который ушёл бы на сервер.
    expect(wrapper.vm.model.doc).toBe(original)
  })

  it('isDirty видит подмену файла', async () => {
    const wrapper = mount(editHarness())
    const form = wrapper.vm.formRef!

    wrapper.vm.model.doc = new File(['pdf'], 'contract.pdf', { type: 'application/pdf' })
    form.setSnapshot()
    await flushValidation()
    expect(form.isDirty).toBe(false)

    // Оба файла сериализовались в `{}`, поэтому «поменял документ» было
    // неотличимо от «не трогал».
    wrapper.vm.model.doc = new File(['other'], 'draft.pdf', { type: 'application/pdf' })
    await flushValidation()
    expect(form.isDirty).toBe(true)

    form.resetFields()
    await flushValidation()
    expect(form.isDirty).toBe(false)
  })

  // Снимок строится клоном, а клон отбрасывает функции — значит для внешней
  // модели (`useForm` Inertia, стор) «нет в снимке» означает «это её метод».
  // Без защиты `resetFields()` сносил бы с объекта `post`, `reset`, `errors`,
  // и форма переставала работать молча.
  it('resetFields не удаляет методы внешней модели', async () => {
    const submitSpy = vi.fn()
    const external = reactive({ name: 'Иван', submit: submitSpy, reset: () => {} })

    const wrapper = mount(defineComponent({
      components: { GrForm, GrFormField, GrInput },
      setup() {
        const formRef = ref<GrFormInstance>()
        return { model: external, formRef }
      },
      template: `
        <GrForm ref="formRef" :model="model">
          <GrFormField name="name" label="Имя"><GrInput v-model="model.name" /></GrFormField>
        </GrForm>
      `,
    }))

    wrapper.vm.model.name = 'Пётр'
    wrapper.vm.formRef!.resetFields()
    await flushValidation()

    expect(wrapper.vm.model.name).toBe('Иван')
    expect(typeof wrapper.vm.model.submit).toBe('function')
    expect(typeof wrapper.vm.model.reset).toBe('function')
    expect(wrapper.vm.model.submit).toBe(submitSpy)

    wrapper.unmount()
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

describe('GrForm — файлы правилом формы', () => {
  const rules: GrFormRules = {
    doc: [{ required: true, file: { accept: '.pdf', maxSizeMb: 1 } }],
  }

  function fileHarness() {
    return defineComponent({
      components: { GrForm, GrFormField, GrFormFile },
      setup() {
        const model = reactive<Record<string, unknown>>({ doc: null })
        const formRef = ref<GrFormInstance>()
        const submitted = ref(0)
        return { model, rules, formRef, submitted, onSubmit: () => { submitted.value++ } }
      },
      template: `
        <GrForm ref="formRef" :model="model" :rules="rules" @submit="onSubmit">
          <GrFormField name="doc" label="Contract">
            <GrFormFile v-model="model.doc" accept=".pdf" />
          </GrFormField>
          <button type="submit">Submit</button>
        </GrForm>
      `,
    })
  }

  it('пустое обязательное файловое поле не пускает submit', async () => {
    const wrapper = mount(fileHarness())

    await wrapper.get('button[type="submit"]').trigger('submit')
    await flushValidation()

    expect(wrapper.vm.submitted).toBe(0)
    expect(errorTexts(wrapper)).toEqual(['This field is required'])
  })

  it('ограничение из rules отбивает файл и называет его', async () => {
    const wrapper = mount(fileHarness())

    wrapper.vm.model.doc = new File(['x'], 'photo.png', { type: 'image/png' })
    await wrapper.get('button[type="submit"]').trigger('submit')
    await flushValidation()

    expect(wrapper.vm.submitted).toBe(0)
    // Текст приходит от того же валидатора, что работает внутри поля.
    expect(errorTexts(wrapper)[0]).toContain('photo.png')
  })

  it('размер проверяется тем же правилом', async () => {
    const wrapper = mount(fileHarness())

    wrapper.vm.model.doc = new File([new Uint8Array(2 * 1024 * 1024)], 'big.pdf', { type: 'application/pdf' })
    await wrapper.get('button[type="submit"]').trigger('submit')
    await flushValidation()

    expect(wrapper.vm.submitted).toBe(0)
    expect(errorTexts(wrapper)[0]).toContain('big.pdf')
  })

  it('корректный файл пропускает submit, а исправление снимает ошибку', async () => {
    const wrapper = mount(fileHarness())

    wrapper.vm.model.doc = new File(['x'], 'photo.png', { type: 'image/png' })
    await wrapper.get('button[type="submit"]').trigger('submit')
    await flushValidation()
    expect(errorTexts(wrapper)).toHaveLength(1)

    wrapper.vm.model.doc = new File(['x'], 'contract.pdf', { type: 'application/pdf' })
    await flushValidation()
    // Ре-валидация по change убирает ошибку, не дожидаясь второго submit.
    expect(errorTexts(wrapper)).toEqual([])

    await wrapper.get('button[type="submit"]').trigger('submit')
    await flushValidation()
    expect(wrapper.vm.submitted).toBe(1)
  })

  it('invalid несёт сообщение файлового правила', async () => {
    const Harness = defineComponent({
      components: { GrForm, GrFormField, GrFormFile },
      setup() {
        const model = reactive<Record<string, unknown>>({
          doc: new File(['x'], 'photo.png', { type: 'image/png' }),
        })
        const payloads = ref<Record<string, string>[]>([])
        return { model, rules, payloads, onInvalid: (e: Record<string, string>) => { payloads.value.push(e) } }
      },
      template: `
        <GrForm :model="model" :rules="rules" @invalid="onInvalid">
          <GrFormField name="doc" label="Contract">
            <GrFormFile v-model="model.doc" />
          </GrFormField>
          <button type="submit">Submit</button>
        </GrForm>
      `,
    })

    const wrapper = mount(Harness)
    await wrapper.get('button[type="submit"]').trigger('submit')
    await flushValidation()

    expect(wrapper.vm.payloads).toHaveLength(1)
    expect(wrapper.vm.payloads[0].doc).toContain('photo.png')
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
        const formRef = ref<GrFormInstance>()
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

describe('GrForm — гонка асинхронной валидации поля', () => {
  it('поздний запуск валидации побеждает: ранний медленный ответ не затирает', async () => {
    let firstResolve!: (value: boolean | string) => void
    let secondResolve!: (value: boolean | string) => void
    let call = 0

    const model = reactive({ email: 'bad' })
    const formRef = ref<GrFormInstance | null>(null)

    const wrapper = mount({
      components: { GrForm, GrFormField, GrInput },
      setup: () => ({
        model,
        formRef,
        rules: {
          email: [{
            validator: () => new Promise<boolean | string>((resolve) => {
              call += 1
              if (call === 1) firstResolve = resolve
              else secondResolve = resolve
            }),
          }],
        },
      }),
      template: `
        <GrForm ref="formRef" :model="model" :rules="rules">
          <GrFormField label="Email" name="email">
            <GrInput v-model="model.email" />
          </GrFormField>
        </GrForm>
      `,
    }, { attachTo: document.body })
    await nextTick()

    const form = formRef.value!

    // Первый прогон (значение невалидно) — ответ задержится.
    const first = form.validateField('email')
    // Пользователь исправил и валидация ушла второй раз.
    model.email = 'good@example.com'
    const second = form.validateField('email')

    // Второй ответ приходит раньше: поле валидно.
    secondResolve(true)
    await second

    // Медленный первый ответ с ошибкой обязан проиграть — он про старое значение.
    firstResolve('Некорректный e-mail')
    await first
    await nextTick()

    expect(document.querySelector('[data-gr-form-field-error]')?.textContent ?? '').toBe('')

    wrapper.unmount()
  })

  /**
   * Стенд с ручным резолвом правила: каждый прогон получает свой `resolve`,
   * поэтому порядок ответов задаёт тест, а не движок промисов.
   */
  function mountDeferred(formProps = '') {
    const resolvers: Array<(value: boolean | string) => void> = []
    const model = reactive({ email: 'bad' })
    const formRef = ref<GrFormInstance | null>(null)
    // Слушаем событие на месте: `findComponent(GrForm).emitted()` у
    // дженерик-компонента не типизируется — VTU разрешает перегрузку в DOM-обёртку.
    const onValidate = vi.fn()

    const wrapper = mount({
      components: { GrForm, GrFormField, GrInput },
      setup: () => ({
        model,
        formRef,
        onValidate,
        rules: {
          email: [{
            validator: () => new Promise<boolean | string>((resolve) => { resolvers.push(resolve) }),
          }],
        },
      }),
      template: `
        <GrForm ref="formRef" :model="model" :rules="rules" @validate="onValidate" ${formProps}>
          <GrFormField label="Email" name="email">
            <GrInput v-model="model.email" />
          </GrFormField>
        </GrForm>
      `,
    }, { attachTo: document.body })

    return { wrapper, model, resolvers, onValidate, form: () => formRef.value! }
  }

  it('вытесненный прогон отдаёт вердикт вытеснившего, а не «ошибок пока нет»', async () => {
    const { wrapper, form, resolvers } = mountDeferred()
    await nextTick()

    const first = form().validateField('email')
    const second = form().validateField('email')

    // Ранний прогон отвечает первым — он про уже неактуальное значение.
    resolvers[0]('Некорректный e-mail')
    await flushValidation()

    // Вытеснивший ещё летит и в карту ошибок ничего не записал.
    resolvers[1]('Всё ещё некорректный e-mail')

    expect(await first).toBe(false)
    expect(await second).toBe(false)

    wrapper.unmount()
  })

  it('submit ждёт вытеснивший прогон, а не отправляет непроверенное значение', async () => {
    const { wrapper, model, form, resolvers } = mountDeferred('validate-on-change')
    await nextTick()

    // Submit запустил проверку, пользователь тут же поправил значение —
    // watcher завёл второй прогон поверх первого.
    const validating = form().validate()
    model.email = 'typed@example.com'
    await nextTick()
    expect(resolvers).toHaveLength(2)

    // Первый отвечает «валидно» — про прежнее значение.
    resolvers[0](true)
    await flushValidation()
    resolvers[1]('Некорректный e-mail')

    expect(await validating).toBe(false)

    wrapper.unmount()
  })

  it('сброс формы отменяет летящую проверку: ни ошибки, ни зависшего «проверяем»', async () => {
    const { wrapper, form, resolvers, onValidate } = mountDeferred()
    await nextTick()

    const pending = form().validateField('email')
    await flushValidation()
    expect(wrapper.find('[data-gr-form-field-validating]').exists()).toBe(true)

    form().resetFields()
    await flushValidation()

    // Сброс не может ждать сервер: поле обязано перестать «проверяться» сразу.
    expect(wrapper.find('[data-gr-form-field-validating]').exists()).toBe(false)

    resolvers[0]('Некорректный e-mail')
    await pending
    await flushValidation()

    // Ответ про досбросовое значение не имеет права вернуть ошибку.
    expect(errorTexts(wrapper)).toEqual([])
    expect(onValidate).not.toHaveBeenCalled()

    wrapper.unmount()
  })
})

describe('GrForm — среда без `scrollIntoView`', () => {
  /**
   * jsdom не реализует `scrollIntoView` вовсе, и до правки форма звала его
   * безусловно: у любого, кто тестирует свою форму в jsdom и не знает про
   * заглушку, неуспешная валидация роняла прогон необработанным отказом — при
   * зелёных тестах и ненулевом коде возврата. Ровно так падал CI пакета
   * `granularity-forms-schema`.
   */
  it('неуспешная валидация не роняет прогон, когда метода нет', async () => {
    // Снимаем общую заглушку: предмет проверки — именно её отсутствие.
    delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView

    const Harness = makeHarness({ email: [{ required: true, message: 'Обязательно' }] })
    const wrapper = mount(Harness, { attachTo: document.body })

    const form = (wrapper.vm as unknown as { formRef: GrFormInstance }).formRef
    await expect(form.validate()).resolves.toBe(false)
    await nextTick()

    expect(wrapper.text()).toContain('Обязательно')

    wrapper.unmount()
  })
})
