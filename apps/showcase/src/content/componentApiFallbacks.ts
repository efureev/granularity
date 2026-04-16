import type { ShowcaseApiSectionMeta } from './model.ts'

export type ShowcaseComponentApiFallback = Partial<Record<'props' | 'slots' | 'events' | 'methods', ShowcaseApiSectionMeta>>

export const showcaseComponentApiFallbacks: Record<string, ShowcaseComponentApiFallback> = {
  DsButton: {
    props: {
      key: 'props',
      title: 'Props',
      origin: 'manual',
      items: [
        {
          name: 'variant',
          description: '',
          type: 'DsButtonVariant: \"primary\" | \"secondary\" | \"outline\" | \"ghost\" | \"ghost-border\"',
        },
        {
          name: 'tone',
          description: '',
          type: 'DsButtonTone: \"primary\" | \"neutral\" | \"success\" | \"warning\" | \"danger\" | \"info\"',
        },
        {
          name: 'size',
          description: '',
          type: 'DsButtonSize: \"xs\" | \"sm\" | \"md\" | \"lg\"',
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
          description: 'Текст кнопки, иконка или произвольный контент внутри `DsButton`.',
          type: '() => VNode[]',
        },
      ],
    },
  },
  DsCard: {
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
  DsLink: {
    props: {
      key: 'props',
      title: 'Props',
      origin: 'manual',
      items: [
        {
          name: 'variant',
          description: '',
          type: 'DsLinkVariant: \"primary\" | \"default\" | \"muted\" | \"danger\"',
        },
        {
          name: 'size',
          description: '',
          type: 'DsLinkSize: \"sm\" | \"md\" | \"lg\"',
        },
      ],
    },
  },
}