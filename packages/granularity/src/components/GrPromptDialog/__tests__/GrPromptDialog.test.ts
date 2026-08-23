import { DOMWrapper, mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import GrPromptDialog from '../GrPromptDialog.vue'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('GrPromptDialog', () => {
  it('показывает ошибку при пустом значении и подтверждает при заполнении', async () => {
    const Harness = defineComponent({
      name: 'HarnessPrompt',
      components: { GrPromptDialog },
      setup() {
        const open = ref(true)
        const value = ref('')
        const onConfirm = vi.fn()
        return { open, value, onConfirm }
      },
      template:
        '<GrPromptDialog v-model="open" v-model:value="value" title="T" confirm-text="Save" cancel-text="Cancel" @confirm="onConfirm" />',
    })

    const wrapper = mount(Harness, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    })

    // Телепорт застабан: содержимое в дереве обёртки, но появляется на такт
    // позже монтирования.
    await nextTick()

    expect(wrapper.find('[data-testid="gr-prompt-confirm"]').text()).toContain('Save')

    await wrapper.find('[data-testid="gr-prompt-confirm"]').trigger('click')
    await nextTick()

    expect((wrapper.vm as any).onConfirm).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Enter a value.')

    await wrapper.find('[data-testid="gr-prompt-input"]').setValue('New name')
    await wrapper.find('[data-testid="gr-prompt-confirm"]').trigger('click')
    await nextTick()

    expect((wrapper.vm as any).onConfirm).toHaveBeenCalledWith('New name')
    expect((wrapper.vm as any).open).toBe(false)

    wrapper.unmount()
  })

  it('пробрасывает headerConfig и footerConfig в базовый GrDialog', async () => {
    const wrapper = mount(
      defineComponent({
        name: 'HarnessPromptSectionConfig',
        components: { GrPromptDialog },
        setup() {
          const open = ref(true)
          const value = ref('Value')
          return { open, value }
        },
        template: `
          <GrPromptDialog
            v-model="open"
            v-model:value="value"
            title="T"
            :header-config="{ paddingX: 'px-4', paddingY: 'py-2', bordered: false }"
            :footer-config="{ paddingX: 'px-3', paddingY: 'py-1', bordered: false }"
          />
        `,
      }),
      {
        global: {
          stubs: {
            teleport: true,
          },
        },
      },
    )

    // Телепорт застабан: содержимое в дереве обёртки, но появляется на такт
    // позже монтирования.
    await nextTick()

    expect(wrapper.find('[data-gr-dialog-header]').classes()).toContain('px-4')
    expect(wrapper.find('[data-gr-dialog-header]').classes()).toContain('py-2')
    expect(wrapper.find('[data-gr-dialog-header]').classes()).not.toContain('border-b')

    expect(wrapper.find('[data-gr-dialog-footer]').classes()).toContain('px-3')
    expect(wrapper.find('[data-gr-dialog-footer]').classes()).toContain('py-1')
    expect(wrapper.find('[data-gr-dialog-footer]').classes()).not.toContain('border-t')

    wrapper.unmount()
  })

  it('пробрасывает buttonSize в action-кнопки', async () => {
    const wrapper = mount(
      defineComponent({
        name: 'HarnessPromptButtonSize',
        components: { GrPromptDialog },
        setup() {
          const open = ref(true)
          const value = ref('Value')
          return { open, value }
        },
        template: '<GrPromptDialog v-model="open" v-model:value="value" title="T" button-size="xs" />',
      }),
      {
        global: {
          stubs: {
            teleport: true,
          },
        },
      },
    )

    // Телепорт застабан: содержимое в дереве обёртки, но появляется на такт
    // позже монтирования.
    await nextTick()

    expect(wrapper.find('[data-testid="gr-prompt-cancel"]').classes()).toContain('h-7')
    expect(wrapper.find('[data-testid="gr-prompt-cancel"]').classes()).toContain('px-2.5')
    expect(wrapper.find('[data-testid="gr-prompt-confirm"]').classes()).toContain('h-7')
    expect(wrapper.find('[data-testid="gr-prompt-confirm"]').classes()).toContain('px-2.5')

    wrapper.unmount()
  })
})

