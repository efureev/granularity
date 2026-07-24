import { showcaseComponentDetailSections } from '../../app/showcase'

import type { ShowcaseExampleStatus } from '../model'

export type ShowcaseComponentExampleDoc = {
  id: string
  title: string
  description: string
  status: ShowcaseExampleStatus
  code: string
  note?: string
  previewKey?: string
}

export type ShowcaseComponentOverviewList = {
  /** Заголовок списка (напр. «Совместимые контролы» или «Встроенные правила»). */
  title: string
  /** Пункты списка (поддерживают inline-`code` через backticks). */
  items: string[]
}

export type ShowcaseComponentOverviewDoc = {
  /** Абзацы описания: что за компонент и для чего он нужен. */
  paragraphs: string[]
  /** Список ключевых фич компонента (bullets). */
  features?: string[]
  /** Доп. тематические списки под фичами (напр. совместимые контролы, встроенные правила). */
  lists?: ShowcaseComponentOverviewList[]
}

export type ShowcaseComponentDocMeta = {
  sections: typeof showcaseComponentDetailSections
  /** Опциональный расширенный обзор (рендерится секцией «About» над live-examples). */
  overview?: ShowcaseComponentOverviewDoc
  examples: ShowcaseComponentExampleDoc[]
}
