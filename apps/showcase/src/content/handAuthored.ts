import type {
  ShowcaseEntityMetadataOverride,
  ShowcaseEntityRegistryItem,
} from './model.ts'

const componentGroups = {
  actions: ['DsButton', 'DsButtonGroup', 'DsLink'],
  feedback: ['DsAlert', 'DsBadge', 'DsBadgeWrap', 'DsEmptyState', 'DsLoading', 'DsProgressBar', 'DsSkeleton', 'DsToaster'],
  navigation: ['DsBottomNav', 'DsNavbar', 'DsPagination', 'DsSidebar', 'DsTabs', 'DsTooltip'],
  overlays: ['DsCollapse', 'DsConfirmDialog', 'DsDialog', 'DsDrawer', 'DsDropdown', 'DsDropdownMenu', 'DsImageViewer', 'DsModal', 'DsPromptDialog'],
  forms: ['DsCheckbox', 'DsFileUpload', 'DsFormFile', 'DsFormField', 'DsFormSection', 'DsInput', 'DsNumberInput', 'DsInputTag', 'DsRadio', 'DsRadioGroup', 'DsSegmented', 'DsSelect', 'DsSwitch', 'DsTextarea', 'DsTreeSelect'],
  data: ['DsAvatar', 'DsCard', 'DsDataTable', 'DsIcon', 'DsList', 'DsTable', 'DsTree'],
} as const satisfies Record<string, readonly string[]>

const componentSummaryOverrides = {
  DsAlert: 'Показывает важное сообщение, предупреждение или статус действия.',
  DsAvatar: 'Отображает фото пользователя, а при отсутствии — инициалы или fallback.',
  DsBadge: 'Короткая метка для статуса, категории или счётчика.',
  DsBadgeWrap: 'Добавляет поверх элемента бейдж со статусом или количеством.',
  DsBottomNav: 'Нижняя навигация для ключевых разделов мобильного интерфейса.',
  DsButton: 'Запускает основное действие в форме, диалоге или панели.',
  DsButtonGroup: 'Собирает связанные кнопки в компактную группу действий.',
  DsCard: 'Контейнер для смыслового блока с контентом и действиями.',
  DsCheckbox: 'Позволяет включать независимые опции и выбирать несколько пунктов.',
  DsCollapse: 'Сворачивает и раскрывает дополнительный контент по запросу.',
  DsConfirmDialog: 'Просит подтвердить потенциально важное или опасное действие.',
  DsDataTable: 'Таблица для больших наборов данных с сортировкой и фильтрацией.',
  DsDialog: 'Диалоговое окно для подтверждений, форм и фокусных сценариев.',
  DsDrawer: 'Выезжающая панель для второстепенного контента и быстрых действий.',
  DsDropdown: 'Открывает всплывающий список действий или вариантов рядом с триггером.',
  DsDropdownMenu: 'Готовое меню действий для кнопки, ссылки или контекстного вызова.',
  DsEmptyState: 'Объясняет пустое состояние и подсказывает следующий шаг пользователю.',
  DsFileUpload: 'Принимает файлы через выбор или перетаскивание и показывает их состояние.',
  DsFormFile: 'Связывает загрузку файлов с полем формы и валидацией.',
  DsFormField: 'Объединяет label, control, hint и ошибку в одно поле.',
  DsFormSection: 'Группирует связанные поля формы в понятный смысловой раздел.',
  DsIcon: 'Показывает иконку как самостоятельный элемент интерфейса.',
  DsImageViewer: 'Открывает изображение в удобном режиме просмотра и масштабирования.',
  DsInput: 'Однострочное поле для текста, поиска и коротких значений.',
  DsInputTag: 'Позволяет вводить и редактировать список тегов или значений.',
  DsLink: 'Навигационная ссылка для перехода между страницами и ресурсами.',
  DsList: 'Отображает вертикальный список однотипных элементов или действий.',
  DsLoading: 'Показывает, что раздел или действие сейчас загружается.',
  DsModal: 'Модальное окно для важного сценария, который временно блокирует фон.',
  DsNavbar: 'Верхняя навигация для основных разделов и глобальных действий.',
  DsNumberInput: 'Поле для чисел с пошаговым изменением и контролем диапазона.',
  DsPagination: 'Разбивает длинный список на страницы и управляет переходами.',
  DsProgressBar: 'Показывает прогресс выполнения задачи или загрузки.',
  DsPromptDialog: 'Запрашивает у пользователя короткий текстовый ввод в диалоге.',
  DsRadio: 'Один вариант выбора внутри группы взаимоисключающих опций.',
  DsRadioGroup: 'Собирает radio-опции в единый сценарий выбора одного варианта.',
  DsSegmented: 'Компактный single-choice control с pills/button представлением и движущимся индикатором выбора.',
  DsSelect: 'Выбор одного или нескольких значений из списка опций.',
  DsSidebar: 'Боковая навигация для разделов, фильтров и вспомогательных действий.',
  DsSkeleton: 'Временный каркас интерфейса, пока контент ещё загружается.',
  DsSwitch: 'Быстро включает и выключает бинарную настройку.',
  DsTable: 'Простая таблица для компактного показа структурированных данных.',
  DsTabs: 'Переключает связанные разделы контента без смены страницы.',
  DsTextarea: 'Многострочное поле для длинного текста и комментариев.',
  DsToaster: 'Показывает краткие всплывающие уведомления о результате действий.',
  DsTooltip: 'Показывает короткую подсказку при наведении или фокусе.',
  DsTree: 'Показывает иерархию элементов с раскрытием узлов и выбором.',
  DsTreeSelect: 'Выбор значения из древовидной структуры в одном контроле.',
} as const satisfies Record<string, string>

