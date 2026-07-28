import { computed, inject, type ComputedRef, type InjectionKey } from 'vue'

/**
 * Контекст `GrConfigProvider` — глобальные дефолты для вложенных GR-компонентов:
 * размер контролов и per-component дефолтные пропсы.
 *
 * Компоненты читают его через {@link useGrConfig} (или хелперы ниже) и используют
 * как fallback, когда соответствующий проп не задан на самом компоненте. Провайдер
 * можно вкладывать — дочерний мержится поверх родительского.
 */

/**
 * Размеры, которыми оперирует провайдер. Это «размеры контролов» — общий
 * знаменатель формных компонентов, а не объединение всех size-шкал пакета
 * (у оверлеев есть свои `xl`/`full`, у слайдера нет `xs`).
 */
export const GR_COMPONENT_SIZES = ['xs', 'sm', 'md', 'lg'] as const

export type GrComponentSize = typeof GR_COMPONENT_SIZES[number]

/**
 * Открытый реестр компонентов, у которых есть настраиваемые через конфиг пропы.
 *
 * Пустой по умолчанию: каждый компонент дополняет его **из своей папки** через
 * declaration merging (`GrButton/defaults.ts` и т. п.). Так провайдер не знает
 * ни имён, ни типов конкретных компонентов — контракт объявляет тот, кто им
 * владеет, а не общий модуль.
 *
 * Практическое следствие: реестр состоит ровно из тех компонентов, которые
 * попали в граф типов потребителя. Импортировали только `GrButton` — в
 * `componentDefaults` типизирована только кнопка, типы `GrBadge` в проект не
 * приезжают.
 *
 * ```ts
 * // GrButton/defaults.ts
 * declare module '../GrConfigProvider/context' {
 *   interface GrComponentDefaultsRegistry {
 *     GrButton: GrButtonConfigurableProps
 *   }
 * }
 * ```
 */
export interface GrComponentDefaultsRegistry {}

/** Имя компонента, у которого есть настраиваемые через конфиг пропы. */
export type GrConfigurableComponent = keyof GrComponentDefaultsRegistry

/**
 * Дефолтные пропсы по имени компонента: `{ GrButton: { variant: 'secondary' } }`.
 *
 * Набор ключей закрыт реестром, а не `Record<string, unknown>`: через конфиг
 * должны настраиваться только «оформительские» пропы. Пустить туда что угодно —
 * значит разрешить задать глобальный `modelValue` или обработчик и получить баг,
 * который ищется часами.
 */
export type GrComponentDefaults = {
  [TComponent in GrConfigurableComponent]?: Partial<GrComponentDefaultsRegistry[TComponent]>
}

type GrDefaultsOf<TComponent extends GrConfigurableComponent> = Partial<GrComponentDefaultsRegistry[TComponent]>

export interface GrConfigContext {
  /** Дефолтный размер контролов (если проп `size` не задан на компоненте). */
  size: ComputedRef<GrComponentSize | undefined>
  /** Дефолтные пропсы по компонентам. */
  componentDefaults: ComputedRef<GrComponentDefaults>
}

export const GR_CONFIG_KEY: InjectionKey<GrConfigContext> = Symbol('gr-config')

// Пустой конфиг: когда провайдера в дереве нет, всё разрешается в `undefined`,
// а компоненты падают на собственные дефолты.
const EMPTY_CONFIG: GrConfigContext = {
  size: computed(() => undefined),
  componentDefaults: computed(() => ({})),
}

/** Возвращает ближайший `GrConfigProvider` или пустой конфиг, если провайдера нет. */
export function useGrConfig(): GrConfigContext {
  return inject(GR_CONFIG_KEY, EMPTY_CONFIG)
}

export type UseGrComponentSizeOptions<TSize extends string> = {
  /**
   * Имя компонента, чтобы учесть точечный `componentDefaults[Component].size`.
   * Без него читается только глобальный `size` провайдера.
   */
  component?: GrConfigurableComponent
  /** Размер, когда ни проп, ни конфиг ничего не дали. По умолчанию `md`. */
  fallback?: TSize
  /**
   * Размеры, которые компонент реально умеет. Значение из конфига вне этого
   * списка игнорируется в пользу `fallback`.
   *
   * Обязателен для компонентов, у которых size-шкала уже общей (`GrSlider`,
   * `GrRating`, `GrSwitch`, `GrLink`, `GrStatistic` не знают про `xs`): без него
   * `<GrConfigProvider size="xs">` дал бы `sizeMap['xs'] === undefined`, то есть
   * компонент без размерных классов — молча, без ошибки сборки.
   */
  supported?: readonly TSize[]
}

