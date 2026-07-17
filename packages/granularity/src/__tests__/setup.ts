// jsdom не выполняет реальный layout, поэтому `document.documentElement.clientWidth/clientHeight`
// всегда возвращают `0`. `@floating-ui/dom` берёт из них размер viewport для `flip`/`shift`
// (см. `getViewportRect` в `@floating-ui/dom`), и с нулевым viewport считает, что панели
// нигде не хватает места, — это ломает позиционирование floating-компонентов
// (GrDropdown/GrSelect/GrTreeSelect/GrTooltip) во всех тестах, где панель открывается.
// Значения ниже совпадают с дефолтными `window.innerWidth`/`innerHeight` в jsdom (1024×768).
Object.defineProperty(document.documentElement, 'clientWidth', {
  configurable: true,
  get: () => window.innerWidth,
})
Object.defineProperty(document.documentElement, 'clientHeight', {
  configurable: true,
  get: () => window.innerHeight,
})
