import type { ShowcaseComponentExampleDoc } from '../types'

export const grDrawerExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'drawer-filter-panel',
    title: 'Filter panel drawer',
    description: 'Базовый application-shell сценарий: панель справа открывает форму фильтров без ухода со страницы.',
    status: 'ready',
    previewKey: 'gr-drawer-filter-panel',  },
  {
    id: 'drawer-bottom-sheet',
    title: 'Bottom sheet',
    description: '`side="bottom"` — панель выезжает снизу, и `size` для неё означает высоту, а не ширину.',
    status: 'ready',
    previewKey: 'gr-drawer-bottom-sheet',  },
  {
    id: 'drawer-non-modal',
    title: 'Non-modal filters',
    description: '`:modal="false"` — ни подложки, ни блокировки скролла, ни ловушки фокуса: с таблицей продолжают работать при открытой панели.',
    status: 'ready',
    previewKey: 'gr-drawer-non-modal',  },
  {
    id: 'drawer-custom-header',
    title: 'Custom header',
    description: 'Слот `#header` заменяет шапку целиком — поиск вместо заголовка и своя кнопка вместо крестика; имя слоя остаётся скрытым заголовком.',
    status: 'ready',
    previewKey: 'gr-drawer-custom-header',  },
  {
    id: 'drawer-left-rail',
    title: 'Left navigation rail',
    description: '`side="left"` для навигации по разделам рабочего пространства.',
    status: 'ready',
    previewKey: 'gr-drawer-left-rail',  },
  {
    id: 'drawer-guarded-size',
    title: 'Size switch with guarded backdrop',
    description: 'Переключение шкалы размеров вместе с `closeOnBackdrop: false`.',
    status: 'ready',
    previewKey: 'gr-drawer-guarded-size',  },
  {
    id: 'drawer-persistent-form',
    title: 'Persistent form',
    description: '`persistent` запрещает бэкдроп и Esc на время сохранения; кнопка закрытия остаётся.',
    status: 'ready',
    previewKey: 'gr-drawer-persistent-form',  },
]