export function resolveHandAuthoredComponentGroup(componentName: string): string {
  for (const [group, componentNames] of Object.entries(componentGroups)) {
    if (componentNames.includes(componentName))
      return group
  }

  return 'misc'
}

export const showcaseEntityMetadataOverrides: Record<string, ShowcaseEntityMetadataOverride> = {
  'component:DsButton': {
    group: 'actions',
    tags: ['featured', 'starter'],
    examples: [
      {
        id: 'button-loading',
        title: 'Loading and icon-only',
        description: 'Отдельный сценарий для loading-state и icon-only кнопок.',
        status: 'planned',
      },
    ],
  },
  'component:DsFileUpload': {
    group: 'forms',
    tags: ['featured', 'integration'],
    examples: [
      {
        id: 'file-upload-validation',
        title: 'Validation bridge',
        description: 'Покажем связку `DsFileUpload` с validator utilities и реальными error states.',
        status: 'planned',
      },
    ],
  },
  'component:DsSelect': {
    group: 'forms',
    tags: ['featured', 'complex'],
    examples: [
      {
        id: 'select-modes',
        title: 'Single, multiple and clearable',
        description: 'Планируем разнести основные режимы `DsSelect` по отдельным demo-картам.',
        status: 'planned',
      },
    ],
  },
  'directive:vLoading': {
    summary: 'Ключевая директива для overlay/loading-сценариев и companion API `createLoading`.',
    group: 'overlays',
    tags: ['featured'],
    examples: [
      {
        id: 'directive-loading-overlay',
        title: 'Element loading overlay',
        description: 'Покажем loading-overlay на реальных элементах и контейнерах.',
        status: 'planned',
      },
    ],
  },
  'directive:createLoading': {
    summary: 'Helper-API рядом с `vLoading`, который требует отдельной демонстрации imperative сценариев.',
    group: 'overlays',
    tags: ['featured'],
  },
  'composable:useTheme': {
    summary: 'Composables showcase уже использует `useTheme()` в app shell, поэтому он станет первым runnable recipe.',
    group: 'runtime',
    tags: ['featured', 'shell'],
    examples: [
      {
        id: 'use-theme-runtime',
        title: 'Runtime theme switch',
        description: 'Продемонстрируем раннюю инициализацию темы и runtime-переключение интерфейса.',
        status: 'planned',
      },
    ],
  },
  'composable:useToast': {
    summary: 'Toast orchestration composable для будущих feedback/demo сценариев.',
    group: 'feedback',
    tags: ['featured'],
    examples: [
      {
        id: 'use-toast-push-dismiss',
        title: 'Push, dismiss and clear',
        description: 'Запланированы сценарии жизненного цикла toast-уведомлений.',
        status: 'planned',
      },
    ],
  },
  'utility:runFileValidators': {
    summary: 'Главная orchestration utility для пайплайна file validation.',
    group: 'validation',
    tags: ['featured', 'integration'],
    examples: [
      {
        id: 'run-file-validators-pipeline',
        title: 'Validation pipeline',
        description: 'Покажем chained-проверки файла и агрегирование ошибок.',
        status: 'planned',
      },
    ],
  },
  'utility:acceptValidator': {
    summary: 'Базовый validator для `accept`-ограничений при выборе файлов.',
    group: 'validation',
    tags: ['featured'],
  },
}

export function applyHandAuthoredEntityMetadata(
  entity: ShowcaseEntityRegistryItem,
): ShowcaseEntityRegistryItem {
  const override = showcaseEntityMetadataOverrides[entity.id]
  const defaultGroup = entity.kind === 'component'
    ? resolveHandAuthoredComponentGroup(entity.name)
    : entity.group
  const defaultSummary = entity.kind === 'component'
    ? componentSummaryOverrides[entity.name] ?? entity.summary
    : entity.summary

  return {
    ...entity,
    group: override?.group ?? defaultGroup,
    summary: override?.summary ?? defaultSummary,
    tags: [...new Set([...(entity.tags ?? []), ...(override?.tags ?? [])])],
    examples: override?.examples?.length
      ? override.examples
      : entity.examples.length
        ? entity.examples
        : [
            {
              id: `${entity.name}-planned-primary`,
              title: 'Planned demo coverage',
              description: `Для ${entity.name} будет добавлен отдельный showcase-сценарий на следующих этапах.`,
              status: 'planned',
            },
          ],
  }
}