/**
 * Группы каталога компонентов — в порядке холста «Глина · компоненты» — и
 * адреса страниц. Чистые данные без документации: их читают и приложение
 * (`catalog.ts`), и e2e, у которого нет сборки и `import.meta.glob`.
 */
export interface CatalogGroup {
  id: string
  title: string
  lead: string
  /** Компоненты пакета группы — в порядке показа. */
  components: readonly string[]
}

export const catalogGroups: readonly CatalogGroup[] = [
  {
    id: 'buttons',
    title: 'Кнопки',
    lead: 'Действие и группа действий.',
    components: ['GrButton', 'GrButtonGroup'],
  },
  {
    id: 'fields',
    title: 'Поля ввода',
    lead: 'Текст, числа, теги, коды, файлы и форма вокруг них.',
    components: ['GrInput', 'GrTextarea', 'GrNumberInput', 'GrInputTag', 'GrOtpInput', 'GrAutocomplete', 'GrFormField', 'GrForm', 'GrFormSection', 'GrFormFile', 'GrFileUpload', 'GrFilePreview'],
  },
  {
    id: 'choice',
    title: 'Выбор',
    lead: 'Отметки, переключатели и значения на шкале.',
    components: ['GrCheckbox', 'GrCheckboxGroup', 'GrRadio', 'GrRadioGroup', 'GrSwitch', 'GrSlider', 'GrRating', 'GrColorPicker'],
  },
  {
    id: 'overlays',
    title: 'Всплывающие',
    lead: 'Списки, меню, подсказки и палитра команд над страницей.',
    components: ['GrSelect', 'GrTreeSelect', 'GrDropdown', 'GrDropdownMenu', 'GrContextMenu', 'GrTooltip', 'GrPopover', 'GrCommandPalette'],
  },
  {
    id: 'tabs',
    title: 'Вкладки и сегменты',
    lead: 'Разделы одной страницы и выбор вида.',
    components: ['GrTabs', 'GrTabPanels', 'GrTabsWithPanels', 'GrSegmented'],
  },
  {
    id: 'status',
    title: 'Статусы',
    lead: 'Метки, чипы, сообщения и тосты.',
    components: ['GrBadge', 'GrBadgeWrap', 'GrChip', 'GrChipGroup', 'GrAlert', 'GrToaster', 'GrResponseErrorBanner'],
  },
  {
    id: 'surfaces',
    title: 'Поверхности',
    lead: 'Карточки, разделители, свойства, цифры и пустые состояния.',
    components: ['GrCard', 'GrDivider', 'GrDescriptionList', 'GrEmptyState', 'GrStatistic', 'GrDelta', 'GrValue', 'GrCollapse', 'GrList'],
  },
  {
    id: 'modals',
    title: 'Модальные окна',
    lead: 'Окно, подтверждение, ввод и шторка.',
    components: ['GrDialog', 'GrModal', 'GrDrawer', 'GrConfirmDialog', 'GrPromptDialog', 'GrDialogService'],
  },
  {
    id: 'data',
    title: 'Данные',
    lead: 'Таблицы, страницы, перенос и порядок записей.',
    components: ['GrTable', 'GrDataTable', 'GrPagination', 'GrTransfer', 'GrSortableList', 'GrJsonViewer'],
  },
  {
    id: 'navigation',
    title: 'Навигация',
    lead: 'Оболочка приложения, путь, шаги, дерево и оглавление.',
    components: ['GrSidebar', 'GrNavbar', 'GrBottomNav', 'GrBreadcrumbs', 'GrSteps', 'GrLink', 'GrScrollSpy', 'GrAffix', 'GrTree', 'GrTreeSections'],
  },
  {
    id: 'waiting',
    title: 'Ожидание',
    lead: 'Прогресс, заготовки и загрузка.',
    components: ['GrProgressBar', 'GrProgressCircle', 'GrSkeleton', 'GrLoading'],
  },
  {
    id: 'misc',
    title: 'Остальное',
    lead: 'Люди, события, медиа, раскладка и настройка поддерева.',
    components: ['GrAvatar', 'GrTimeline', 'GrIcon', 'GrKbd', 'GrCarousel', 'GrImageViewer', 'GrSplitter', 'GrConfigProvider'],
  },
]

/** Страницы со своими вкладками (`componentViews` в `specs.ts`): песочница и спецификация вместо образцов каталога. */
export const OWN_PAGES: readonly string[] = ['button']

/** Компонент пакета, у которого нет своей страницы: его показывает страница соседа. */
const SHOWN_WITH: Readonly<Record<string, string>> = {
  GrButtonGroup: 'GrButton',
}

/** Компонент пакета, чей тег в шаблоне называется иначе: сервис диалогов ставит хост. */
export const COMPONENT_TAGS: Readonly<Record<string, string>> = {
  GrDialogService: 'GrDialogServiceHost',
}

/** Адрес страницы: `GrInputTag` → `input-tag`. */
export function componentSlug(name: string): string {
  return name.replace(/^Gr/, '').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

/** Страницы каталога: главный компонент и показанные вместе с ним. */
export function catalogPages(): { name: string, group: string, exports: string[] }[] {
  return catalogGroups.flatMap(group => group.components
    .filter(name => SHOWN_WITH[name] === undefined)
    .map(name => ({ name, group: group.id, exports: [name, ...Object.keys(SHOWN_WITH).filter(other => SHOWN_WITH[other] === name)] })))
}
