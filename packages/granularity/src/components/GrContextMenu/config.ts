import { defineGranumComponent } from '@feugene/granum/contract'

export const grContextMenuConfig = defineGranumComponent(import.meta.url, {
  name: 'GrContextMenu',
  // Компонент рендерит и слой, и пункты: без обоих рёбер у потребителя,
  // выбравшего только контекстное меню, панель приедет без фона, а пункты — без цветов.
  dependencies: ['GrPopover', 'GrDropdownMenu'],
})
