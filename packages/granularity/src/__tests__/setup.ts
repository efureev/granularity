import { enableAutoUnmount } from '@vue/test-utils'
import { afterEach } from 'vitest'

// jsdom не выполняет реальный layout, поэтому `document.documentElement.clientWidth/clientHeight`
// всегда возвращают `0`. `@floating-ui/dom` берёт из них размер viewport для `flip`/`shift`
// (см. `getViewportRect` в `@floating-ui/dom`), и с нулевым viewport считает, что панели
// нигде не хватает места, — это ломает позиционирование floating-компонентов
// (GrDropdown/GrSelect/GrTreeSelect/GrTooltip) во всех тестах, где панель открывается.
// Значения ниже совпадают с дефолтными `window.innerWidth`/`innerHeight` в jsdom (1024×768).
//
// Файл общий на все тесты, а часть из них живёт в `environment: 'node'` — там
// проверяется серверное поведение, и `document` отсутствует по построению.
if (typeof document !== 'undefined') {
  Object.defineProperty(document.documentElement, 'clientWidth', {
    configurable: true,
    get: () => window.innerWidth,
  })
  Object.defineProperty(document.documentElement, 'clientHeight', {
    configurable: true,
    get: () => window.innerHeight,
  })
}

// Компонент, смонтированный тестом, размонтируется после него. Иначе его таймеры
// срабатывают позже — в чужом тесте или уже после разбора окружения файла, когда
// из глобалов ушли DOM-конструкторы: так `GrTransfer` с таймером подсветки на
// 1.2 с ронял прогон CI ошибкой `HTMLElement is not defined` при зелёных тестах.
// `resetGranularityDom` чистит `body`, но приложений Vue не размонтирует.
// Защищает правило `autoUnmount.test.ts`.
enableAutoUnmount(afterEach)
