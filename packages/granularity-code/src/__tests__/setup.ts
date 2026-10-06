import { enableAutoUnmount } from '@vue/test-utils'
import { afterEach } from 'vitest'

/**
 * Компонент, смонтированный тестом, размонтируется после него. Иначе его
 * таймеры срабатывают позже — в чужом тесте или уже после разбора окружения
 * файла, когда из глобалов ушли DOM-конструкторы: так у ядра таймер подсветки
 * `GrTransfer` ронял прогон CI ошибкой `HTMLElement is not defined` при зелёных
 * тестах. Защищает правило `autoUnmount.test.ts`.
 */
enableAutoUnmount(afterEach)
