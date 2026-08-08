<script setup lang="ts">
/**
 * GrConfigProvider — глобальные дефолты для вложенных GR-компонентов.
 *
 * Даёт единое место для:
 * - `size` — дефолтного размера контролов (не нужно повторять `size` в каждом вызове);
 * - `componentDefaults` — per-component дефолтных пропсов;
 * - `i18n` — адаптера переводов (иначе приложение инжектит его вручную);
 * - `theme` — темы поддерева;
 * - `portalTarget` — точки монтирования оверлеев;
 * - `zIndexBase` — базы шкалы слоёв.
 *
 * Провайдеры можно вкладывать: дочерний мержится поверх родительского, поэтому
 * можно задать «глобальную» тему и точечно переопределить её в поддереве.
 *
 * Рендерится прозрачно (`display: contents`), чтобы не влиять на layout.
 */
import { computed, onBeforeUnmount, provide, watch } from 'vue'

import { GRANULARITY_I18N_KEY, type GranularityI18nAdapter } from '../../i18n/adapter'
import { resolveGranularityI18n } from '../../internal/granularityI18n'
import { applyGrZIndexBase } from './zIndexScale'
import {
  GR_CONFIG_KEY,
  useGrConfig,
  type GrComponentDefaults,
  type GrComponentSize,
  type GrConfigContext,
} from './context'

export type { GrComponentDefaults, GrComponentSize } from './context'

export interface GrConfigProviderProps {
  /** Дефолтный размер контролов для вложенных компонентов. */
  size?: GrComponentSize
  /** Дефолтные пропсы по компонентам: `{ GrButton: { variant: 'secondary' } }`. */
  componentDefaults?: GrComponentDefaults
  /** Адаптер переводов (fint-i18n-совместимый). Прокидывается вложенным компонентам. */
  i18n?: GranularityI18nAdapter | null
  /**
   * Просьба к адаптеру переключить язык (`syncLocale`). Источником истины
   * остаётся сам адаптер — провайдер лишь передаёт ему намерение.
   */
  locale?: string
  /**
   * Тема поддерева: значение уезжает в `data-theme`. Тема **документа** —
   * работа `useTheme`/`initThemeEarly`, здесь именно остров.
   */
  theme?: string
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
// Цель портала наследуется вниз: вложенный провайдер без своего значения
// оставляет оверлеи там же, где их ждёт родительское приложение.
const portalTarget = computed(() => props.portalTarget ?? parent.portalTarget?.value)
const componentDefaults = computed<GrComponentDefaults>(() => {
  const inherited = parent.componentDefaults.value as Record<string, Record<string, unknown>>
  const own = (props.componentDefaults ?? {}) as Record<string, Record<string, unknown>>

  // Мержим на уровне пропов, а не компонентов: иначе вложенный провайдер,
  // переопределяющий один `variant`, стирал бы у родителя весь блок `GrButton`.
  const merged: Record<string, Record<string, unknown>> = { ...inherited }
  for (const [component, componentProps] of Object.entries(own))
    merged[component] = { ...(inherited[component] ?? {}), ...componentProps }

  return merged
})

provide<GrConfigContext>(GR_CONFIG_KEY, { size, componentDefaults, theme, portalTarget })

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
    const adapter = activeI18n.value
    return adapter?.syncLocale ? (next: string) => adapter.syncLocale!(next) : undefined
  },
})

watch(
  () => [props.locale, activeI18n.value] as const,
  ([locale, adapter]) => {
    if (!locale || adapter?.locale?.value === locale) return
    void adapter?.syncLocale?.(locale)
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
</script>

<template>
  <component
    :is="props.tag"
    data-gr-config-provider
    :data-theme="theme"
    :style="wrapperStyle"
  >
    <slot />
  </component>
</template>
