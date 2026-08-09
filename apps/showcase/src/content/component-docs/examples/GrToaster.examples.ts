import type { ShowcaseComponentExampleDoc } from '../types'

export const grToasterExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'toaster-builder',
    title: 'Interactive toaster constructor',
    description: 'Живой playground для ключевых пропсов `GrToaster` и payload `useToast.push`: меняйте `tone`, `placement`, `timeoutMs`, тексты и проверяйте поведение без переключения между отдельными demo-карточками.',
    status: 'ready',
    previewKey: 'gr-toaster-builder',
    hideCode: true,
    note: 'Удобный формат для дизайн-ревью и QA: один сценарий покрывает все пропсы и shared-store контракт `useToast`.',
  },
  {
    id: 'toaster-sticky-host',
    title: 'Sticky toast and manual clear',
    description: 'Демонстрация `timeoutMs = 0` и ручного очищения shared store для уведомлений, которые не должны исчезать автоматически.',
    status: 'ready',
    previewKey: 'gr-toaster-sticky-host',  },
  {
    id: 'toaster-queue-flow',
    title: 'Queued workflow feedback',
    description: 'Отдельный workflow-сценарий: пушим несколько toast подряд, чтобы проверить stacking и ручные sticky warnings.',
    status: 'ready',
    previewKey: 'gr-toaster-queue-flow',  },
  {
    id: 'toaster-action',
    title: 'Action buttons: size, variant, multiple',
    description: 'Payload `useToast.push` принимает `action: { label, onClick }` для одной кнопки или `actions: [...]` для нескольких. У каждой кнопки настраиваются `size` и `variant`; `dismissOnClick: false` оставляет тост открытым (например, «Retry» для sticky-ошибки).',
    status: 'ready',
    previewKey: 'gr-toaster-action',    note: '`action.onClick` вызывается синхронно перед закрытием — удобно для undo/retry-паттернов, где важно успеть отменить операцию.',
  },
  {
    id: 'toaster-action-slot',
    title: 'Custom action buttons via slot',
    description: 'Слот `#actions` полностью заменяет дефолтные кнопки: он получает сам `toast` и функцию `dismiss`, которая закрывает именно этот тост. Так можно рендерить любые контролы и самому решать, когда закрывать уведомление.',
    status: 'ready',
    previewKey: 'gr-toaster-action-slot',    note: 'Слот задаётся один раз на `GrToaster` и применяется ко всем тостам; внутри доступен `toast` (title/message/tone/…) и `dismiss()`.',
  },
  {
    id: 'toaster-focus-hotkey',
    title: 'F6 — фокус в стек уведомлений',
    description: 'Тосты телепортированы в конец `body`: без хоткея кнопка действия недостижима с клавиатуры. Заодно — ширина стека пропом.',
    status: 'ready',
    previewKey: 'gr-toaster-focus-hotkey',  },
]
