/**
 * Недостающие браузерные API для jsdom-части стенда.
 *
 * jsdom не реализует `ResizeObserver`. Собственный код библиотеки это
 * переживает — он защищается явно (`typeof ResizeObserver === 'undefined'` в
 * `useAddonMeasurement`, `useZoomPan`), — но `@floating-ui/dom` в `autoUpdate`
 * обращается к конструктору напрямую. На гидрации страниц стенда это даёт
 * unhandled rejection: тесты при этом проходят, а `vitest` возвращает
 * ненулевой код.
 *
 * Пустая реализация достаточна и ничего не ослабляет: наблюдатель заводится
 * уже после монтирования, ради пересчёта позиции, — на совпадение серверной и
 * клиентской разметки, ради которого стенд и существует, он не влияет.
 *
 * **Условие `typeof window !== 'undefined'` принципиально.** `setupFiles`
 * выполняется для всех тестовых файлов, включая `ssr.test.ts` с
 * `environment: 'node'`. Определить там браузерный глобал значило бы сломать
 * ровно то, что стенд проверяет: серверные гарды вида
 * `typeof ResizeObserver === 'undefined'` увидели бы «браузер» и пошли бы по
 * клиентской ветке прямо во время серверного рендера.
 */
if (typeof window !== 'undefined' && !('ResizeObserver' in window)) {
  class ResizeObserverStub implements ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }

  globalThis.ResizeObserver = ResizeObserverStub
}
