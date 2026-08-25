import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

export const grContextMenuConfig = defineGranularComponent(import.meta.url, {
  name: 'GrContextMenu',
  // Хук снятия потолка ширины стоит в шаблоне литералом, но объявлен и здесь:
  // цена ошибки — меню, вылезающее за край панели, а цена строки — ноль.
  safelist: ['[--gr-popover-max-width:100vw]'],
  // Компонент рендерит и слой, и пункты: без обоих рёбер у потребителя,
  // выбравшего только контекстное меню, панель приедет без фона, а пункты — без цветов.
  dependencies: ['GrPopover', 'GrDropdownMenu'],
})
