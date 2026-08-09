import type { ShowcaseComponentExampleDoc } from '../types'

export const grImageViewerExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'image-viewer-alt-and-append',
    title: 'Alt-текст и живой список кадров',
    description: 'Кадры объектами `{ src, alt }` дают изображению описание, а изменение списка не выбрасывает пользователя на первый кадр.',
    status: 'ready',
    previewKey: 'gr-image-viewer-alt-and-append',  },
  {
    id: 'image-viewer-gallery',
    title: 'Fullscreen gallery from thumbnails',
    description: 'Базовый media-flow: открываем `GrImageViewer` из gallery grid и синхронизируем `initialIndex` c выбранной thumbnail.',
    status: 'ready',
    previewKey: 'gr-image-viewer-gallery',  },
  {
    id: 'image-viewer-toolbar-slot',
    title: 'Custom toolbar slot',
    description: 'Показываем slot-based composition: кастомный toolbar с action-кнопками и собственным progress/zoom summary поверх overlay.',
    status: 'ready',
    previewKey: 'gr-image-viewer-toolbar-slot',  },
  {
    id: 'image-viewer-real-size',
    title: 'Real image size in toolbar',
    description: 'Картинка фиксированного размера (1000×1500): компонент сам отдаёт в slot natural-размер, фактический rendered-размер и реальный масштаб (`realScalePercent`), поэтому не нужно вручную читать DOM.',
    status: 'ready',
    previewKey: 'gr-image-viewer-real-size',  },
  {
    id: 'image-viewer-async-media',
    title: 'Async gallery loading',
    description: 'Закрываем async/media use-case: сначала показываем loading/progress, затем открываем viewer после получения media payload.',
    status: 'ready',
    previewKey: 'gr-image-viewer-async-media',  },
  {
    id: 'image-viewer-zoom-download',
    title: 'Zoom to cursor and download',
    description: 'Колесо увеличивает в точку под курсором, смещение ограничено кадром, а кнопка «скачать» отдаёт файл и эмитит `download`.',
    status: 'ready',
    previewKey: 'gr-image-viewer-zoom-download',  },
]
