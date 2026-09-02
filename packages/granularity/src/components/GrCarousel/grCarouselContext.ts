import type { ComputedRef, InjectionKey } from 'vue'

/** Что слайд сообщает о себе ленте при регистрации. */
export interface GrCarouselSlideEntry {
  /** `useId()` слайда. Он же его DOM-id и ключ реестра. */
  id: string
  /** Имя слайда: подпись его переключателя и `aria-label` самого слайда. */
  label: () => string | undefined
  /** URL миниатюры. */
  thumbnailSrc: () => string | undefined
  /**
   * Дал ли слайд свою разметку миниатюры. Геттер, а не снимок: слот, появившийся
   * позже, снимком в `setup` не увиделся бы.
   */
  hasThumbnail: () => boolean
  /**
   * Своя разметка миниатюры. Рендерит её **полоса переключателей**, а не слайд:
   * узел уезжает наверх ссылкой. Ссылка стабильна — иначе `:is` перемонтировал
   * бы миниатюру на каждый рендер.
   */
  thumbnail: () => unknown
  /**
   * Корневой узел. Геттер, а не значение: регистрация идёт в `setup`, когда
   * элемента ещё нет. По нему же восстанавливается порядок слайдов в документе.
   */
  el: () => HTMLElement | null
}

export interface GrCarouselContext {
  /** Регистрация слайда. Возвращает отписку. */
  register: (entry: GrCarouselSlideEntry) => () => void
  /** Позиция слайда в ленте; `-1`, пока он не зарегистрирован. */
  indexOf: (id: string) => number
  isCurrent: (id: string) => boolean
  total: ComputedRef<number>
  /**
   * `tabpanel`, когда есть полоса переключателей, иначе `group`. Роль слайда
   * зависит от наличия переключателя, а не от его вида: `tab` требует парного
   * `tabpanel`, и без полосы привязать его было бы не к чему.
   */
  slideRole: ComputedRef<'tabpanel' | 'group'>
  slideRoledescription: ComputedRef<string>
  /** id переключателя для `aria-labelledby` слайда; `undefined` без полосы. */
  tabIdFor: (id: string) => string | undefined
  /** «N из M» — имя слайда, когда своего `label` у него нет. */
  positionLabel: (id: string) => string
}

export const GR_CAROUSEL_CONTEXT: InjectionKey<GrCarouselContext> = Symbol('GR_CAROUSEL_CONTEXT')
