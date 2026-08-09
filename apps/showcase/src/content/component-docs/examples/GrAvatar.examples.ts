import type { ShowcaseComponentExampleDoc } from '../types'

export const grAvatarExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'avatar-size-shape',
    title: 'Sizes and circle/square shapes',
    description: 'Минимальный набор размеров и форм помогает быстро понять, как `GrAvatar` ведёт себя для людей и для team/workspace сущностей.',
    status: 'ready',
    previewKey: 'gr-avatar-size-shape',  },
  {
    id: 'avatar-image-fallback',
    title: 'Image mode with default-slot fallback',
    description: 'Показываем основной contract компонента: `src` рендерит изображение, а при его отсутствии тот же размер сохраняется для fallback-контента.',
    status: 'ready',
    previewKey: 'gr-avatar-image-fallback',  },
  {
    id: 'avatar-team-row',
    title: 'Composition inside user or team rows',
    description: 'На практике `GrAvatar` почти всегда живёт рядом с именем, ролью и secondary text — поэтому документируем и такой composed layout.',
    status: 'ready',
    previewKey: 'gr-avatar-team-row',  },
]
