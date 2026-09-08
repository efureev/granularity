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
import { announced } from '../../../testing'
import { composingKeydown } from '../../../testing/keyboard'

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

    const btn = wrapper.get('[data-index="0"] [data-gr-chip-close]')
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
    expect(wrapper.find('[data-gr-chip-close]').exists()).toBe(false)
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

    expect(wrapper.get('[data-gr-input-tag]').classes()).toContain('border-[var(--gr-invalid-brd)]')
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
    const tabbable = wrapper.findAll('[data-gr-chip-close]')
      .filter(btn => btn.attributes('tabindex') === '0')

    expect(tabbable).toHaveLength(1)
  })

  it('крестик называет свой тег', () => {
    const wrapper = mount(GrInputTag, { props })
    const labels = wrapper.findAll('[data-gr-chip-close]').map(btn => btn.attributes('aria-label'))

    expect(labels).toEqual(['Remove tag vue', 'Remove tag ts', 'Remove tag uno'])
  })

  it('стрелки переносят roving-фокус между чипами', async () => {
    const wrapper = mount(GrInputTag, { props, attachTo: document.body })
    const buttons = wrapper.findAll('[data-gr-chip-close]')

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

  it('остановка Tab переезжает вслед за стрелками, оставаясь единственной', async () => {
    const wrapper = mount(GrInputTag, { props, attachTo: document.body })
    const tabindexes = () => wrapper.findAll('[data-gr-chip-close]')
      .map(btn => btn.attributes('tabindex'))

    expect(tabindexes()).toEqual(['0', '-1', '-1'])

    await wrapper.findAll('[data-gr-chip-close]')[0].trigger('keydown', { key: 'End' })
    await nextTick()
    expect(tabindexes()).toEqual(['-1', '-1', '0'])

    wrapper.unmount()
  })

  it('слева от первого чипа — край ряда, фокус остаётся на месте', async () => {
    const wrapper = mount(GrInputTag, { props, attachTo: document.body })
    const buttons = wrapper.findAll('[data-gr-chip-close]')

    ;(buttons[0].element as HTMLElement).focus()
    await buttons[0].trigger('keydown', { key: 'ArrowLeft' })
    await nextTick()

    expect(document.activeElement).toBe(buttons[0].element)
    wrapper.unmount()
  })

  it('Home возвращает на первый чип', async () => {
    const wrapper = mount(GrInputTag, { props, attachTo: document.body })
    const buttons = wrapper.findAll('[data-gr-chip-close]')

    await buttons[2].trigger('keydown', { key: 'Home' })
    await nextTick()

    expect(document.activeElement).toBe(buttons[0].element)
    wrapper.unmount()
  })

  it('стрелка влево из пустого поля уводит на последний чип', async () => {
    const wrapper = mount(GrInputTag, { props, attachTo: document.body })

    await wrapper.get('[data-gr-input-tag-input]').trigger('keydown', { key: 'ArrowLeft' })
    await nextTick()

    expect(document.activeElement).toBe(wrapper.findAll('[data-gr-chip-close]')[2].element)
    wrapper.unmount()
  })

  it('Delete удаляет чип и не роняет фокус', async () => {
    const wrapper = mount(GrInputTag, { props: { ...props }, attachTo: document.body })

    await wrapper.findAll('[data-gr-chip-close]')[1].trigger('keydown', { key: 'Delete' })

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

    composingKeydown(input.element, 'Enter')
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })
})

describe('GrInputTag — name (нативная форма)', () => {
  it('с `name` рендерит hidden input на каждый тег; пустой набор — ни одного', async () => {
    const wrapper = mount(GrInputTag, { props: { modelValue: ['vue', 'ts'], name: 'tags', ariaLabel: 'Tags' } })
    const inputs = wrapper.findAll('input[type="hidden"]')
    expect(inputs).toHaveLength(2)
    expect(inputs.map(i => (i.element as HTMLInputElement).value)).toEqual(['vue', 'ts'])
    expect(inputs.every(i => i.attributes('name') === 'tags')).toBe(true)

    await wrapper.setProps({ modelValue: [] })
    expect(wrapper.find('input[type="hidden"]').exists()).toBe(false)
    wrapper.unmount()
  })
})

describe('GrInputTag — признак состояния', () => {
  it('success и warning несут не только цвет: иконка плюс подпись в описании поля', () => {
    for (const state of ['success', 'warning'] as const) {
      const wrapper = mount(GrInputTag, { props: { ...{ modelValue: [] }, state } })

      // Иконка — для глаз, поэтому от скринридера скрыта: смысл ему несёт подпись.
      expect(wrapper.get('[data-gr-input-tag-state]').attributes('aria-hidden')).toBe('true')

      const text = wrapper.get('[data-gr-input-tag-state-text]')
      expect(text.text()).not.toBe('')

      // Без этой связи подпись видна только глазами — то есть не существует.
      const describedBy = wrapper.get('input').attributes('aria-describedby') ?? ''
      expect(describedBy.split(' ')).toContain(text.attributes('id'))
    }
  })

  it('у default и danger признака нет', () => {
    for (const state of ['default', 'danger'] as const) {
      const wrapper = mount(GrInputTag, { props: { ...{ modelValue: [] }, state } })
      expect(wrapper.find('[data-gr-input-tag-state]').exists()).toBe(false)
    }
  })

  it('невалидность гасит признак, даже если state=success', () => {
    const wrapper = mount(GrInputTag, { props: { ...{ modelValue: [] }, state: 'success', invalid: true } })
    expect(wrapper.find('[data-gr-input-tag-state]').exists()).toBe(false)
  })
})

