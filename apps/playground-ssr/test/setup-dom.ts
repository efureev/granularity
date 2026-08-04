/**
 * Недостающие браузерные API для jsdom-части стенда.
 *
 * jsdom не реализует `ResizeObserver`. Сама библиотека это переживает — она
 * защищается явно (`typeof ResizeObserver === 'undefined'` в
 * `useAddonMeasurement`), — но `@headlessui/vue` в `Dialog` обращается к
 * конструктору напрямую. На гидрации трёх страниц стенда (`GrModal`,
 * `GrDrawer`, `GrImageViewer`) это давало три unhandled rejection:
 * тесты при этом проходили, а `vitest` возвращал ненулевой код.
 *
 * Пустая реализация здесь достаточна и ничего не ослабляет: `Dialog` заводит
 * наблюдателя уже после монтирования, ради замеров overflow, — на совпадение
 * серверной и клиентской разметки, ради которого стенд и существует, он не
 * влияет.
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
