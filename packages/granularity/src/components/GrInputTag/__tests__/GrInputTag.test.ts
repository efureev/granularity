import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('~icons/lucide/x', () => {
  return {
    default: defineComponent({
      name: 'IconClose',
      template: '<svg data-icon="x" />',
    }),
  }
})

vi.mock('~icons/lucide/loader-2', () => {
  return {
    default: defineComponent({
      name: 'IconLoader',
      template: '<svg data-icon="loader" />',
    }),
  }
})

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import GrFormField from '../../GrFormField/GrFormField.vue'
import { resetAnnouncer } from '../../../composables/useAnnouncer'
import GrInputTag from '../GrInputTag.vue'

/**
 * События набора уходят в общий живой регион (`useAnnouncer`), а не в узел
 * компонента: текст там появляется отложенным макротаском — иначе повтор того
 * же сообщения не давал бы мутации и не читался.
 */
async function announced(): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 2))
  return document.querySelector('[data-gr-announcer-region="polite"]')?.textContent ?? ''
}

afterEach(() => {
  resetAnnouncer()
})

describe('GrInputTag', () => {
  it('добавляет тег по Enter', async () => {
    const wrapper = mount(GrInputTag, {
      props: {
        modelValue: [],
      },
    })

    const input = wrapper.get('[data-testid="gr-input-tag-input"]')
    await input.setValue('hello')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(['hello'])
    expect(wrapper.emitted('add')?.[0]?.[0]).toBe('hello')
  })

  it('по умолчанию игнорирует дубликаты', async () => {
    const wrapper = mount(GrInputTag, {
      props: {
        modelValue: [],
      },
    })

    const input = wrapper.get('[data-testid="gr-input-tag-input"]')
    await input.setValue('a')
    await input.trigger('keydown', { key: 'Enter' })

    const first = wrapper.emitted('update:modelValue')?.[0]?.[0] as string[]
    await wrapper.setProps({ modelValue: first })

    await input.setValue('a')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')?.length).toBe(1)
  })

  it('удаляет последний тег по Backspace при пустом input', async () => {
    const wrapper = mount(GrInputTag, {
      props: {
        modelValue: ['a', 'b'],
      },
    })

    const input = wrapper.get('[data-testid="gr-input-tag-input"]')
    await input.trigger('keydown', { key: 'Backspace' })

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(['a'])
    expect(wrapper.emitted('remove')?.[0]?.[0]).toBe('b')
  })

  it('удаляет тег по клику на крестик', async () => {
    const wrapper = mount(GrInputTag, {
      props: {
        modelValue: ['a', 'b'],
      },
    })

    const btn = wrapper.get('[data-testid="gr-input-tag-remove"][data-index="0"]')
    await btn.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(['b'])
    expect(wrapper.emitted('remove')?.[0]).toEqual(['a', 0])
  })

  it('не добавляет теги, если достигнут max', async () => {
    const wrapper = mount(GrInputTag, {
      props: {
        modelValue: ['a', 'b'],
        max: 2,
      },
    })

    const input = wrapper.get('[data-testid="gr-input-tag-input"]')
    await input.setValue('c')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  // Placeholder именем не считается: до этой правки задать имя было нечем вообще —
  // ни пропа, ни связки с `GrFormField` (axe: `label`).
  it('берёт доступное имя из ariaLabel вне GrFormField', () => {
    const wrapper = mount(GrInputTag, {
      props: { modelValue: [], ariaLabel: 'Incident tags' },
    })

    expect(wrapper.get('[data-gr-input-tag-input]').attributes('aria-label')).toBe('Incident tags')
  })

  it('внутри GrFormField получает id, aria-describedby и aria-invalid из контекста', () => {
    const Harness = defineComponent({
      components: { GrFormField, GrInputTag },
      data: () => ({ tags: [] as string[] }),
      template: `
        <GrFormField label="Skills" hint="Через запятую" error="Обязательное поле" required>
          <GrInputTag v-model="tags" />
        </GrFormField>
      `,
    })

    const wrapper = mount(Harness)
    const input = wrapper.get('[data-gr-input-tag-input]')
    const id = input.attributes('id')

    expect(id).toBeTruthy()
    expect(wrapper.get(`label[for="${id}"]`).text()).toContain('Skills')
    expect(input.attributes('aria-describedby')).toBeTruthy()
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-required')).toBe('true')
  })

  it('не редактируется в disabled состоянии', async () => {
    const wrapper = mount(GrInputTag, {
      props: {
        modelValue: ['a'],
        disabled: true,
      },
    })

    const input = wrapper.get('[data-testid="gr-input-tag-input"]')
    await input.setValue('b')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.find('[data-testid="gr-input-tag-remove"]').exists()).toBe(false)
  })
})

describe('GrInputTag — предел набора', () => {
  // Раньше при `max` инпут получал `disabled`: он выпадал из таб-порядка и
  // переставал принимать Backspace — единственный способ убрать тег клавиатурой.
  it('на пределе поле остаётся живым и принимает Backspace', async () => {
    const wrapper = mount(GrInputTag, { props: { modelValue: ['a', 'b'], max: 2 } })
    const input = wrapper.get('[data-gr-input-tag-input]')

    expect((input.element as HTMLInputElement).disabled).toBe(false)

    await input.trigger('keydown', { key: 'Backspace' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['a']])
  })

  it('исчерпание предела объявляется, а не блокирует поле', async () => {
    const wrapper = mount(GrInputTag, { props: { modelValue: ['a', 'b'], max: 2 } })
    const input = wrapper.get('[data-gr-input-tag-input]')

    await input.setValue('c')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(await announced()).toBe('Tag limit reached')
  })
})

describe('GrInputTag — состояние из GrFormField', () => {
  // `aria-invalid` брался из контекста, а рамка — из сырого пропа: поле было
  // объявлено невалидным для SR и выглядело обычным.
  it('ошибка поля красит рамку, а не только объявляется', () => {
    const Harness = defineComponent({
      components: { GrFormField, GrInputTag },
      data: () => ({ tags: [] as string[] }),
      template: `
        <GrFormField label="Skills" error="Обязательное поле">
          <GrInputTag v-model="tags" />
        </GrFormField>
      `,
    })

    const wrapper = mount(Harness)

    expect(wrapper.get('[data-gr-input-tag]').classes()).toContain('border-[var(--gr-danger)]')
  })

  it('readonly поля доходит до инпута', () => {
    const Harness = defineComponent({
      components: { GrFormField, GrInputTag },
      data: () => ({ tags: ['a'] as string[] }),
      template: `
        <GrFormField label="Skills" readonly>
          <GrInputTag v-model="tags" />
        </GrFormField>
      `,
    })

    const wrapper = mount(Harness)

    expect((wrapper.get('[data-gr-input-tag-input]').element as HTMLInputElement).readOnly).toBe(true)
  })

  it('disabled гасится токенами фона, а не прозрачностью', () => {
    const wrapper = mount(GrInputTag, { props: { modelValue: ['a'], disabled: true } })
    const root = wrapper.get('[data-gr-input-tag]')

    expect(root.classes()).toContain('bg-[var(--gr-muted)]')
    expect(root.classes().some(cls => cls.startsWith('opacity-'))).toBe(false)
  })
})

describe('GrInputTag — клавиатура по чипам', () => {
  const props = { modelValue: ['vue', 'ts', 'uno'] }

  it('в таб-порядке ровно один крестик', () => {
    const wrapper = mount(GrInputTag, { props })
    const tabbable = wrapper.findAll('[data-gr-input-tag-remove]')
      .filter(btn => btn.attributes('tabindex') === '0')

    expect(tabbable).toHaveLength(1)
  })

  it('крестик называет свой тег', () => {
    const wrapper = mount(GrInputTag, { props })
    const labels = wrapper.findAll('[data-gr-input-tag-remove]').map(btn => btn.attributes('aria-label'))

    expect(labels).toEqual(['Remove tag vue', 'Remove tag ts', 'Remove tag uno'])
  })

  it('стрелки переносят roving-фокус между чипами', async () => {
    const wrapper = mount(GrInputTag, { props, attachTo: document.body })
    const buttons = wrapper.findAll('[data-gr-input-tag-remove]')

    await buttons[0].trigger('keydown', { key: 'ArrowRight' })
    await nextTick()
    expect(document.activeElement).toBe(buttons[1].element)

    await buttons[1].trigger('keydown', { key: 'End' })
    await nextTick()
    expect(document.activeElement).toBe(buttons[2].element)

    // За последним чипом — поле ввода, ряд продолжается.
    await buttons[2].trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(wrapper.get('[data-gr-input-tag-input]').element)

    wrapper.unmount()
  })

  it('стрелка влево из пустого поля уводит на последний чип', async () => {
    const wrapper = mount(GrInputTag, { props, attachTo: document.body })

    await wrapper.get('[data-gr-input-tag-input]').trigger('keydown', { key: 'ArrowLeft' })
    await nextTick()

    expect(document.activeElement).toBe(wrapper.findAll('[data-gr-input-tag-remove]')[2].element)
    wrapper.unmount()
  })

  it('Delete удаляет чип и не роняет фокус', async () => {
    const wrapper = mount(GrInputTag, { props: { ...props }, attachTo: document.body })

    await wrapper.findAll('[data-gr-input-tag-remove]')[1].trigger('keydown', { key: 'Delete' })

    expect(wrapper.emitted('remove')?.at(-1)).toEqual(['ts', 1])
    expect(await announced()).toBe('Tag removed: ts')
    wrapper.unmount()
  })

  it('чипы объявлены списком', () => {
    const wrapper = mount(GrInputTag, { props })

    expect(wrapper.findAll('[role="list"]')).toHaveLength(1)
    expect(wrapper.findAll('[role="listitem"]')).toHaveLength(3)
  })
})

describe('GrInputTag — beforeAdd', () => {
  it('синхронная проверка отсекает тег и объявляет отказ', async () => {
    const wrapper = mount(GrInputTag, {
      props: { modelValue: [], beforeAdd: (tag: string) => tag.includes('@') },
    })
    const input = wrapper.get('[data-gr-input-tag-input]')

    await input.setValue('nope')
    await input.trigger('keydown', { key: 'Enter' })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('reject')?.at(-1)).toEqual(['nope'])
  })

  it('асинхронная проверка поднимает спиннер и добавляет тег после ответа', async () => {
    let release: (value: boolean) => void = () => {}
    const wrapper = mount(GrInputTag, {
      props: {
        modelValue: [],
        beforeAdd: () => new Promise<boolean>((resolve) => { release = resolve }),
      },
    })
    const input = wrapper.get('[data-gr-input-tag-input]')

    await input.setValue('vue')
    await input.trigger('keydown', { key: 'Enter' })
    await nextTick()

    expect(wrapper.find('[data-gr-input-tag-spinner]').exists()).toBe(true)
    expect(input.attributes('aria-busy')).toBe('true')

    release(true)
    await nextTick()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['vue']])

    await nextTick()
    expect(wrapper.find('[data-gr-input-tag-spinner]').exists()).toBe(false)
  })

  // Второй Enter отменяет первую проверку: результат устаревшей дописывать нельзя.
  it('устаревшая проверка не дописывает свой тег', async () => {
    const pending: ((value: boolean) => void)[] = []
    const wrapper = mount(GrInputTag, {
      props: {
        modelValue: [],
        beforeAdd: () => new Promise<boolean>((resolve) => { pending.push(resolve) }),
      },
    })
    const input = wrapper.get('[data-gr-input-tag-input]')

    await input.setValue('first')
    await input.trigger('keydown', { key: 'Enter' })
    await input.setValue('second')
    await input.trigger('keydown', { key: 'Enter' })

    pending[0](true)
    pending[1](true)
    await nextTick()
    await nextTick()

    const emitted = wrapper.emitted('update:modelValue') ?? []
    expect(emitted.flat()).toEqual([['second']])
  })
})

