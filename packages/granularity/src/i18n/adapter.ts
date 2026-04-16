import type { InjectionKey, Ref } from 'vue'

export type GranularityI18nParams = Record<string, unknown>

export type GranularityI18nAdapter = {
  t: (key: string, params?: GranularityI18nParams) => string
  locale?: Readonly<Ref<string>>
  syncLocale?: (locale: string) => void | Promise<void>
}

export const GRANULARITY_I18N_KEY: InjectionKey<GranularityI18nAdapter | null> = Symbol('GRANULARITY_I18N_KEY')