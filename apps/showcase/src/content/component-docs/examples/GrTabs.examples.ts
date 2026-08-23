import type { ShowcaseComponentExampleDoc } from '../types'

export const grTabsExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'tabs-activation',
    title: 'Режим активации и вертикальные вкладки',
    description: '`activationMode="manual"` двигает стрелками только фокус, `orientation="vertical"` разворачивает список в колонку.',
    status: 'ready',
    previewKey: 'gr-tabs-activation',
  },
  {
    id: 'tabs-basic-switch',
    title: 'Basic switching with controlled state',
    description: 'Базовый controlled-pattern: `GrTabs` хранит только выбранное значение, а содержимое панели принадлежит странице.',
    status: 'ready',
    previewKey: 'gr-tabs-basic-switch',
  },
  {
    id: 'tabs-closable',
    title: 'Closable tabs and the empty row',
    description: '`closable` вешает крестик на вкладки и включает закрытие по `Delete`/`Backspace`; `closable: false` у отдельной вкладки закрепляет её. Крестик — намеренно не кнопка: вложенный интерактив внутри `role="tab"` теряется у скринридера, поэтому клик по нему разбирает сама вкладка, а про клавишу сообщает `aria-keyshortcuts`. Закройте все вкладки — на месте ряда появится текст пустого состояния.',
    status: 'ready',
    previewKey: 'gr-tabs-closable',
    note: 'Компонент эмитит только `close(value)` — список `tabs` остаётся у потребителя: закрытие может не состояться («сохранить изменения?»), и переключать вкладку заранее нельзя. Фокус после закрытия компонент возвращает сам, как только список действительно укоротился.',
  },
  {
    id: 'tabs-badge-navigation',
    title: 'Tabs with badges for queue-like navigation',
    description: 'Показываем `badge` не как украшение, а как часть операционного UI — очереди, ревью, blocked items и другие counters.',
    status: 'ready',
    previewKey: 'gr-tabs-badge-navigation',
  },
  {
    id: 'tabs-panel-layout',
    title: 'Tabs as page-level panel switcher',
    description: 'Документируем ключевую идею: `GrTabs` — это navigation primitive, а не готовая система вкладочных панелей с собственной разметкой.',
    status: 'ready',
    previewKey: 'gr-tabs-panel-layout',
    note: 'Этот сценарий помогает не ожидать от компонента скрытой магии с panels/portals: orchestration остаётся снаружи.',
  },
  {
    id: 'tabs-sizes',
    title: 'Шкала размеров',
    description: 'Высота вкладки повторяет шкалу `GrButton` — вкладки часто стоят с кнопкой в один ряд. Счётчик у вкладки масштабируется вместе с подписью.',
    status: 'ready',
    previewKey: 'gr-tabs-sizes',
  },
]
