import type { ShowcaseComponentExampleDoc } from '../types'

export const grDropdownExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'dropdown-basic-menu',
    title: 'Basic actions menu',
    description: 'Стартовый сценарий для `GrDropdown`: trigger/content slots, короткий action list и автоматическое закрытие по клику.',
    status: 'ready',
    previewKey: 'gr-dropdown-basic-menu',  },
  {
    id: 'dropdown-alignment-width',
    title: 'Alignment and width presets',
    description: 'Отдельно сравниваем `align` и `width`, чтобы быстро проверить positioning и ожидаемую ширину выпадающего контента.',
    status: 'ready',
    previewKey: 'gr-dropdown-alignment-width',  },
  {
    id: 'dropdown-persistent-content',
    title: 'Persistent content with manual close',
    description: 'Показываем `closeOnContentClick=false`, когда внутри dropdown есть mini-form/filter pane и компонент не должен закрываться после каждого клика.',
    status: 'ready',
    previewKey: 'gr-dropdown-persistent-content',    note: 'Это типичный composition-case: dropdown используется не как простое menu, а как контейнер для mini-control surface.',
  },
  {
    id: 'dropdown-hover',
    title: 'Hover trigger and disabled state',
    description: '`trigger="hover"` открывает панель по наведению с задержками `openDelay`/`closeDelay` — курсор успевает дойти до пункта через зазор `offset`. Клик и клавиатура при этом продолжают работать: меню, доступное только мышью, недоступно с клавиатуры вовсе. `disabled` закрывает панель и не даёт открыть её ничем, оставляя триггер фокусируемым.',
    status: 'ready',
    previewKey: 'gr-dropdown-hover',  },
]