/**
 * Стенд для новых сценариев.
 *
 * `teleport` намеренно **не** стабится: стаб VTU пересоздаёт поддерево на
 * ре-рендере, и в тесте остаются мёртвые инстансы — шаблонный `ref` смотрит на
 * один, а в документе висит другой, из-за чего молча не работают ни `@blur`,
 * ни программный фокус. Ищем поэтому по документу.
 *
 * Открываем окно **после** монтирования, как в жизни: телепорт включается
 * только после mount, и содержимое, отрисованное до него, переезжает в `body`,
 * а переезд узла сбрасывает фокус.
 */
async function mountPrompt(attrs = '', extra: Record<string, unknown> = {}) {
  const Harness = defineComponent({
    name: 'HarnessPrompt',
    components: { GrPromptDialog },
    setup() {
      const open = ref(false)
      const value = ref('')
      const onConfirm = vi.fn()
      return { open, value, onConfirm, ...extra }
    },
    template: `<GrPromptDialog v-model="open" v-model:value="value" title="T" ${attrs} @confirm="onConfirm" />`,
  })

  const wrapper = mount(Harness, { attachTo: document.body })
  ;(wrapper.vm as unknown as { open: boolean }).open = true
  // Тактов три: телепорт включается после маунта, затем появляется поддерево
  // окна, и только потом содержимое диалога ставит фокус.
  await nextTick()
  await nextTick()
  await nextTick()

  return wrapper
}

function byTestId(testId: string): DOMWrapper<HTMLElement> {
  const el = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)
  if (!el)
    throw new Error(`[test] элемент ${testId} не найден`)
  return new DOMWrapper(el)
}

const promptField = () => byTestId('gr-prompt-input')
const promptConfirm = () => byTestId('gr-prompt-confirm')
const confirmSpy = (wrapper: { vm: unknown }) => (wrapper.vm as { onConfirm: ReturnType<typeof vi.fn> }).onConfirm

describe('GrPromptDialog — уникальность id', () => {
  it('два открытых диалога не делят id поля, и каждый label указывает на своё', async () => {
    // Оба — в одном приложении: `useId()` нумерует внутри app, и два отдельных
    // `mount()` дали бы одинаковые `v-0` у любых компонентов.
    const Two = defineComponent({
      components: { GrPromptDialog },
      setup: () => ({ open: ref(false), a: ref(''), b: ref('') }),
      template: `
        <div>
          <GrPromptDialog v-model="open" v-model:value="a" title="A" />
          <GrPromptDialog v-model="open" v-model:value="b" title="B" />
        </div>
      `,
    })

    const wrapper = mount(Two, { attachTo: document.body })
    ;(wrapper.vm as unknown as { open: boolean }).open = true
    await nextTick()
    await nextTick()

    const inputs = [...document.querySelectorAll<HTMLInputElement>('[data-testid="gr-prompt-input"]')]
    expect(inputs).toHaveLength(2)
    expect(inputs[0].id).toBeTruthy()
    // Хардкод `id="gr-prompt-input"` делал диалоги неразличимыми для
    // `<label for>`: подпись второго уводила на инпут первого.
    expect(inputs[0].id).not.toBe(inputs[1].id)

    const labels = [...document.querySelectorAll<HTMLLabelElement>('label[for]')]
    expect(labels.map(l => l.htmlFor).sort()).toEqual(inputs.map(i => i.id).sort())

    wrapper.unmount()
  })
})