/**
 * Правка тега на месте. До неё чип либо существовал, либо удалялся целиком:
 * опечатка в длинном теге стоила полного перенабора.
 */
describe('GrInputTag — правка тега', () => {
  const TAGS = ['vue', 'design-system', 'tokens']

  function mountEditable(props: Record<string, unknown> = {}) {
    return mount(GrInputTag, {
      props: { modelValue: TAGS.slice(), editable: true, ...props },
      attachTo: document.body,
    })
  }

  const chips = (w: ReturnType<typeof mountEditable>) => w.findAll('[data-testid="gr-input-tag-item"]')
  const editField = (w: ReturnType<typeof mountEditable>) => w.find('[data-testid="gr-input-tag-edit"]')

  async function openEdit(w: ReturnType<typeof mountEditable>, index: number) {
    await chips(w)[index].trigger('keydown', { key: 'F2' })
    await nextTick()
    return editField(w)
  }

  it('без пропа правка не открывается ни клавишей, ни двойным кликом', async () => {
    const wrapper = mount(GrInputTag, { props: { modelValue: TAGS.slice() } })

    await chips(wrapper)[0].trigger('keydown', { key: 'F2' })
    await chips(wrapper)[0].trigger('dblclick')

    expect(editField(wrapper).exists()).toBe(false)

    wrapper.unmount()
  })

  it('F2 открывает поле с текущим значением', async () => {
    const wrapper = mountEditable()

    const field = await openEdit(wrapper, 1)
    expect(field.exists()).toBe(true)
    expect((field.element as HTMLInputElement).value).toBe('design-system')

    wrapper.unmount()
  })

  it('двойной клик открывает правку', async () => {
    const wrapper = mountEditable()

    await chips(wrapper)[0].trigger('dblclick')
    await nextTick()

    expect(editField(wrapper).exists()).toBe(true)

    wrapper.unmount()
  })

  it('Enter подтверждает: модель, change и edit', async () => {
    const wrapper = mountEditable()

    const field = await openEdit(wrapper, 1)
    await field.setValue('design-tokens')
    await field.trigger('keydown', { key: 'Enter' })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(['vue', 'design-tokens', 'tokens'])
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toEqual(['vue', 'design-tokens', 'tokens'])
    expect(wrapper.emitted('edit')?.at(-1)).toEqual(['design-tokens', 1, 'design-system'])
    expect(await announced()).toBe('Tag changed: design-tokens')

    wrapper.unmount()
  })

  it('Escape отменяет и модель не трогает', async () => {
    const wrapper = mountEditable()

    const field = await openEdit(wrapper, 1)
    await field.setValue('что-то другое')
    await field.trigger('keydown', { key: 'Escape' })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(editField(wrapper).exists()).toBe(false)

    wrapper.unmount()
  })

  /**
   * Уход фокуса подтверждает, а не отменяет: правка начинается с существующего
   * значения, и тихо вернуть набранное — тот исход, который удивит. Отказаться
   * есть чем — `Escape`.
   */
  it('уход фокуса подтверждает правку', async () => {
    const wrapper = mountEditable()

    const field = await openEdit(wrapper, 0)
    await field.setValue('vue3')
    await field.trigger('blur')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(['vue3', 'design-system', 'tokens'])

    wrapper.unmount()
  })

  it('пустое значение удаляет тег и эмитит remove, а не edit', async () => {
    const wrapper = mountEditable()

    const field = await openEdit(wrapper, 1)
    await field.setValue('   ')
    await field.trigger('keydown', { key: 'Enter' })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(['vue', 'tokens'])
    expect(wrapper.emitted('remove')?.at(-1)).toEqual(['design-system', 1])
    expect(wrapper.emitted('edit')).toBeUndefined()

    wrapper.unmount()
  })

  /**
   * Проверка дубликатов обязана исключать сам правимый индекс: иначе тег
   * нельзя было бы подтвердить самим собой.
   */
  it('тег подтверждается самим собой, но не чужим значением', async () => {
    const wrapper = mountEditable()

    const same = await openEdit(wrapper, 0)
    await same.trigger('keydown', { key: 'Enter' })
    await nextTick()
    expect(editField(wrapper).exists()).toBe(false)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    const clash = await openEdit(wrapper, 0)
    await clash.setValue('tokens')
    await clash.trigger('keydown', { key: 'Enter' })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    wrapper.unmount()
  })

  it('достигнутый предел правку не блокирует: набор от неё не растёт', async () => {
    const wrapper = mountEditable({ max: 3 })

    const field = await openEdit(wrapper, 2)
    await field.setValue('tokens-v2')
    await field.trigger('keydown', { key: 'Enter' })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(['vue', 'design-system', 'tokens-v2'])

    wrapper.unmount()
  })

  it('readonly и disabled правку не открывают', async () => {
    for (const lock of [{ readonly: true }, { disabled: true }]) {
      const wrapper = mountEditable(lock)

      await chips(wrapper)[0].trigger('keydown', { key: 'F2' })
      await chips(wrapper)[0].trigger('dblclick')
      await nextTick()

      expect(editField(wrapper).exists()).toBe(false)

      wrapper.unmount()
    }
  })

  it('отказ beforeAdd возвращает прежнее значение и эмитит reject', async () => {
    const wrapper = mountEditable({ beforeAdd: (tag: string) => tag !== 'нельзя' })

    const field = await openEdit(wrapper, 0)
    await field.setValue('нельзя')
    await field.trigger('keydown', { key: 'Enter' })
    await nextTick()
    await nextTick()

    expect(wrapper.emitted('reject')?.at(-1)).toEqual(['нельзя'])
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(editField(wrapper).exists()).toBe(false)

    wrapper.unmount()
  })

  it('в режиме правки показывается поле, а не пользовательский слот', async () => {
    const wrapper = mount(GrInputTag, {
      props: { modelValue: TAGS.slice(), editable: true },
      slots: { tag: '<span data-testid="own-tag">своё</span>' },
      attachTo: document.body,
    })

    expect(wrapper.findAll('[data-testid="own-tag"]')).toHaveLength(3)

    await chips(wrapper)[0].trigger('keydown', { key: 'F2' })
    await nextTick()

    expect(wrapper.findAll('[data-testid="own-tag"]')).toHaveLength(2)
    expect(editField(wrapper).exists()).toBe(true)

    wrapper.unmount()
  })

  /**
   * Клавиши редактора не должны доходить до чипа: на нём висит `onTagKeydown`,
   * и `Backspace` там значит «удалить тег». Без гашения стирание символа сносило
   * бы правящийся тег целиком, а стрелки увозили бы фокус на соседа.
   */
  it('клавиши редактора не утекают на чип', async () => {
    const wrapper = mountEditable()

    const field = await openEdit(wrapper, 1)
    await field.trigger('keydown', { key: 'Backspace' })
    await nextTick()

    expect(wrapper.emitted('remove')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(editField(wrapper).exists()).toBe(true)

    await field.trigger('keydown', { key: 'ArrowLeft' })
    await nextTick()
    expect(editField(wrapper).exists()).toBe(true)

    wrapper.unmount()
  })

  /**
   * Ключ чипа обязан быть индексом, а не значением: иначе коммит меняет ключ,
   * Vue пересоздаёт чип, фокус падает на `body` — и `GrFormField` принимает это
   * за уход из поля и гоняет валидацию на каждую правку.
   */
  it('коммит не пересоздаёт чип: узел тот же', async () => {
    const wrapper = mountEditable()
    const before = chips(wrapper)[1].element

    const field = await openEdit(wrapper, 1)
    await field.setValue('design-tokens')
    await field.trigger('keydown', { key: 'Enter' })
    await nextTick()

    // Модель обязана вернуться пропом: без этого набор в разметке не менялся
    // бы вовсе, и проверка была бы зелёной при любом ключе.
    await wrapper.setProps({ modelValue: wrapper.emitted('update:modelValue')!.at(-1)![0] as string[] })
    await nextTick()

    // Ключ по значению пересоздал бы чип: крестик под фокусом исчезает, фокус
    // падает на `body`, и `GrFormField` принимает это за уход из поля —
    // валидация запускается на каждую правку тега.
    expect(chips(wrapper)[1].element).toBe(before)

    wrapper.unmount()
  })

  it('после коммита фокус на крестике того же чипа, и наружу не ушло ни одного blur', async () => {
    const wrapper = mountEditable()

    const field = await openEdit(wrapper, 1)
    await field.setValue('design-tokens')
    await field.trigger('keydown', { key: 'Enter' })
    await nextTick()
    await nextTick()

    const closes = wrapper.findAll('[data-gr-chip-close]')
    expect(document.activeElement).toBe(closes[1].element)
    expect(wrapper.emitted('blur')).toBeUndefined()

    wrapper.unmount()
  })

  /**
   * Крестик на время правки **остаётся**: он цель roving-кольца и точка, куда
   * возвращается фокус. Спрячь его — и ряд чипов теряет таб-стоп целиком, а
   * возвращать фокус после правки становится некуда.
   */
  it('крестик на время правки остаётся, и таб-стоп в ряду по-прежнему один', async () => {
    const wrapper = mountEditable()

    expect(wrapper.findAll('[data-gr-chip-close]')).toHaveLength(3)

    await chips(wrapper)[0].trigger('keydown', { key: 'F2' })
    await nextTick()

    expect(wrapper.findAll('[data-gr-chip-close]')).toHaveLength(3)
    expect(wrapper.findAll('[data-gr-chip-close][tabindex="0"]')).toHaveLength(1)

    wrapper.unmount()
  })
})
