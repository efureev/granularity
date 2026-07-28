<script setup lang="ts">
/**
 * GrConfigProvider — глобальные дефолты для вложенных GR-компонентов.
 *
 * Даёт единое место для:
 * - `size` — дефолтного размера контролов (не нужно повторять `size` в каждом вызове);
 * - `componentDefaults` — per-component дефолтных пропсов;
 * - `i18n` — адаптера переводов (иначе приложение инжектит его вручную).
 *
 * Провайдеры можно вкладывать: дочерний мержится поверх родительского, поэтому
 * можно задать «глобальную» тему и точечно переопределить её в поддереве.
 *
 * Рендерится прозрачно (`display: contents`), чтобы не влиять на layout.
 */
import { computed, provide } from 'vue'

import { GRANULARITY_I18N_KEY, type GranularityI18nAdapter } from '../../i18n/adapter'
import {
  GR_CONFIG_KEY,
  useGrConfig,
  type GrComponentDefaults,
  type GrComponentSize,
  type GrConfigContext,
} from './context'

export type { GrComponentDefaults, GrComponentSize } from './context'

const props = withDefaults(
  defineProps<{
    /** Дефолтный размер контролов для вложенных компонентов. */
    size?: GrComponentSize
    /** Дефолтные пропсы по компонентам: `{ GrButton: { variant: 'secondary' } }`. */
    componentDefaults?: GrComponentDefaults
    /** Адаптер переводов (fint-i18n-совместимый). Прокидывается вложенным компонентам. */
    i18n?: GranularityI18nAdapter | null
    /** Тег обёртки. По умолчанию прозрачный `<div style="display:contents">`. */
    tag?: string
  }>(),
  {
    size: undefined,
    componentDefaults: undefined,
    i18n: undefined,
    tag: 'div',
  },
)

// Наследуемся от родительского провайдера — вложенные провайдеры мержатся.
const parent = useGrConfig()

const size = computed(() => props.size ?? parent.size.value)
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

provide<GrConfigContext>(GR_CONFIG_KEY, { size, componentDefaults })

// i18n-адаптер прокидываем детям только если он задан явно — иначе не затеняем
// адаптер, установленный приложением выше по дереву (fint-i18n).
if (props.i18n != null)
  provide(GRANULARITY_I18N_KEY, props.i18n)

const wrapperStyle = { display: 'contents' } as const
</script>

<template>
  <component :is="props.tag" data-gr-config-provider :style="wrapperStyle">
    <slot />
  </component>
</template>
