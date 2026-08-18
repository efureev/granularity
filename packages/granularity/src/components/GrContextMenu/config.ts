import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

export const grContextMenuConfig = defineGranularComponent(import.meta.url, {
  name: 'GrContextMenu',
  // Компонент рендерит и слой, и пункты: без обоих рёбер у потребителя,
  // выбравшего только контекстное меню, панель приедет без фона, а пункты — без цветов.
  dependencies: ['GrPopover', 'GrDropdownMenu'],
})
