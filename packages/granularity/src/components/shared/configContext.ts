import { computed, getCurrentInstance, inject, type ComputedRef, type InjectionKey } from 'vue'

import type { GrComponentDefaultsRegistry } from '../../composables/useGrComponentConfig'
import { type GrModeName, type GrThemeId, type GrThemeManifest, peekThemeState, themeActivationAttrs } from '../../composables/internal/themeState'
import { GR_APP_COMPONENT_DEFAULTS } from './appComponentDefaults'

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
 * Реестр компонентов с настраиваемыми через конфиг пропами.
 *
 * Объявлен в `composables/useGrComponentConfig` — там же, куда его дополняют
 * и компоненты пакета, и companion-пакеты. Здесь только реэкспорт для тех, кто
 * работает с контекстом провайдера напрямую.
 */
export type { GrComponentDefaultsRegistry }

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
  /**
   * Слои `componentDefaults` порознь: темы — и всё, что над ней (приложение,
   * провайдеры). Остров превью подменяет только слой темы. Необязательны:
   * контекст, построенный руками, несёт один `componentDefaults`.
   */
  themeDefaults?: ComputedRef<GrComponentDefaults | undefined>
  overrideDefaults?: ComputedRef<GrComponentDefaults>
  /**
   * Тема поддерева — превью другой темы каталога. Необязательна: тип публичный,
   * и контекст строят руками — например хост императивных диалогов.
   */
  theme?: ComputedRef<GrThemeId | undefined>
  /** Режим поддерева — остров. Необязателен по той же причине, что и `theme`. */
  mode?: ComputedRef<GrModeName | undefined>
  /**
   * Куда монтируются оверлеи поддерева (`usePortalTarget`). Необязательно, как
   * и `theme`: контекст строят руками — например хост императивных диалогов.
   */
  portalTarget?: ComputedRef<string | HTMLElement | undefined>
}

export const GR_CONFIG_KEY: InjectionKey<GrConfigContext> = Symbol('gr-config')

/**
 * Пустой конфиг: когда провайдера в дереве нет, всё разрешается в `undefined`,
 * а компоненты падают на собственные дефолты.
 *
 * `computed` здесь не роскошь: контекст типизирован рефами, и потребитель вправе
 * прогнать `size` через `unref()` или `watch()`. Плоский объект `{ value: … }`
 * не пройдёт проверку `isRef`, и такой код молча получит сам объект вместо
 * значения — поэтому «просто константа» тут не подходит.
 *
 * А вот пустые значения заморожены, и это не педантизм: `computed` без
 * зависимостей вычисляется один раз и отдаёт **один и тот же** объект всем
 * компонентам без провайдера. Незамороженный, он позволил бы одному потребителю
 * записать в него ключ и тем самым подменить дефолты всему приложению.
 */
const EMPTY_COMPONENT_DEFAULTS: GrComponentDefaults = Object.freeze({})

const EMPTY_CONFIG: GrConfigContext = {
  size: computed(() => undefined),
  componentDefaults: computed(() => EMPTY_COMPONENT_DEFAULTS),
  theme: computed(() => undefined),
  mode: computed(() => undefined),
  portalTarget: computed(() => undefined),
}

type DefaultsRecord = Record<string, Record<string, unknown>>

function isDefaultsRecord(value: unknown): value is DefaultsRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    && Object.values(value).every(props => typeof props === 'object' && props !== null && !Array.isArray(props))
}

const themeDefaultsCache = new WeakMap<GrThemeManifest, Map<string, GrComponentDefaults | null>>()

/**
 * Пропсы по умолчанию, которые несёт тема: `componentDefaults` в
 * `extensions.granularity` манифеста `virtual:granum/themes`. Так тема меняет
 * то, чего токеном не выразить, — вид индикатора загрузки, форму группы.
 * Без `themeId` — тема сборки; с ним — тема превью из `previews` манифеста
 * (granum 3.4). Нет или не та форма — `undefined`.
 */
export function themeComponentDefaults(manifest: GrThemeManifest | null | undefined, themeId?: GrThemeId): GrComponentDefaults | undefined {
  if (!manifest)
    return undefined
  const id = themeId ?? manifest.theme.id
  let byTheme = themeDefaultsCache.get(manifest)
  if (!byTheme) {
    byTheme = new Map()
    themeDefaultsCache.set(manifest, byTheme)
  }
  if (!byTheme.has(id)) {
    const extensions = id === manifest.theme.id
      ? manifest.extensions
      : manifest.previews?.find(preview => preview.theme.id === id)?.extensions
    const raw = (extensions?.granularity as { componentDefaults?: unknown } | undefined)?.componentDefaults
    byTheme.set(id, isDefaultsRecord(raw) && Object.keys(raw).length > 0 ? Object.freeze(raw) : null)
  }
  return byTheme.get(id) ?? undefined
}

/** Слияние по пропам, а не по компонентам: верхний слой меняет один проп, не стирая блок. */
export function mergeComponentDefaults(...layers: (GrComponentDefaults | DefaultsRecord | null | undefined)[]): GrComponentDefaults {
  const merged: DefaultsRecord = {}
  for (const layer of layers) {
    for (const [component, props] of Object.entries((layer ?? {}) as DefaultsRecord))
      merged[component] = { ...merged[component], ...props }
  }
  return merged
}

const NO_LAYER = Object.freeze({})
const rootConfigs = new WeakMap<object, WeakMap<object, GrConfigContext>>()

