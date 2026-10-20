<script setup lang="ts">
/**
 * GrConfigProvider — глобальные дефолты для вложенных GR-компонентов.
 *
 * Даёт единое место для:
 * - `size` — дефолтного размера контролов (не нужно повторять `size` в каждом вызове);
 * - `componentDefaults` — per-component дефолтных пропсов;
 * - `i18n` — адаптера переводов (иначе приложение инжектит его вручную);
 * - `mode` и `theme` — острова режима и превью темы;
 * - `portalTarget` — точки монтирования оверлеев;
 * - `zIndexBase` — базы шкалы слоёв.
 *
 * Провайдеры можно вкладывать: дочерний мержится поверх родительского, поэтому
 * можно задать режим поддереву и точечно переопределить его глубже.
 *
 * Рендерится прозрачно (`display: contents`), чтобы не влиять на layout.
 */
import { computed, onBeforeUnmount, provide, watch } from 'vue'

import { GRANULARITY_I18N_KEY, type GranularityI18nAdapter } from '../../i18n/adapter'
import { fallbackThemeManifest, type GrModeName, type GrThemeId, peekThemeState, themeActivationAttrs } from '../../composables/internal/themeState'
import { localeSwitchOf, resolveGranularityI18n } from '../../internal/granularityI18n'
import { applyGrZIndexBase } from './zIndexScale'
import {
  GR_CONFIG_KEY,
  mergeComponentDefaults,
  themeComponentDefaults,
  useGrConfig,
  type GrComponentDefaults,
  type GrComponentSize,
  type GrConfigContext,
} from '../shared/configContext'

export type { GrComponentDefaults, GrComponentSize } from '../shared/configContext'

export interface GrConfigProviderProps {
  /** Дефолтный размер контролов для вложенных компонентов. */
  size?: GrComponentSize
  /** Дефолтные пропсы по компонентам: `{ GrButton: { variant: 'secondary' } }`. */
  componentDefaults?: GrComponentDefaults
  /** Адаптер переводов (fint-i18n-совместимый). Прокидывается вложенным компонентам. */
  i18n?: GranularityI18nAdapter | null
  /**
   * Просьба к адаптеру переключить язык (`syncLocale`, у инстанса fint-i18n —
   * `setLocale`). Источником истины остаётся сам адаптер — провайдер лишь
   * передаёт ему намерение.
   */
  locale?: string
  /**
   * Режим поддерева — остров: `dark` уезжает в `data-theme` парой темы сборки
   * (`slate-dark`). Режим **документа** — работа `useTheme`/`initThemeEarly`.
   */
  mode?: GrModeName
  /**
   * Превью другой темы каталога: `theme="clay" mode="dark"` пишет
   * `data-theme="clay-dark"`. Блоки её пар собирает granum по `previews`
   * конфига — без них превью не найдёт ни одного селектора. Без `mode`
   * показывает тему в режиме документа.
   */
  theme?: GrThemeId
  /**
   * Куда монтировать оверлеи поддерева. По умолчанию — общий `#gr-portal` в
   * `body`. Своё значение нужно там, где приложение живёт в контейнере:
   * микрофронтенд, shadow DOM, CSS-скоупинг под конкретным корнем.
   */
  portalTarget?: string | HTMLElement
  /**
   * База шкалы слоёв. Переменные `--gr-z-*` пересчитываются от неё и ставятся
   * на `<html>`: панели телепортируются в `body`, и переменные поддерева до
   * них не доходят.
   */
  zIndexBase?: number
  /** Тег обёртки. По умолчанию прозрачный `<div style="display:contents">`. */
  tag?: string
}

const props = withDefaults(
  defineProps<GrConfigProviderProps>(),
  {
    size: undefined,
    componentDefaults: undefined,
    i18n: undefined,
    locale: undefined,
    mode: undefined,
    theme: undefined,
    portalTarget: undefined,
    zIndexBase: undefined,
    tag: 'div',
  },
)

// Наследуемся от родительского провайдера — вложенные провайдеры мержатся.
const parent = useGrConfig()

