import { enableAutoUnmount } from '@vue/test-utils'
import { afterEach } from 'vitest'

/**
 * jsdom не реализует ни `ResizeObserver`, ни `IntersectionObserver`, а пакет
 * держит на первом выбор брейкпоинта и на втором ленивый монтаж содержимого.
 * Оба заглушаются здесь пустышками: тесты задают ширину и видимость напрямую,
 * а компонент обязан переживать окружение, где наблюдателей нет вовсе — это
 * тот же путь, которым он идёт на сервере.
 */
class NoopObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): [] { return [] }
}

globalThis.ResizeObserver ??= NoopObserver as unknown as typeof ResizeObserver
globalThis.IntersectionObserver ??= NoopObserver as unknown as typeof IntersectionObserver

/**
 * Компонент, смонтированный тестом, размонтируется после него. Иначе его
 * таймеры срабатывают позже — в чужом тесте или уже после разбора окружения
 * файла, когда из глобалов ушли DOM-конструкторы: так у ядра таймер подсветки
 * `GrTransfer` ронял прогон CI ошибкой `HTMLElement is not defined` при зелёных
 * тестах. Защищает правило `autoUnmount.test.ts`.
 */
enableAutoUnmount(afterEach)
