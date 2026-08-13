import { computed, ref, type Ref } from 'vue'

import { GR_CONFIG_KEY, type GrComponentDefaults, type GrComponentSize, type GrConfigContext } from '../components/GrConfigProvider/context'
import { GRANULARITY_I18N_KEY, type GranularityI18nAdapter, type GranularityI18nParams } from '../i18n/adapter'

export interface I18nAdapterOptions {
  /** Перевод по ключу. По умолчанию — сам ключ: видно, что спросили. */
  t?: (key: string, params?: GranularityI18nParams) => string
  te?: (key: string) => boolean
  locale?: string | Ref<string>
}

/** Адаптер перевода для теста: словарь или своя функция. */
export function i18nAdapter(options: I18nAdapterOptions | Record<string, string> = {}): GranularityI18nAdapter {
  const isDictionary = typeof (options as I18nAdapterOptions).t !== 'function'
    && !('locale' in options)
    && !('te' in options)

  if (isDictionary) {
    const dictionary = options as Record<string, string>

    return {
      t: key => dictionary[key] ?? key,
      te: key => key in dictionary,
    }
  }

  const { t, te, locale } = options as I18nAdapterOptions

  return {
    t: t ?? (key => key),
    te,
    locale: typeof locale === 'string' ? ref(locale) : locale,
  }
}

export interface GranularityGlobalOptions {
  size?: GrComponentSize
  componentDefaults?: GrComponentDefaults
  theme?: string
  portalTarget?: string | HTMLElement
  /** Адаптер перевода: готовый, словарь `{ ключ: перевод }` или опции `i18nAdapter`. */
  i18n?: GranularityI18nAdapter | I18nAdapterOptions | Record<string, string>
}

/**
 * Окружение пакета для монтирования — то, что `<GrConfigProvider>` раздаёт
 * через `provide`.
 *
 * Отдаётся объектом, а не компонентом-обёрткой, намеренно: провайдер тянет за
 * собой лишний корневой элемент, а искать компонент внутри чужой разметки в
 * каждом тесте дороже, чем передать `global`. Проверять **сам** провайдер
 * (`data-gr-config-provider`, тема на корне) этим нельзя и не нужно — для этого
 * его и монтируют.
 *
 * ```ts
 * mount(GrSelect, { props, global: granularityGlobal({ size: 'sm' }) })
 * ```
 */
export function granularityGlobal(options: GranularityGlobalOptions = {}): { provide: Record<symbol, unknown> } {
  const config: GrConfigContext = {
    size: computed(() => options.size),
    componentDefaults: computed(() => options.componentDefaults ?? {}),
    theme: computed(() => options.theme),
    portalTarget: computed(() => options.portalTarget),
  }

  const provide: Record<symbol, unknown> = { [GR_CONFIG_KEY]: config }

  if (options.i18n)
    provide[GRANULARITY_I18N_KEY] = 't' in options.i18n && typeof options.i18n.t === 'function'
      ? options.i18n
      : i18nAdapter(options.i18n)

  return { provide }
}
