/**
 * Откуда взялось значение пропа: из разметки, из `GrConfigProvider` или из
 * собственного дефолта компонента.
 *
 * Цепочку считает `useGrComponentProp` внутри `computed`, и наружу выходит
 * только результат — воспроизвести её здесь не выйдет, но восстановить
 * **источник** можно точно.
 */

export type GrPropSource = 'prop' | 'component-default' | 'provider-size' | 'default' | 'unset'

/**
 * Kebab-case из шаблона (`aria-label`) и camelCase из `props` — одно и то же имя.
 * Vue нормализует его при резолве, а в сыром `vnode.props` остаётся как написано.
 */
function toCamelCase(name: string): string {
  return name.replace(/-(\w)/g, (_, letter: string) => letter.toUpperCase())
}

function wasPassed(passedProps: Record<string, unknown> | null | undefined, key: string): boolean {
  if (!passedProps)
    return false

  for (const [rawKey, value] of Object.entries(passedProps)) {
    if (toCamelCase(rawKey) !== key)
      continue
    // `:size="undefined"` — это «не задавал»: ровно так же ведёт себя и Vue,
    // подставляя дефолт. Иначе панель показывала бы источником проп, которого нет.
    return value !== undefined
  }

  return false
}

export interface PropSourceInput {
  /** Сырые пропы из `vnode.props`: что действительно написал вызывающий. */
  passedProps: Record<string, unknown> | null | undefined
  /** `componentDefaults[<Component>]` ближайшего провайдера. */
  componentDefaults: Record<string, unknown> | undefined
  /** Глобальный `size` провайдера. */
  providerSize: string | undefined
}

export function resolvePropSource(key: string, input: PropSourceInput): GrPropSource {
  if (wasPassed(input.passedProps, key))
    return 'prop'

  if (input.componentDefaults && input.componentDefaults[key] !== undefined)
    return 'component-default'

  // Точечный дефолт компонента уже проверен выше и по контракту сильнее общего.
  if (key === 'size' && input.providerSize !== undefined)
    return 'provider-size'

  return 'default'
}

const SOURCE_LABELS: Record<GrPropSource, string> = {
  'prop': 'prop',
  'component-default': 'GrConfigProvider · componentDefaults',
  'provider-size': 'GrConfigProvider · size',
  'default': 'component default',
  'unset': 'not set',
}

export interface PropStateEntry {
  type: string
  key: string
  value: unknown
  editable: false
}

/**
 * Раскладывает пропы компонента по источникам — по группе на источник.
 *
 * Группами, а не подписью у каждого ключа: вопрос, ради которого раздел
 * заведён, звучит как «что здесь пришло не из моей разметки», и группа отвечает
 * на него одним взглядом.
 */
export function propSourceState(props: Record<string, unknown>, input: PropSourceInput): PropStateEntry[] {
  return Object.entries(props).map(([key, value]) => {
    const source = resolvePropSource(key, input)

    return {
      // Проп без значения и без источника — не «дефолт компонента»: дефолта у
      // него нет вовсе. Смешивать их значило бы утверждать, что `undefined`
      // кто-то выбрал.
      type: SOURCE_LABELS[source === 'default' && value === undefined ? 'unset' : source],
      key,
      value,
      editable: false as const,
    }
  })
}
