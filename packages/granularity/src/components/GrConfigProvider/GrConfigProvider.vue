<script setup lang="ts">
/**
 * GrConfigProvider — глобальные дефолты для вложенных GR-компонентов.
 *
 * Даёт единое место для:
 * - `size` — дефолтного размера контролов (не нужно повторять `size` в каждом вызове);
 * - `zIndexBase` — базы z-index для оверлеев (пробрасывается как CSS-переменная `--gr-z-base`);
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
    /** База z-index для оверлеев. Пробрасывается как `--gr-z-base`. */
    zIndexBase?: number
    /** Дефолтные пропсы по компонентам: `{ GrButton: { variant: 'secondary' } }`. */
    componentDefaults?: GrComponentDefaults
    /** Адаптер переводов (fint-i18n-совместимый). Прокидывается вложенным компонентам. */
    i18n?: GranularityI18nAdapter | null
    /** Тег обёртки. По умолчанию прозрачный `<div style="display:contents">`. */
    tag?: string
  }>(),
  {
    size: undefined,
    zIndexBase: undefined,
    componentDefaults: undefined,
    i18n: undefined,
    tag: 'div',
  },
)

// Наследуемся от родительского провайдера — вложенные провайдеры мержатся.
const parent = useGrConfig()

const size = computed(() => props.size ?? parent.size.value)
const zIndexBase = computed(() => props.zIndexBase ?? parent.zIndexBase.value)
const componentDefaults = computed<GrComponentDefaults>(() => ({
  ...parent.componentDefaults.value,
  ...(props.componentDefaults ?? {}),
}))

provide<GrConfigContext>(GR_CONFIG_KEY, { size, zIndexBase, componentDefaults })

// i18n-адаптер прокидываем детям только если он задан явно — иначе не затеняем
// адаптер, установленный приложением выше по дереву (fint-i18n).
if (props.i18n != null)
  provide(GRANULARITY_I18N_KEY, props.i18n)

const wrapperStyle = computed(() => ({
  display: 'contents',
  ...(zIndexBase.value != null ? { '--gr-z-base': String(zIndexBase.value) } : {}),
}))
</script>

<template>
  <component :is="props.tag" data-gr-config-provider :style="wrapperStyle">
    <slot />
  </component>
</template>
