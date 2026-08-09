import { showcaseComponentDetailSections } from '../../app/showcase'

import type { ShowcaseExampleStatus } from '../model'

export type ShowcaseComponentExampleDoc = {
  id: string
  title: string
  description: string
  status: ShowcaseExampleStatus
  /**
   * Ключ демо в `src/demos/registry.ts`. Из него берутся и превью, и сниппет под
   * ним — своего поля `code` у настоящего примера нет и быть не должно: копия
   * демо неизбежно расходится с оригиналом (так разошлись 102 из 253).
   * Обязателен для всех примеров из `overrides.ts` — гейт `examplePreviews`.
   */
  previewKey?: string
  /**
   * Готовый сниппет. Только для заглушек компонентов без своих примеров
   * (`createFallbackExamples`) и для доков пакетов, где демо-файла не бывает.
   */
  code?: string
  /**
   * Не показывать сниппет под превью. Стоит у демо-конструкторов: они печатают
   * собственный `CodeBlock` с кодом, собранным из выбранных пропов, и второй
   * блок с исходником самого конструктора рядом только мешает.
   */
  hideCode?: boolean
  note?: string
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