/**
 * Конфиг без провайдера в дереве: пропсы по умолчанию темы сборки, поверх —
 * приложения (`createGranularity`). Кешируется на пару источников: иначе каждый
 * компонент без провайдера заводил бы свой `computed`.
 */
function rootConfig(): GrConfigContext {
  const manifest = peekThemeState()?.manifest
  const theme = themeComponentDefaults(manifest)
  const app = inject(GR_APP_COMPONENT_DEFAULTS, null)
  if (!theme && !app)
    return EMPTY_CONFIG

  const themeKey = theme ? manifest! : NO_LAYER
  const appKey = app ?? NO_LAYER
  let byApp = rootConfigs.get(themeKey)
  if (!byApp) {
    byApp = new WeakMap()
    rootConfigs.set(themeKey, byApp)
  }
  let config = byApp.get(appKey)
  if (!config) {
    const componentDefaults = Object.freeze(mergeComponentDefaults(theme, app))
    const overrides = app ?? EMPTY_COMPONENT_DEFAULTS
    config = {
      ...EMPTY_CONFIG,
      componentDefaults: computed(() => componentDefaults),
      themeDefaults: computed(() => theme),
      overrideDefaults: computed(() => overrides),
    }
    byApp.set(appKey, config)
  }
  return config
}

/**
 * Ближайший `GrConfigProvider`; без него — пропсы по умолчанию темы сборки и
 * приложения, а без них — пустой конфиг.
 */
export function useGrConfig(): GrConfigContext {
  return inject(GR_CONFIG_KEY, null) ?? rootConfig()
}

/**
 * Источник конфига для {@link resolveGrConfig}: сам контекст, `AppContext` или
 * инстанс компонента — у двух последних читается `provides`.
 */
export type GrConfigSource = GrConfigContext | { provides?: Record<symbol | string, unknown> }

function isGrConfigContext(source: unknown): source is GrConfigContext {
  return typeof (source as GrConfigContext | null)?.componentDefaults?.value === 'object'
}

/**
 * Конфиг там, где `inject` недоступен — вне `setup`: в директивах, императивных
 * сервисах, утилитах. Порядок: явный контекст → `provides` источника → `inject`
 * (если есть активный инстанс) → пустой конфиг.
 *
 * Важно понимать границу: `provides` у `AppContext` содержит только то, что
 * роздано через `app.provide()`. Значения от `<GrConfigProvider>` живут в дереве
 * компонентов, и достать их можно лишь оттуда, где это дерево ещё есть — то есть
 * захватом в `setup`. Просто передать `appContext` в отрыве от дерева
 * недостаточно; см. `SPEC-GrConfig-resolver.md`.
 */
export function resolveGrConfig(source?: GrConfigSource | null): GrConfigContext {
  if (isGrConfigContext(source))
    return source

  const provides = source?.provides
  if (provides) {
    const fromProvides = provides[GR_CONFIG_KEY as symbol] as GrConfigContext | undefined
    return isGrConfigContext(fromProvides) ? fromProvides : EMPTY_CONFIG
  }

  if (getCurrentInstance())
    return useGrConfig()

  return EMPTY_CONFIG
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
  if (warnedUnsupportedSizes.has(key))
    return
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
    if (local !== undefined)
      return local

    const fromComponentDefaults = component
      ? (config.componentDefaults.value[component] as { size?: TSize } | undefined)?.size
      : undefined

    const fromConfig = fromComponentDefaults ?? config.size.value
    if (fromConfig === undefined)
      return fallback

    if (supported && !supported.includes(fromConfig as TSize)) {
      // Текст предупреждения и его дедуп живут прямо под гардом, а не в общей
      // функции: `__GR_DEV__` разворачивается в условие на сборке, бандлер
      // потребителя сворачивает его в `false` и выкидывает ветку целиком.
      // Почему не рантайм-хелпер — в `vite.config.ts`, у самого `define`.
      if (__GR_DEV__)
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
  return computed(() => (config.componentDefaults.value[name] ?? EMPTY_COMPONENT_DEFAULTS) as GrDefaultsOf<TComponent>)
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
    if (local !== undefined)
      return local as NonNullable<GrDefaultsOf<TComponent>[TProp]>

    // Промежуточная аннотация (а не `as`) нужна, чтобы TS не разворачивал
    // `GrComponentDefaults[TComponent]` в объединение всех блоков — по нему
    // generic-ключ `TProp` уже не проиндексировать.
    const defaults: GrDefaultsOf<TComponent> | undefined = config.componentDefaults.value[component]
    return defaults?.[prop] ?? fallback
  })
}

/**
 * Атрибут режима для **телепортируемого** корня панели.
 *
 * Панель уезжает в `body`, то есть вне DOM-поддерева провайдера, и `data-theme`
 * с его обёртки на неё не наследуется. В дереве компонентов она при этом
 * остаётся внутри — `inject` работает, — поэтому пару панель ставит себе сама.
 * Без этого остров режима и превью темы ломались бы на первом же открытом дропдауне.
 *
 * ```vue
 * <teleport to="body">
 *   <div v-bind="themeAttrs">…</div>
 * </teleport>
 * ```
 */
export function useGrThemeAttrs(): ComputedRef<Record<string, string>> {
  const config = useGrConfig()
  const state = peekThemeState()
  return computed(() => themeActivationAttrs(state, config.theme?.value, config.mode?.value))
}