const size = computed(() => props.size ?? parent.size.value)
const theme = computed(() => props.theme ?? parent.theme?.value)
const mode = computed(() => props.mode ?? parent.mode?.value)
const themeState = peekThemeState()
const themeAttrs = computed(() => themeActivationAttrs(themeState, theme.value, mode.value))

// Имя режима в пропе темы даёт пару `dark-light`, которая молча не найдёт ни
// одного селектора.
if (__GR_DEV__ && props.theme !== undefined && (themeState?.manifest ?? fallbackThemeManifest()).modes.some(entry => entry.name === props.theme)) {
  console.warn(
    `[granularity] GrConfigProvider: theme="${props.theme}" — это режим, а не тема. `
    + `Остров режима задаётся пропом mode="${props.theme}".`,
  )
}
// Цель портала наследуется вниз: вложенный провайдер без своего значения
// оставляет оверлеи там же, где их ждёт родительское приложение.
const portalTarget = computed(() => props.portalTarget ?? parent.portalTarget?.value)
// Слои порознь: тема — снизу, приложение и провайдеры — над ней. Остров превью
// подменяет только слой темы, пропсы приложения и родителей остаются сверху.
// Родитель без слоёв (контекст, построенный руками) — весь в слоях над темой.
const themeDefaults = computed<GrComponentDefaults | undefined>(() => props.theme !== undefined
  ? themeComponentDefaults(themeState?.manifest, props.theme)
  : parent.themeDefaults?.value)
const overrideDefaults = computed<GrComponentDefaults>(() => mergeComponentDefaults(
  parent.overrideDefaults ? parent.overrideDefaults.value : parent.componentDefaults.value,
  props.componentDefaults,
))
const componentDefaults = computed<GrComponentDefaults>(() => mergeComponentDefaults(themeDefaults.value, overrideDefaults.value))

provide<GrConfigContext>(GR_CONFIG_KEY, { size, componentDefaults, themeDefaults, overrideDefaults, theme, mode, portalTarget })

// ————— i18n.
//
// Адаптер отдаём вниз ВСЕГДА и фасадом, а не значением. Прежнее
// `if (props.i18n != null) provide(…)` решало судьбу один раз в `setup`:
// адаптер, созданный асинхронно (обычная загрузка локали), не приезжал уже
// никогда, а подмена адаптера при смене языка до детей не доходила.
const inheritedI18n = resolveGranularityI18n()
const activeI18n = computed(() => props.i18n ?? inheritedI18n)

provide<GranularityI18nAdapter>(GRANULARITY_I18N_KEY, {
  t: (key, params) => activeI18n.value?.t(key, params) ?? key,
  // Геттеры, а не поля: `useGranularityTranslations` спрашивает `if (i18n.te)`,
  // и всегда определённый метод у адаптера без `te` означал бы «перевода нет»
  // для каждого ключа.
  get te() {
    const adapter = activeI18n.value
    return adapter?.te ? (key: string) => adapter.te!(key) : undefined
  },
  get locale() {
    return activeI18n.value?.locale
  },
  get syncLocale() {
    return localeSwitchOf(activeI18n.value)
  },
})

watch(
  () => [props.locale, activeI18n.value] as const,
  ([locale, adapter]) => {
    if (!locale || adapter?.locale?.value === locale)
      return
    void localeSwitchOf(adapter)?.(locale)
  },
  { immediate: true },
)

// ————— Шкала слоёв. Ставится на `<html>` и живёт в отдельном модуле: владелец
// шкалы один на документ, а `<script setup>` — это уже область инстанса.
const zIndexToken = Symbol('gr-config-z-index')
let restoreZIndex: (() => void) | null = null

watch(
  () => props.zIndexBase,
  (base) => {
    restoreZIndex?.()
    restoreZIndex = applyGrZIndexBase(zIndexToken, base)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  restoreZIndex?.()
  restoreZIndex = null
})

const wrapperStyle = { display: 'contents' } as const

defineSlots<{
  /** Поддерево, которому адресованы настройки. */
  default?: () => any
}>()
</script>

<template>
  <component
    :is="props.tag"
    data-gr-config-provider
    v-bind="themeAttrs"
    :style="wrapperStyle"
  >
    <slot />
  </component>
</template>
