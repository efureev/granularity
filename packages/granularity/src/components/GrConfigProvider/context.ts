import { computed, inject, type ComputedRef, type InjectionKey } from 'vue'

/**
 * Контекст `GrConfigProvider` — глобальные дефолты для вложенных GR-компонентов:
 * размер контролов, база z-index для оверлеев и per-component дефолтные пропсы.
 *
 * Компоненты читают его через {@link useGrConfig} (или хелперы ниже) и используют
 * как fallback, когда соответствующий проп не задан на самом компоненте. Провайдер
 * можно вкладывать — дочерний мержится поверх родительского.
 */

export type GrComponentSize = 'xs' | 'sm' | 'md' | 'lg'

/** Дефолтные пропсы по имени компонента: `{ GrButton: { variant: 'secondary' } }`. */
export type GrComponentDefaults = Partial<Record<string, Record<string, unknown>>>

export interface GrConfigContext {
  /** Дефолтный размер контролов (если проп `size` не задан на компоненте). */
  size: ComputedRef<GrComponentSize | undefined>
  /** База z-index для оверлеев (модалки/тосты/дропдауны). */
  zIndexBase: ComputedRef<number | undefined>
  /** Дефолтные пропсы по компонентам. */
  componentDefaults: ComputedRef<GrComponentDefaults>
}

export const GR_CONFIG_KEY: InjectionKey<GrConfigContext> = Symbol('gr-config')

// Пустой конфиг: когда провайдера в дереве нет, всё разрешается в `undefined`,
// а компоненты падают на собственные дефолты.
const EMPTY_CONFIG: GrConfigContext = {
  size: computed(() => undefined),
  zIndexBase: computed(() => undefined),
  componentDefaults: computed(() => ({})),
}

/** Возвращает ближайший `GrConfigProvider` или пустой конфиг, если провайдера нет. */
export function useGrConfig(): GrConfigContext {
  return inject(GR_CONFIG_KEY, EMPTY_CONFIG)
}

/**
 * Эффективный размер компонента: локальный проп → конфиг провайдера → `fallback`.
 * Передавайте `size` геттером, чтобы сохранить реактивность.
 */
export function useGrComponentSize(
  localSize: () => GrComponentSize | undefined,
  fallback: GrComponentSize = 'md',
): ComputedRef<GrComponentSize> {
  const config = useGrConfig()
  return computed(() => localSize() ?? config.size.value ?? fallback)
}

/** Дефолтные пропсы конкретного компонента из ближайшего провайдера. */
export function useGrComponentDefaults(name: string): ComputedRef<Record<string, unknown>> {
  const config = useGrConfig()
  return computed(() => config.componentDefaults.value[name] ?? {})
}
