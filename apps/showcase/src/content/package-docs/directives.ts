import { createReadyExamples } from './shared'
import type { PackageDocOverride } from './types'

export const directivePackageDocOverrides: Record<string, PackageDocOverride> = {
  vAutofocus: {
    overview: [
      '`vAutofocus` откладывает фокус до `nextTick()` и `requestAnimationFrame()`, поэтому хорошо подходит для dialog/drawer-потоков.',
      'Директива умеет фокусировать как сам элемент, так и вложенный focusable control через `selector`.',
    ],
    examples: createReadyExamples([
      {
        id: 'v-autofocus-dialog',
        title: 'Focus on open inside dialog',
        description: 'Открываем dialog и передаём `selector`, чтобы фокус гарантированно попадал в поле ввода после анимации.',
        previewKey: 'v-autofocus-dialog',
        code: [
          "import { vAutofocus } from '@feugene/granularity/directives'",
          '',
          '<DsDialog v-model="open" title="Invite teammate">',
          '  <div v-autofocus="{ selector: \"input\", preventScroll: true }">',
          '    <DsInput placeholder="name@company.com" />',
          '  </div>',
          '</DsDialog>',
        ].join('\n'),
        note: 'Если пользователь явно перевёл фокус вручную, не стоит возвращать его обратно программно.',
      },
    ]),
    apiSections: [
      {
        key: 'parameters',
        title: 'Binding value',
        origin: 'manual',
        items: [
          { name: 'boolean', type: 'boolean', description: '`false` отключает автофокус, `true` включает дефолтный поиск focusable target.' },
          { name: 'selector', type: 'string', description: 'CSS-selector для точечного выбора внутреннего focusable элемента.' },
          { name: 'preventScroll', type: 'boolean', description: 'Прокидывается в `focus({ preventScroll })`, по умолчанию `true`.' },
          { name: 'disabled', type: 'boolean', description: 'Явно отключает срабатывание директивы в object-режиме.' },
        ],
      },
      {
        key: 'returns',
        title: 'Behavior',
        origin: 'manual',
        items: [
          { name: 'mounted', type: 'lifecycle', description: 'Фокус применяется только на `mounted`; дальнейшее управление фокусом остаётся на стороне интегратора.' },
        ],
      },
    ],
    usage: [
      'Используйте на контейнере dialog/drawer body или на самом input, если не нужен кастомный selector.',
      'Для accessibility оставляйте пользователю возможность изменить фокус вручную после открытия overlay.',
    ],
    caveats: [
      'Директива не пересчитывает цель на каждом обновлении: для повторного открытия overlay лучше размонтировать/смонтировать ветку.',
      'Если внутри нет focusable элемента, директива молча ничего не сделает — это ожидаемое поведение.',
    ],
    integrationNotes: [
      'Подходит для modal-like компонентов; для сложного focus trap используйте component-level overlay API.',
      'Можно комбинировать с `DsDialog` и `DsDrawer`, чтобы сразу переводить пользователя в первый actionable field.',
    ],
  },
  vAutosize: {
    overview: [
      '`vAutosize` автоматически подстраивает высоту `textarea` по `scrollHeight` и полезен для comment/note flows без ручного ресайза.',
      'Директива работает как на самом `textarea`, так и на контейнере, внутри которого он находится.',
    ],
    examples: createReadyExamples([
      {
        id: 'v-autosize-textarea',
        title: 'Textarea grows with content',
        description: 'Высота поля увеличивается по мере ввода, а при удалении текста может уменьшаться обратно.',
        previewKey: 'v-autosize-textarea',
        code: [
          "import { vAutosize } from '@feugene/granularity/directives'",
          '',
          '<DsTextarea',
          '  v-model="notes"',
          '  v-autosize',
          '  :rows="2"',
          '  placeholder="Type a long note"',
          '/>',
        ].join('\n'),
        note: 'Лучше не комбинировать с жёстко зафиксированной высотой textarea через inline-style.',
      },
    ]),
    apiSections: [
      {
        key: 'parameters',
        title: 'Binding value',
        origin: 'manual',
        items: [
          { name: 'boolean', type: 'boolean', description: '`false` выключает autosize, `true` включает его с дефолтными настройками.' },
          { name: 'enabled', type: 'boolean', description: 'Object-режим для явного включения/отключения директивы.' },
        ],
      },
      {
        key: 'returns',
        title: 'Behavior',
        origin: 'manual',
        items: [
          { name: 'mounted / updated', type: 'lifecycle', description: 'Директива делает пересчёт на `mounted`, `updated` и на каждом `input`-событии.' },
        ],
      },
    ],
    usage: [
      'Используйте для textarea с динамической длиной текста: комментарии, описания, форматы note-taking.',
      'Если директива вешается на контейнер, убедитесь, что внутри действительно есть `textarea`.',
    ],
    caveats: [
      'Директива меняет `overflow-y` на `hidden`, поэтому не рассчитывайте на нативный вертикальный scrollbar внутри textarea.',
      'Если внутри контейнера textarea динамически заменяется, важно сохранить корректный mount/update цикл Vue.',
    ],
    integrationNotes: [
      'Хорошо сочетается с `DsTextarea` для форм и side-panel editors.',
      'Если нужен лимит по высоте или кастомная анимация resize, лучше контролировать стиль на уровне компонента/обёртки.',
    ],
  },
  vClickOutside: {
    overview: [
      '`vClickOutside` закрывает dropdown/popover-like UI при клике вне элемента и учитывает список исключений (`exclude`).',
      'По умолчанию слушает события в capture-phase, чтобы внутренний `stopPropagation()` не ломал закрытие.',
    ],
    examples: createReadyExamples([
      {
        id: 'v-click-outside-dropdown',
        title: 'Dropdown with exclude zone',
        description: 'Панель закрывается при клике вне неё, но отдельная кнопка исключается из outside-логики.',
        previewKey: 'v-click-outside-dropdown',
        code: [
          "import { vClickOutside } from '@feugene/granularity/directives'",
          '',
          '<div',
          '  v-if="open"',
          '  v-click-outside="{',
          '    handler: () => open = false,',
          '    exclude: [() => excludeRef],',
          '  }"',
          '>',
          '  ...',
          '</div>',
        ].join('\n'),
        note: 'Для nested overlays полезно явно перечислять исключённые trigger-элементы.',
      },
    ]),
    apiSections: [
      {
        key: 'parameters',
        title: 'Binding value',
        origin: 'manual',
        items: [
          { name: 'handler', type: '(event) => void', description: 'Коллбек, который вызывается при клике/касании вне элемента.' },
          { name: 'enabled', type: 'boolean', description: 'Позволяет временно отключить outside-логику без размонтирования.' },
          { name: 'capture', type: 'boolean', description: 'По умолчанию `true`; полезно оставлять capture для overlay-паттернов.' },
          { name: 'events', type: "Array<'click' | 'mousedown' | 'touchstart' | 'pointerdown'>", description: 'Список DOM-событий, по которым считается outside-взаимодействие.' },
          { name: 'exclude', type: 'Array<HTMLElement | string | (() => HTMLElement | null | undefined)>', description: 'Список элементов/селекторов/функций, клики по которым считаются внутренними.' },
        ],
      },
      {
        key: 'returns',
        title: 'Behavior',
        origin: 'manual',
        items: [
          { name: 'listener lifecycle', type: 'lifecycle', description: 'Слушатели перевешиваются на `updated` и снимаются на `unmounted`.' },
        ],
      },
    ],
    usage: [
      'Используйте для dropdown, popover, context-menu и lightweight modal layers.',
      'Если outside-клик должен игнорировать trigger-кнопку, передайте её через `exclude`.',
    ],
    caveats: [
      'Логика завязана на `document` владельца элемента, поэтому для teleport/shadow-root важно тестировать конкретный host-flow.',
      'Правый клик и non-primary mouse buttons игнорируются намеренно.',
    ],
    integrationNotes: [
      'Для сложных overlay-стеков с focus-trap и keyboard-dismiss лучше использовать component-level API.',
      'С `DsDropdown`/custom popover shell директива закрывает самый частый outside-case без лишнего boilerplate.',
    ],
  },
  vDropzone: {
    overview: [
      '`vDropzone` превращает контейнер в drag-and-drop точку загрузки файлов и может запускать package validators до вызова `onFiles`.',
      'При ошибках валидации директива пробрасывает `FileValidationError`, поэтому UI можно строить вокруг единых codes/messages.',
    ],
    examples: createReadyExamples([
      {
        id: 'v-dropzone-validation',
        title: 'Dropzone with validator pipeline',
        description: 'Drop-flow показывает состояние drag-over и валидирует размер файла до передачи в business-logic.',
        previewKey: 'v-dropzone-validation',
        code: [
          "import { vDropzone } from '@feugene/granularity/directives'",
          "import { maxSizeMbValidator } from '@feugene/granularity/fileValidation'",
          '',
          '<section',
          '  v-dropzone="{',
          '    validators: [maxSizeMbValidator(2)],',
          '    onFiles: uploadFiles,',
          '    onError: handleValidationError,',
          '    onStateChange: ({ isOver }) => over = isOver,',
          '  }"',
          '/>',
        ].join('\n'),
        note: 'Если `multiple = false`, директива автоматически нормализует входной список файлов до первого элемента.',
      },
    ]),
    apiSections: [
      {
        key: 'parameters',
        title: 'Binding value',
        origin: 'manual',
        items: [
          { name: 'onFiles', type: '(files: File[], event: DragEvent) => void | Promise<void>', description: 'Основной drop-handler после успешной валидации.' },
          { name: 'validators', type: 'FileValidator[]', description: 'Список валидаторов из `@feugene/granularity/fileValidation`.' },
          { name: 'multiple', type: 'boolean', description: 'Определяет, можно ли принимать несколько файлов за один drop.' },
          { name: 'onError', type: '(error: unknown) => void', description: 'Получает `FileValidationError` или runtime-ошибку обработчика.' },
          { name: 'onStateChange', type: '({ isOver }: { isOver: boolean }) => void', description: 'Сигнал для визуального состояния dropzone при drag-enter/leave.' },
          { name: 'overClass', type: 'string', description: 'CSS-класс, который добавляется на время drag-over.' },
        ],
      },
      {
        key: 'returns',
        title: 'Behavior',
        origin: 'manual',
        items: [
          { name: 'validation errors', type: 'FileValidationError', description: 'При проблемах валидации директива создаёт и пробрасывает `FileValidationError` с массивом `issues`.' },
        ],
      },
    ],
    usage: [
      'Подходит для upload-zones, media-drop areas и admin-форм с drag-and-drop UX.',
      'Используйте `validators` для унификации правил с `DsFileUpload` и input-based flows.',
    ],
    caveats: [
      'Если нужен file picker fallback, комбинируйте с компонентом загрузки или отдельной кнопкой выбора файла.',
      'При асинхронном `onFiles` важно самостоятельно показывать pending/error state на уровне UI.',
    ],
    integrationNotes: [
      'Хорошо сочетается с `runFileValidators`, `maxSizeMbValidator` и другими file-validation helpers.',
      'Для richer UX можно держать единый набор validators и использовать его и в `vDropzone`, и в `DsFileUpload`.',
    ],
  },
  vHotkey: {
    overview: [
      '`vHotkey` регистрирует локальную карту shortcuts для страницы или feature-области и поддерживает object-entries с флагами управления событием.',
      'Комбинации без модификаторов по умолчанию не перехватываются внутри editable-полей, кроме `Escape`.',
    ],
    examples: createReadyExamples([
      {
        id: 'v-hotkey-map',
        title: 'Feature-scoped shortcut map',
        description: 'Один контейнер объявляет несколько горячих клавиш и логирует результат прямо в demo.',
        previewKey: 'v-hotkey-map',
        code: [
          "import { vHotkey } from '@feugene/granularity/directives'",
          '',
          '<div',
          '  v-hotkey="{',
          "    'Ctrl+K': openSearch,",
          "    'Shift+/': { handler: openHelp, preventDefault: true },",
          "    'Escape': { handler: closePanel, allowInEditable: true },",
          '  }"',
          '/>',
        ].join('\n'),
        note: 'Shortcut-map удобно держать рядом с feature-shell, а не в глобальном приложении.',
      },
    ]),
    apiSections: [
      {
        key: 'parameters',
        title: 'Binding value',
        origin: 'manual',
        items: [
          { name: 'HotkeyMap', type: 'Record<string, HotkeyEntry>', description: 'Простая карта вида `Ctrl+K -> handler`.' },
          { name: 'handlers', type: 'HotkeyMap', description: 'Object-режим для карты сочетаний вместе с флагом `enabled`.' },
          { name: 'enabled', type: 'boolean', description: 'Позволяет временно заморозить весь shortcut-layer.' },
          { name: 'preventDefault / stopPropagation / allowInEditable', type: 'boolean', description: 'Тонкая настройка поведения конкретной комбинации.' },
        ],
      },
      {
        key: 'returns',
        title: 'Behavior',
        origin: 'manual',
        items: [
          { name: 'keydown listener', type: 'window listener', description: 'Слушатель вешается на `window` и снимается при `unmounted`.' },
        ],
      },
    ],
    usage: [
      'Используйте для page-level shortcuts, command bars, help overlays и ускорения power-user сценариев.',
      'Храните текст shortcut-legend рядом с интеракцией, чтобы пользователь видел доступные сочетания.',
    ],
    caveats: [
      'Директива опирается на `event.key`, поэтому стоит тестировать раскладки и platform-specific modifiers в реальном браузере.',
      'Глобальные комбинации продукта лучше координировать в одном слое, чтобы не создавать конфликтующих map-ов.',
    ],
    integrationNotes: [
      'Подходит для feature-level UX; для глобального command palette стоит использовать единый app-shell handler.',
      'Можно комбинировать с `DsInput` и `allowInEditable`, если shortcut должен работать даже во время ввода.',
    ],
  },
  vLoading: {
    overview: [
      '`vLoading` рендерит loading overlay поверх элемента или указанного `target` и удобно закрывает declarative async-state сценарии.',
      'Если target указывает на `document.body`, директива автоматически становится fullscreen, если это явно не переопределено.',
    ],
    examples: createReadyExamples([
      {
        id: 'v-loading-card',
        title: 'Card-level async overlay',
        description: 'Лоадер таргетится в карточку, а не в весь экран, поэтому хорошо подходит для segment refresh и partial fetches.',
        previewKey: 'v-loading-card',
        code: [
          "import { vLoading } from '@feugene/granularity/directives'",
          '',
          '<DsCard',
          '  v-loading="{',
          '    loading: isRefreshing,',
          "    text: 'Refreshing segment metrics…',",
          '  }"',
          '/>',
        ].join('\n'),
        note: 'Для non-fullscreen target директива сама позаботится о `position: relative`, если контейнер был `static`.',
      },
    ]),
    apiSections: [
      {
        key: 'parameters',
        title: 'Binding value',
        origin: 'manual',
        items: [
          { name: 'boolean', type: 'boolean', description: 'Быстрый режим: `true` показывает overlay, `false` скрывает.' },
          { name: 'loading', type: 'boolean', description: 'Object-режим, который позволяет совместить состояние и опции.' },
          { name: 'target / fullscreen', type: 'string | HTMLElement / boolean', description: 'Настройка точки монтирования и fullscreen-поведения.' },
          { name: 'text / spinner / spinnerClass / animated / background / zIndex / customClass', type: 'LoadingOptions', description: 'Визуальные параметры overlay-компонента.' },
        ],
      },
      {
        key: 'returns',
        title: 'Behavior',
        origin: 'manual',
        items: [
          { name: 'sync on updated', type: 'lifecycle', description: 'При изменении binding директива обновляет существующий controller вместо лишнего re-mount.' },
        ],
      },
    ],
    usage: [
      'Используйте для card/section-level async операций, где блокировать весь экран избыточно.',
      'Передавайте `target`, если overlay должен монтироваться не в сам директивный узел, а в соседний контейнер.',
    ],
    caveats: [
      'Для глобального blocking-state и ручного контроля удобнее использовать `createLoading`.',
      'На long-running async actions важно гарантировать cleanup loading-state даже при ошибке.',
    ],
    integrationNotes: [
      'Подходит для declarative UI-состояний рядом с `pending` ref/async composable.',
      'Если сценарий начинается вне Vue binding-flow, переходите на imperative helper `createLoading`.',
    ],
  },
  createLoading: {
    overview: [
      '`createLoading` даёт imperative API для overlay, когда loading нужно показать из action/service-кода, а не из шаблонного binding.',
      'Controller возвращает `target`, `setText`, `setOptions` и `close`, поэтому подходит для ручного жизненного цикла.',
    ],
    examples: createReadyExamples([
      {
        id: 'create-loading-imperative',
        title: 'Imperative loading controller',
        description: 'Overlay создаётся по клику, меняет текст в процессе и закрывается после завершения шага.',
        previewKey: 'create-loading-imperative',
        code: [
          "import { createLoading } from '@feugene/granularity/directives'",
          '',
          'const controller = createLoading({ text: "Syncing package docs…" })',
          'controller.setText("Applying final state…")',
          'controller.close()',
        ].join('\n'),
        note: 'Если вы создаёте controller вручную, cleanup лежит на вызывающей стороне.',
      },
    ]),
    apiSections: [
      {
        key: 'parameters',
        title: 'Parameters',
        origin: 'manual',
        items: [
          { name: 'options', type: 'LoadingOptions', description: 'Те же визуальные и target/fullscreen настройки, что и у `vLoading`, плюс `appContext`.' },
          { name: 'fallbackTarget', type: 'HTMLElement', description: 'Запасной target, если `options.target` не указан или не найден.' },
        ],
      },
      {
        key: 'returns',
        title: 'Returns',
        origin: 'manual',
        items: [
          { name: 'close()', type: '() => void', description: 'Полностью размонтирует overlay и снимает `aria-busy`.' },
          { name: 'setText(text?)', type: '(text?: string) => void', description: 'Позволяет обновить статусный текст без пересоздания controller.' },
          { name: 'setOptions(next)', type: '(next: Partial<LoadingOptions>) => void', description: 'Обновляет внешний вид существующего overlay.' },
          { name: 'target', type: 'HTMLElement', description: 'Фактический DOM-target, в который смонтирован overlay.' },
        ],
      },
    ],
    usage: [
      'Используйте, когда loading запускается из imperative flow: async action, router hook, bootstrap step.',
      'Для кастомного spinner-компонента из Vue-injection контекста прокидывайте `appContext`.',
    ],
    caveats: [
      'Не забывайте вызвать `close()` в `finally`, иначе overlay останется смонтированным.',
      'Если target резолвится в `document.body`, fullscreen становится default-поведением.',
    ],
    integrationNotes: [
      'Хорошо сочетается с `vLoading`: директива — для declarative состояния, helper — для imperative orchestration.',
      'Подходит для глобальных bootstrap/sync операций в app shell.',
    ],
  },
}