// Предупреждаем один раз на уникальную пару «размер + список поддерживаемых»,
// иначе список из сотни контролов зальёт консоль одинаковыми сообщениями.
const warnedUnsupportedSizes = new Set<string>()

/** Сброс дедупликации предупреждений. Внутреннее API — нужно тестам. */
export function resetUnsupportedSizeWarnings(): void {
  warnedUnsupportedSizes.clear()
}

function warnUnsupportedSize(size: string, supported: readonly string[]): void {
  const key = `${size}|${supported.join(',')}`
  if (warnedUnsupportedSizes.has(key)) return
  warnedUnsupportedSizes.add(key)

  console.warn(
    `[granularity] GrConfigProvider size="${size}" is not supported by this component `
    + `(supported: ${supported.join(', ')}); falling back to its own default.`,
  )
}

/**
 * Эффективный размер компонента. Приоритет:
 * локальный проп → `componentDefaults[Component].size` → глобальный `size`
 * провайдера → `fallback`. Точечная настройка компонента должна побеждать
 * общую — иначе `componentDefaults` нельзя было бы использовать как исключение
 * из глобального правила.
 *
 * Передавайте `size` геттером, чтобы сохранить реактивность.
 *
 * Локальный проп не проверяется по `supported`: он уже сужен типом пропа самого
 * компонента, и передать туда лишнее — явная ошибка вызывающего кода. Проверка
 * нужна конфигу: это глобальный канал, который не знает, кто его читает.
 */
export function useGrComponentSize<TSize extends string = GrComponentSize>(
  localSize: () => TSize | undefined,
  options: UseGrComponentSizeOptions<TSize> = {},
): ComputedRef<TSize> {
  // Все size-шкалы пакета содержат `md`, поэтому он безопасен как общий дефолт.
  const { component, fallback = 'md' as TSize, supported } = options
  const config = useGrConfig()

  return computed(() => {
    const local = localSize()
    if (local !== undefined) return local

    const fromComponentDefaults = component
      ? (config.componentDefaults.value[component] as { size?: TSize } | undefined)?.size
      : undefined

    const fromConfig = fromComponentDefaults ?? config.size.value
    if (fromConfig === undefined) return fallback

    if (supported && !supported.includes(fromConfig as TSize)) {
      // Проверку окружения держим инлайном: бандлер потребителя подставляет
      // `process.env.NODE_ENV`, сворачивает условие в `false` и выкидывает
      // и текст предупреждения, и дедуп-Set. Через промежуточную константу
      // это не работает — межмодульную свёртку esbuild/rollup не делают, и
      // DX-сообщение осталось бы в каждом бандле (проверено замером).
      // `typeof process` — страховка для сборок, где `process` не определён.
      if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production')
        warnUnsupportedSize(fromConfig, supported)
      return fallback
    }

    return fromConfig as TSize
  })
}

/** Дефолтные пропсы конкретного компонента из ближайшего провайдера. */
export function useGrComponentDefaults<TComponent extends GrConfigurableComponent>(
  name: TComponent,
): ComputedRef<GrDefaultsOf<TComponent>> {
  const config = useGrConfig()
  return computed(() => (config.componentDefaults.value[name] ?? {}) as GrDefaultsOf<TComponent>)
}

/**
 * Эффективное значение «оформительского» пропа: локальный проп →
 * `componentDefaults[Component][prop]` → собственный дефолт компонента.
 *
 * Обязательное условие на стороне компонента: у такого пропа в `withDefaults`
 * должен стоять `undefined`, а «настоящий» дефолт — переехать сюда, в `fallback`.
 * Иначе конфиг не сработает никогда: Vue отдаёт `props.x` уже с подставленным
 * дефолтом, и отличить «пользователь передал значение» от «сработал дефолт»
 * изнутри компонента невозможно.
 */
export function useGrComponentProp<
  TComponent extends GrConfigurableComponent,
  TProp extends keyof GrDefaultsOf<TComponent>,
>(
  component: TComponent,
  prop: TProp,
  localValue: () => GrDefaultsOf<TComponent>[TProp],
  fallback: NonNullable<GrDefaultsOf<TComponent>[TProp]>,
): ComputedRef<NonNullable<GrDefaultsOf<TComponent>[TProp]>> {
  const config = useGrConfig()

  return computed(() => {
    const local = localValue()
    if (local !== undefined) return local as NonNullable<GrDefaultsOf<TComponent>[TProp]>

    // Промежуточная аннотация (а не `as`) нужна, чтобы TS не разворачивал
    // `GrComponentDefaults[TComponent]` в объединение всех блоков — по нему
    // generic-ключ `TProp` уже не проиндексировать.
    const defaults: GrDefaultsOf<TComponent> | undefined = config.componentDefaults.value[component]
    return defaults?.[prop] ?? fallback
  })
}