describe('GrPromptDialog — ввод', () => {
  it('фокус при открытии уходит в поле, а не на панель', async () => {
    const wrapper = await mountPrompt()

    expect(document.activeElement).toBe(promptField().element)

    wrapper.unmount()
  })

  it('Enter в однострочном поле подтверждает', async () => {
    const wrapper = await mountPrompt()

    await promptField().setValue('Аня')
    await promptField().trigger('keydown.enter')
    await nextTick()

    expect(confirmSpy(wrapper)).toHaveBeenCalledWith('Аня')

    wrapper.unmount()
  })

  it('multiline рисует textarea, и Enter там остаётся переводом строки', async () => {
    // `show-count` здесь не для счётчика: со счётчиком у `GrTextarea` появляется
    // обёртка, и без `inheritAttrs: false` атрибуты потребителя садились бы на
    // неё вместо самого поля.
    const wrapper = await mountPrompt('multiline :rows="5" :maxlength="100" show-count')

    expect(promptField().element.tagName).toBe('TEXTAREA')
    expect(promptField().attributes('rows')).toBe('5')

    await promptField().setValue('первая строка')
    await promptField().trigger('keydown.enter')
    await nextTick()

    expect(confirmSpy(wrapper)).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('inputType и maxlength доезжают до поля', async () => {
    const wrapper = await mountPrompt('input-type="email" :maxlength="20"')

    expect(promptField().attributes('type')).toBe('email')
    expect(promptField().attributes('maxlength')).toBe('20')

    wrapper.unmount()
  })
})

describe('GrPromptDialog — rules', () => {
  it('правило движка GrForm держит диалог открытым и показывает сообщение', async () => {
    const wrapper = await mountPrompt(':rules="rules"', { rules: { min: 5, message: 'Минимум 5 символов' } })

    await promptField().setValue('abc')
    await promptConfirm().trigger('click')
    await nextTick()
    await nextTick()

    expect(confirmSpy(wrapper)).not.toHaveBeenCalled()
    expect(document.body.textContent).toContain('Минимум 5 символов')

    await promptField().setValue('abcdef')
    await promptConfirm().trigger('click')
    await nextTick()
    await nextTick()

    expect(confirmSpy(wrapper)).toHaveBeenCalledWith('abcdef')

    wrapper.unmount()
  })

  it('устаревший ответ асинхронного правила не дописывает свою ошибку', async () => {
    let resolveFirst!: (v: string | boolean) => void
    let call = 0
    const rules = {
      validator: () => {
        call += 1
        if (call === 1)
          return new Promise<string | boolean>((resolve) => { resolveFirst = resolve })
        return true
      },
    }

    const wrapper = await mountPrompt(':rules="rules"', { rules })

    await promptField().setValue('первое')
    await promptField().trigger('blur')
    await nextTick()

    // Значение сменилось и запустило новый прогон — ответ первого устарел.
    await promptField().setValue('второе')
    await promptField().trigger('blur')
    await nextTick()
    await nextTick()

    resolveFirst('Ошибка из устаревшего прогона')
    await nextTick()
    await nextTick()

    expect(document.body.textContent).not.toContain('Ошибка из устаревшего прогона')

    wrapper.unmount()
  })
})

/**
 * Связка поля с текстом ошибки — самая длинная молчаливая цепочка в диалоге.
 *
 * Диалог не ставит `aria-*` сам: `GrFormField` генерирует `id` контейнера
 * ошибки, кладёт его в контекст, `useGrFormControl` достаёт оттуда, и уже
 * `GrInput` печатает `aria-describedby` с `aria-invalid`. Порвётся любое звено —
 * ни один существующий тест этого не заметит, а axe со страницы витрины видит
 * только закрытый диалог.
 */
describe('GrPromptDialog: связка поля с ошибкой', () => {
  function mountPrompt(props: Record<string, unknown> = {}) {
    const Harness = defineComponent({
      name: 'HarnessPromptAria',
      components: { GrPromptDialog },
      props: { extra: { type: Object, default: () => ({}) } },
      setup() {
        const open = ref(true)
        const value = ref('')
        return { open, value }
      },
      template: '<GrPromptDialog v-model="open" v-model:value="value" title="T" required v-bind="extra" />',
    })

    // `attachTo` обязателен: связку проверяем через `document.getElementById`,
    // то есть узел с ошибкой должен реально лежать в документе.
    return mount(Harness, {
      props: { extra: props },
      attachTo: document.body,
      global: { stubs: { teleport: true } },
    })
  }

  const input = (wrapper: ReturnType<typeof mountPrompt>) =>
    wrapper.get('[data-testid="gr-prompt-input"]')

  it('до первого blur поле не помечено ошибочным', async () => {
    const wrapper = mountPrompt()
    await nextTick()

    // Пустое обязательное поле — ещё не ошибка: пользователь его не трогал.
    // Красная рамка и `aria-invalid` при открытии обвиняют раньше времени.
    expect(input(wrapper).attributes('aria-invalid')).toBeUndefined()

    wrapper.unmount()
  })

  it('после blur пустого поля появляются aria-invalid и ссылка на текст ошибки', async () => {
    const wrapper = mountPrompt()
    await nextTick()

    await input(wrapper).trigger('blur')
    await nextTick()

    const describedBy = input(wrapper).attributes('aria-describedby')

    expect(input(wrapper).attributes('aria-invalid')).toBe('true')
    expect(describedBy).toBeTruthy()

    // Проверяем не факт атрибута, а адрес: он обязан вести в узел с текстом
    // ошибки, а не в подсказку и не в пустоту.
    const errorNode = document.getElementById(describedBy!)
    expect(errorNode).not.toBeNull()
    expect(errorNode!.textContent?.trim()).not.toBe('')

    wrapper.unmount()
  })

  it('внешняя ошибка поля помечает его сразу, не дожидаясь blur', async () => {
    const wrapper = mountPrompt({ fieldError: 'Такой логин занят' })
    await nextTick()

    const describedBy = input(wrapper).attributes('aria-describedby')

    expect(input(wrapper).attributes('aria-invalid')).toBe('true')
    expect(document.getElementById(describedBy!)?.textContent).toContain('Такой логин занят')

    wrapper.unmount()
  })

  it('multiline держит ту же связку на textarea', async () => {
    const wrapper = mountPrompt({ multiline: true })
    await nextTick()

    expect(input(wrapper).element.tagName).toBe('TEXTAREA')

    await input(wrapper).trigger('blur')
    await nextTick()

    const describedBy = input(wrapper).attributes('aria-describedby')

    expect(input(wrapper).attributes('aria-invalid')).toBe('true')
    expect(document.getElementById(describedBy!)?.textContent?.trim()).not.toBe('')

    wrapper.unmount()
  })

  it('повторное открытие снимает ошибку вместе с прикосновением', async () => {
    const Harness = defineComponent({
      name: 'HarnessPromptReopen',
      components: { GrPromptDialog },
      setup() {
        const open = ref(true)
        const value = ref('')
        return { open, value }
      },
      template: '<GrPromptDialog v-model="open" v-model:value="value" title="T" required />',
    })

    const wrapper = mount(Harness, {
      attachTo: document.body,
      global: { stubs: { teleport: true } },
    })
    await nextTick()

    await wrapper.get('[data-testid="gr-prompt-input"]').trigger('blur')
    await nextTick()
    expect(wrapper.get('[data-testid="gr-prompt-input"]').attributes('aria-invalid')).toBe('true')

    wrapper.vm.open = false
    await nextTick()
    wrapper.vm.open = true
    await nextTick()

    expect(wrapper.get('[data-testid="gr-prompt-input"]').attributes('aria-invalid')).toBeUndefined()

    wrapper.unmount()
  })

  /**
   * Два диалога на одной странице не делят `id`.
   *
   * Ровно ради этого `GrFormField` генерирует `id` сам, а не берёт литерал —
   * комментарий в шаблоне помнит, как литеральный id ломал пару открытых
   * диалогов: `aria-describedby` второго указывал в контейнер первого.
   *
   * Оба диалога живут в одном приложении намеренно: `useId()` нумерует внутри
   * приложения, и два отдельных `mount()` дали бы совпадение идентификаторов
   * там, где у потребителя его не бывает.
   */
  it('два диалога не делят идентификаторы', async () => {
    const Harness = defineComponent({
      name: 'HarnessTwoPrompts',
      components: { GrPromptDialog },
      setup() {
        return { openA: ref(true), openB: ref(true), a: ref(''), b: ref('') }
      },
      template: `
        <div>
          <GrPromptDialog v-model="openA" v-model:value="a" title="A" field-error="Первая" />
          <GrPromptDialog v-model="openB" v-model:value="b" title="B" field-error="Вторая" />
        </div>
      `,
    })

    const wrapper = mount(Harness, {
      attachTo: document.body,
      global: { stubs: { teleport: true } },
    })
    await nextTick()

    const [firstId, secondId] = wrapper
      .findAll('[data-testid="gr-prompt-input"]')
      .map(field => field.attributes('aria-describedby'))

    expect(firstId).toBeTruthy()
    expect(secondId).toBeTruthy()
    expect(firstId).not.toBe(secondId)
    expect(document.getElementById(firstId!)?.textContent).toContain('Первая')
    expect(document.getElementById(secondId!)?.textContent).toContain('Вторая')

    wrapper.unmount()
  })
})
