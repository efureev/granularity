import type { ShowcaseComponentExampleDoc } from '../types'

export const grLoadingExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'loading-inline-overlay',
    title: 'Inline section overlay',
    description: 'Базовый сценарий: оверлей поверх карточки, пока обновляются данные. Подпись читается диктором — у корня `role="status"`.',
    status: 'ready',
    previewKey: 'gr-loading-inline-overlay',  },
  {
    id: 'loading-delay-slot',
    title: 'Delay and custom panel',
    description: '`delay` не даёт оверлею мигнуть на быстром ответе, а слот заменяет содержимое панели — прогресс и кнопка отмены.',
    status: 'ready',
    previewKey: 'gr-loading-delay-slot',  },
  {
    id: 'loading-directive',
    title: 'Directive with content blocking',
    description: 'Директива `v-loading` объявляет контейнер `aria-busy` и помечает его содержимое `inert`: под оверлеем не остаётся ни таб-порядка, ни доступного дерева.',
    status: 'ready',
    previewKey: 'gr-loading-directive',  },
  {
    id: 'loading-custom-appearance',
    title: 'Custom appearance',
    description: 'Настройка `background`, `spinnerTone` и `spinnerSize` под плотные дашборды; `animated` выключает вращение.',
    status: 'ready',
    previewKey: 'gr-loading-custom-appearance',  },
  {
    id: 'loading-fullscreen',
    title: 'Fullscreen async cycle',
    description: 'Полноэкранный режим на токене `--gr-z-loading`: он выше модалок, потому что блокирует приложение целиком.',
    status: 'ready',
    previewKey: 'gr-loading-fullscreen',  },
]
