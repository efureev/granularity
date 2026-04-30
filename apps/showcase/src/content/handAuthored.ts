import type {
  ShowcaseEntityMetadataOverride,
  ShowcaseEntityRegistryItem,
} from './model.ts'

const componentGroups = {
  actions: ['GrButton', 'GrButtonGroup', 'GrLink'],
  feedback: ['GrAlert', 'GrBadge', 'GrBadgeWrap', 'GrEmptyState', 'GrLoading', 'GrProgressBar', 'GrSkeleton', 'GrToaster'],
  navigation: ['GrBottomNav', 'GrNavbar', 'GrPagination', 'GrSidebar', 'GrTabs', 'GrTooltip'],
  overlays: ['GrCollapse', 'GrConfirmDialog', 'GrDialog', 'GrDrawer', 'GrDropdown', 'GrDropdownMenu', 'GrImageViewer', 'GrModal', 'GrPromptDialog'],
  forms: ['GrCheckbox', 'GrFileUpload', 'GrFormFile', 'GrFormField', 'GrFormSection', 'GrInput', 'GrNumberInput', 'GrInputTag', 'GrRadio', 'GrRadioGroup', 'GrSegmented', 'GrSelect', 'GrSwitch', 'GrTextarea', 'GrTreeSelect'],
  data: ['GrAvatar', 'GrCard', 'GrDataTable', 'GrIcon', 'GrList', 'GrTable', 'GrTree'],
} as const satisfies Record<string, readonly string[]>

const componentSummaryOverrides = {
  GrAlert: 'Показывает важное сообщение, предупреждение или статус действия.',
  GrAvatar: 'Отображает фото пользователя, а при отсутствии — инициалы или fallback.',
  GrBadge: 'Короткая метка для статуса, категории или счётчика.',
  GrBadgeWrap: 'Добавляет поверх элемента бейдж со статусом или количеством.',
  GrBottomNav: 'Нижняя навигация для ключевых разделов мобильного интерфейса.',
  GrButton: 'Запускает основное действие в форме, диалоге или панели.',
  GrButtonGroup: 'Собирает связанные кнопки в компактную группу действий.',
  GrCard: 'Контейнер для смыслового блока с контентом и действиями.',
  GrCheckbox: 'Позволяет включать независимые опции и выбирать несколько пунктов.',
  GrCollapse: 'Сворачивает и раскрывает дополнительный контент по запросу.',
  GrConfirmDialog: 'Просит подтвердить потенциально важное или опасное действие.',
  GrDataTable: 'Таблица для больших наборов данных с сортировкой и фильтрацией.',
  GrDialog: 'Диалоговое окно для подтверждений, форм и фокусных сценариев.',
  GrDrawer: 'Выезжающая панель для второстепенного контента и быстрых действий.',
  GrDropdown: 'Открывает всплывающий список действий или вариантов рядом с триггером.',
  GrDropdownMenu: 'Готовое меню действий для кнопки, ссылки или контекстного вызова.',
  GrEmptyState: 'Объясняет пустое состояние и подсказывает следующий шаг пользователю.',
  GrFileUpload: 'Принимает файлы через выбор или перетаскивание и показывает их состояние.',
  GrFormFile: 'Связывает загрузку файлов с полем формы и валидацией.',
  GrFormField: 'Объединяет label, control, hint и ошибку в одно поле.',
  GrFormSection: 'Группирует связанные поля формы в понятный смысловой раздел.',
  GrIcon: 'Показывает иконку как самостоятельный элемент интерфейса.',
  GrImageViewer: 'Открывает изображение в удобном режиме просмотра и масштабирования.',
  GrInput: 'Однострочное поле для текста, поиска и коротких значений.',
  GrInputTag: 'Позволяет вводить и редактировать список тегов или значений.',
  GrLink: 'Навигационная ссылка для перехода между страницами и ресурсами.',
  GrList: 'Отображает вертикальный список однотипных элементов или действий.',
  GrLoading: 'Показывает, что раздел или действие сейчас загружается.',
  GrModal: 'Модальное окно для важного сценария, который временно блокирует фон.',
  GrNavbar: 'Верхняя навигация для основных разделов и глобальных действий.',
  GrNumberInput: 'Поле для чисел с пошаговым изменением и контролем диапазона.',
  GrPagination: 'Разбивает длинный список на страницы и управляет переходами.',
  GrProgressBar: 'Показывает прогресс выполнения задачи или загрузки.',
  GrPromptDialog: 'Запрашивает у пользователя короткий текстовый ввод в диалоге.',
  GrRadio: 'Один вариант выбора внутри группы взаимоисключающих опций.',
  GrRadioGroup: 'Собирает radio-опции в единый сценарий выбора одного варианта.',
  GrSegmented: 'Компактный single-choice control с pills/button представлением и движущимся индикатором выбора.',
  GrSelect: 'Выбор одного или нескольких значений из списка опций.',
  GrSidebar: 'Боковая навигация для разделов, фильтров и вспомогательных действий.',
  GrSkeleton: 'Временный каркас интерфейса, пока контент ещё загружается.',
  GrSwitch: 'Быстро включает и выключает бинарную настройку.',
  GrTable: 'Простая таблица для компактного показа структурированных данных.',
  GrTabs: 'Переключает связанные разделы контента без смены страницы.',
  GrTextarea: 'Многострочное поле для длинного текста и комментариев.',
  GrToaster: 'Показывает краткие всплывающие уведомления о результате действий.',
  GrTooltip: 'Показывает короткую подсказку при наведении или фокусе.',
  GrTree: 'Показывает иерархию элементов с раскрытием узлов и выбором.',
  GrTreeSelect: 'Выбор значения из древовидной структуры в одном контроле.',
} as const satisfies Record<string, string>

export function resolveHandAuthoredComponentGroup(componentName: string): string {
  for (const [group, componentNames] of Object.entries(componentGroups)) {
    if ((componentNames as readonly string[]).includes(componentName))
      return group
  }

  return 'misc'
}

export const showcaseEntityMetadataOverrides: Record<string, ShowcaseEntityMetadataOverride> = {
  'component:GrButton': {
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
  'component:GrFileUpload': {
    group: 'forms',
    tags: ['featured', 'integration'],
    examples: [
      {
        id: 'file-upload-validation',
        title: 'Validation bridge',
        description: 'Покажем связку `GrFileUpload` с validator utilities и реальными error states.',
        status: 'planned',
      },
    ],
  },
  'component:GrSelect': {
    group: 'forms',
    tags: ['featured', 'complex'],
    examples: [
      {
        id: 'select-modes',
        title: 'Single, multiple and clearable',
        description: 'Планируем разнести основные режимы `GrSelect` по отдельным demo-картам.',
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
    ? (componentSummaryOverrides as Record<string, string>)[entity.name] ?? entity.summary
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