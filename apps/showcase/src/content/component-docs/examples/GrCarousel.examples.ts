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
    id: 'carousel-builder',
    title: 'Конструктор: все настройки разом',
    description: 'Переключатель точками или миниатюрами, тон текущего кадра из общей шкалы, стрелки, замкнутая лента, свайп, автопрокрутка и режим активации — на одном экране, со сниппетом под ним. Стрелки здесь заменены слотами `#prev` и `#next`: кнопка, её имя и поведение на краю остаются за компонентом.',
    status: 'ready',
    previewKey: 'gr-carousel-builder',
    hideCode: true,
    note: 'Один сценарий покрывает все настраиваемые пропы — удобно для дизайн-ревью и проверки, что переключатель различим на каждом тоне.',
  },
  {
    id: 'carousel-states',
    title: 'Один кадр и лента переменного состава',
    description: 'Органы управления появляются и исчезают вместе с необходимостью в них: на одном кадре стрелок и точек нет вовсе. Кадр, ушедший из-под текущего индекса, доводит модель до края и сообщает об этом.',
    status: 'ready',
    previewKey: 'gr-carousel-states',
  },
]
