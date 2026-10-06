import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import { defineComponent, h, onUnmounted } from 'vue'

/**
 * Компонент, смонтированный тестом, не переживает тест.
 *
 * Иначе его таймеры срабатывают позже — в чужом тесте или уже после разбора
 * окружения файла, когда из глобалов ушли DOM-конструкторы. Так у ядра падал
 * прогон CI: таймер подсветки `GrTransfer` пережил тест, и перерисовка звала
 * `el instanceof HTMLElement` без `HTMLElement` — `ReferenceError` при зелёных
 * тестах и коде выхода 1. Тесты идут по порядку, поэтому второй видит итог
 * первого.
 */
let unmounted = false

const Probe = defineComponent({
  setup() {
    onUnmounted(() => {
      unmounted = true
    })

    return () => h('div')
  },
})

it('тест монтирует компонент и не размонтирует его сам', () => {
  mount(Probe)

  expect(unmounted).toBe(false)
})

it('к следующему тесту компонент размонтирован', () => {
  expect(unmounted).toBe(true)
})