describe('GrInputTag — clearable и размер', () => {
  it('кнопка «очистить» сносит набор и объявляет это', async () => {
    const wrapper = mount(GrInputTag, { props: { modelValue: ['a', 'b'], clearable: true } })

    await wrapper.get('[data-gr-input-tag-clear]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[]])
    expect(wrapper.emitted('clear')).toHaveLength(1)
    expect(await announced()).toBe('All tags removed')
  })

  it('кнопки нет на пустом наборе и в readonly', () => {
    expect(mount(GrInputTag, { props: { modelValue: [], clearable: true } })
      .find('[data-gr-input-tag-clear]').exists()).toBe(false)
    expect(mount(GrInputTag, { props: { modelValue: ['a'], clearable: true, readonly: true } })
      .find('[data-gr-input-tag-clear]').exists()).toBe(false)
  })

  it('размер приходит из GrConfigProvider', () => {
    const Harness = defineComponent({
      components: { GrConfigProvider, GrInputTag },
      template: `
        <GrConfigProvider size="xs">
          <GrInputTag :model-value="[]" />
        </GrConfigProvider>
      `,
    })

    expect(mount(Harness).get('[data-gr-input-tag]').classes()).toContain('min-h-7')
  })
})

describe('GrInputTag — IME-композиция', () => {
  it('Enter во время композиции не добавляет тег', async () => {
    const wrapper = mount(GrInputTag, { props: { modelValue: [], ariaLabel: 'Tags' } })
    const input = wrapper.get('input')
    await input.setValue('vue')

    input.element.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true, cancelable: true }),
    )
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })
})
