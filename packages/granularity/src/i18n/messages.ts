type GranularityLocalePayload = Record<string, unknown>

type GranularityLocaleModule = {
  default: GranularityLocalePayload
}

type GranularityLocaleLoader = () => Promise<GranularityLocaleModule>

export type GranularityLocaleLoaderCollection = Record<string, Record<string, GranularityLocaleLoader>>

export const DS_I18N_BLOCK = 'ds'

export const dsLocaleLoaders = {
  en: {
    [DS_I18N_BLOCK]: () => import('./locales/en.json'),
  },
  ru: {
    [DS_I18N_BLOCK]: () => import('./locales/ru.json'),
  },
  es: {
    [DS_I18N_BLOCK]: () => import('./locales/es.json'),
  },
} satisfies GranularityLocaleLoaderCollection
