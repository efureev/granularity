import { createReadyExamples } from './shared'
import type { PackageDocOverride } from './types'

export const composablePackageDocOverrides: Record<string, PackageDocOverride> = {
  useTheme: {
    overview: [
      '`useTheme` хранит текущую тему приложения, переключает CSS-state на `document.documentElement` и умеет работать как с persistence, так и без неё.',
      '`initThemeEarly` стоит использовать до монтирования Vue, чтобы избежать мигания темы при первом рендере.',
    ],
    examples: createReadyExamples([
      {
        id: 'use-theme-runtime',
        title: 'Runtime toggle with non-persistent mode',
        description: 'Demo переключает тему в рантайме и показывает сценарий `persist: false`, подходящий для embedded flows.',
        previewKey: 'use-theme-runtime',
        code: [
          "import { initThemeEarly, useTheme } from '@feugene/granularity'",
          '',
          'initThemeEarly({ storageKey: "app-theme", persist: true })',
          '',
          'const theme = useTheme({ persist: false, storageKey: "feature-preview-theme" })',
          'theme.toggleTheme()',
        ].join('\n'),
        note: '`persist: false` не читает и не пишет `localStorage`, но всё равно применяет CSS-theme к корневому элементу.',
      },
    ]),
    apiSections: [
      {
        key: 'parameters',
        title: 'Parameters',
        origin: 'manual',
        items: [
          { name: 'storageKey', type: 'string', description: 'Ключ в `localStorage`, по умолчанию `fint-ds-theme`.' },
          { name: 'persist', type: 'boolean', description: 'Если `false`, composable не работает с `localStorage` и подходит для SSR/embedded сценариев.' },
        ],
      },
      {
        key: 'returns',
        title: 'Returns',
        origin: 'manual',
        items: [
          { name: 'theme', type: "Ref<'light' | 'dark'>", description: 'Текущее значение темы.' },
          { name: 'isDark', type: 'ComputedRef<boolean>', description: 'Derived-flag для условного UI.' },
          { name: 'setTheme(next)', type: '(next: ThemeName) => void', description: 'Явно устанавливает тему и, при необходимости, пишет её в storage.' },
          { name: 'toggleTheme()', type: '() => void', description: 'Переключает тему между `light` и `dark`.' },
          { name: 'initTheme()', type: '() => void', description: 'Применяет текущее значение темы к DOM-дереву.' },
          { name: 'initThemeEarly(options)', type: '(options?: UseThemeOptions) => void', description: 'Bootstrap-helper для раннего применения темы до mount приложения.' },
        ],
      },
    ],
    usage: [
      'Вызывайте `initThemeEarly()` в entrypoint до `createApp(...).mount(...)`, если важно избежать flicker.',
      'В feature/demo контекстах можно использовать `persist: false`, чтобы не загрязнять глобальный storage продукта.',
    ],
    caveats: [
      'Composable пишет тему в `document.documentElement.dataset.theme` и `theme-dark` class, поэтому app-shell стили должны опираться на эти маркеры.',
      'Несколько независимых вызовов `useTheme` влияют на один и тот же DOM-root; если нужна строгая изоляция, нужен отдельный host/document.',
    ],
    integrationNotes: [
      'Используйте как app-shell primitive для theme switcher, settings page и embedded preview flows.',
      'Сценарии persistence и раннего init удобнее описывать прямо в bootstrap-коде, а не только внутри компонентов.',
    ],
  },
  useToast: {
    overview: [
      '`useToast` управляет shared reactive очередью toast-уведомлений и отдаёт единый API для push/dismiss/clear из любого consumer-а приложения.',
      'Для отображения очереди нужен mounted toast host, например `DsToaster` в app-shell showcase.',
    ],
    examples: createReadyExamples([
      {
        id: 'use-toast-queue',
        title: 'Shared toast queue with sticky notifications',
        description: 'Demo показывает `push`, `dismiss`, `clear` и sticky toast через `timeoutMs = 0`.',
        previewKey: 'use-toast-queue',
        code: [
          "import { useToast } from '@feugene/granularity'",
          '',
          'const toast = useToast()',
          'const id = toast.push({',
          '  title: "Saved",',
          '  message: "Profile updated",',
          '  tone: "success",',
          '  timeoutMs: 0,',
          '})',
          'toast.dismiss(id)',
          'toast.clear()',
        ].join('\n'),
        note: 'Возвращаемый `id` нужен для ручного dismiss конкретного уведомления.',
      },
    ]),
    apiSections: [
      {
        key: 'parameters',
        title: 'Toast input',
        origin: 'manual',
        items: [
          { name: 'title', type: 'string', description: 'Обязательный заголовок toast.' },
          { name: 'message', type: 'string', description: 'Дополнительный текст уведомления.' },
          { name: 'variant', type: "'info' | 'success' | 'warning' | 'danger'", description: 'Визуальный вариант toast, по умолчанию `info`.' },
          { name: 'timeoutMs', type: 'number', description: 'Автоматическое закрытие; `0` делает уведомление sticky.' },
        ],
      },
      {
        key: 'returns',
        title: 'Returns',
        origin: 'manual',
        items: [
          { name: 'list', type: 'ComputedRef<Toast[]>', description: 'Shared reactive список уведомлений для всех consumers.' },
          { name: 'push(input)', type: '(input: ToastInput) => string', description: 'Добавляет toast в начало очереди и возвращает `id`.' },
          { name: 'dismiss(id)', type: '(id: string) => void', description: 'Удаляет конкретный toast из очереди.' },
          { name: 'clear()', type: '() => void', description: 'Очищает всю очередь уведомлений.' },
        ],
      },
    ],
    usage: [
      'Добавьте toast host (`DsToaster` или аналогичный shell-компонент) один раз в корень приложения.',
      'Используйте returned `id`, если toast должен закрываться вручную после завершения пользовательского действия.',
    ],
    caveats: [
      '`useToast` использует общий reactive store, поэтому изменения видны всем consumers внутри приложения.',
      'Без host-компонента уведомления будут попадать в очередь, но пользователь их не увидит.',
    ],
    integrationNotes: [
      'Подходит для app-shell notifications, optimistic actions и feature-level feedback сообщений.',
      'В showcase-shell уже должен быть mounted toaster host, поэтому demo отражает production-like интеграцию.',
    ],
  },
}