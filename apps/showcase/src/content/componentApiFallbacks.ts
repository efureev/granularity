import type { ShowcaseApiSectionMeta } from './model.ts'

export type ShowcaseComponentApiFallback = Partial<Record<'props' | 'slots' | 'events' | 'methods', ShowcaseApiSectionMeta>>

export const showcaseComponentApiFallbacks: Record<string, ShowcaseComponentApiFallback> = {
  GrButton: {
    props: {
      key: 'props',
      title: 'Props',
      origin: 'manual',
      items: [
        {
          name: 'variant',
          description: '',
          type: 'GrButtonVariant: \"primary\" | \"secondary\" | \"outline\" | \"ghost\" | \"ghost-border\"',
        },
        {
          name: 'tone',
          description: '',
          type: 'GrButtonTone: \"primary\" | \"neutral\" | \"success\" | \"warning\" | \"danger\" | \"info\"',
        },
        {
          name: 'size',
          description: '',
          type: 'GrButtonSize: \"xs\" | \"sm\" | \"md\" | \"lg\"',
        },
      ],
    },
    slots: {
      key: 'slots',
      title: 'Slots',
      origin: 'manual',
      items: [
        {
          name: 'default',
          description: 'Текст кнопки, иконка или произвольный контент внутри `GrButton`.',
          type: '() => VNode[]',
        },
      ],
    },
  },
  GrCard: {
    slots: {
      key: 'slots',
      title: 'Slots',
      origin: 'manual',
      items: [
        {
          name: 'default',
          description: 'Основное содержимое карточки.',
          type: '() => VNode[]',
        },
      ],
    },
  },
  GrLink: {
    props: {
      key: 'props',
      title: 'Props',
      origin: 'manual',
      items: [
        {
          name: 'variant',
          description: '',
          type: 'GrLinkVariant: \"primary\" | \"default\" | \"muted\" | \"danger\"',
        },
        {
          name: 'size',
          description: '',
          type: 'GrLinkSize: \"sm\" | \"md\" | \"lg\"',
        },
      ],
    },
  },
}