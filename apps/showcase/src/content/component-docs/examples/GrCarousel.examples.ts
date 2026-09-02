import type { ShowcaseComponentExampleDoc } from '../types'

export const grCarouselExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'carousel-gallery',
    title: 'Галерея товара',
    description: 'Кадры на всю ширину и полоса миниатюр под ними: видно, сколько снимков ещё есть, и можно перейти сразу к нужному. Миниатюру каждый кадр приносит сам — пропом `thumbnail` или слотом `#thumbnail`.',
    status: 'ready',
    previewKey: 'gr-carousel-gallery',
  },
  {
    id: 'carousel-onboarding',
    title: 'Знакомство с сервисом',
    description: 'Автопрокрутка с кнопкой паузы: наведение и фокус внутри останавливают показ сами, а `prefers-reduced-motion` не даёт ему стартовать. Кадр — обычная разметка, поэтому кнопка внутри остаётся кнопкой.',
    status: 'ready',
    previewKey: 'gr-carousel-onboarding',
  },
  {
    id: 'carousel-cards',
    title: 'Лента отзывов',
    description: 'Кадром работает карточка, а не картинка. Без `loop` лента не замыкается: на краях стрелки гаснут, оставаясь фокусируемыми, — иначе фокус падал бы в пустоту ровно на последнем кадре.',
    status: 'ready',
    previewKey: 'gr-carousel-cards',
  },
  {
    id: 'carousel-states',
    title: 'Один кадр и лента переменного состава',
    description: 'Органы управления появляются и исчезают вместе с необходимостью в них: на одном кадре стрелок и точек нет вовсе. Кадр, ушедший из-под текущего индекса, доводит модель до края и сообщает об этом.',
    status: 'ready',
    previewKey: 'gr-carousel-states',
  },
]
