import type { ConsumedIndex } from './emptyTokens'
import { grComponentTokens, grFoundationTokens } from '@feugene/granularity/tokens'

/**
 * Все токены дизайн-системы, которые компонент читает на самом деле, — с тем,
 * кто их объявил, и с фактическим значением.
 *
 * Секция «токены компонента» отвечает на обратный вопрос: что компонент
 * **объявляет** своим `tokens.json`. Между этими множествами нет включения ни в
 * одну сторону. Объявленный токен может не потребляться (объявлен ради
 * потребителя), а потребляется компонент в основном чужим: `--gr-primary`,
 * `--gr-radius-control`, `--gr-muted-fg` объявлены не им. Из-за этого вопрос
 * «какие токены надо задать, чтобы перекрасить вот это» до сих пор решался
 * чтением исходников.
 *
 * Владелец берётся из реестров пакета (`@feugene/granularity/tokens`), а
 * значение — из вычисленного стиля того элемента, чьё правило токен читает.
 */

interface ComponentTokenDefinition {
  owner: string
  name: string
}

const OWNER_BY_TOKEN = new Map<string, string>(
  (grComponentTokens as readonly ComponentTokenDefinition[]).map(token => [token.name, token.owner]),
)

const FOUNDATION = new Set<string>(grFoundationTokens.map(token => token.name))

/** Чей токен относительно выбранного компонента. */
export type TokenOrigin
  /** Объявлен этим же компонентом. */
  = | 'own'
  /** Объявлен другим компонентом — правка заденет и его. */
    | 'component'
  /** Базовый токен дизайн-системы: палитра, шкалы, тени, длительности. */
    | 'foundation'
  /** Ни один реестр пакета его не объявляет. */
    | 'unknown'

export interface UsedToken {
  name: string
  origin: TokenOrigin
  /** Владелец при `origin: 'component'`. */
  owner?: string
  value: string
  /** Хоть раз читается без запасного значения — пустым уронит объявление. */
  strict: boolean
  /** Класс, чьё правило читает токен. */
  className: string
}

export interface UsedTokenProbe {
  read: (element: Element, token: string) => string
}

const OWN_PREFIX = '--gr-'

function originOf(token: string, component: string): { origin: TokenOrigin, owner?: string } {
  const owner = OWNER_BY_TOKEN.get(token)
  if (owner)
    return owner === component ? { origin: 'own' } : { origin: 'component', owner }
  return FOUNDATION.has(token) ? { origin: 'foundation' } : { origin: 'unknown' }
}

/**
 * Обход тот же, что у `emptyTokens`: элемент и потомки, значение читается на
 * том элементе, чьё правило токен требует. Токен, встреченный дважды, остаётся
 * в списке один раз — первым попаданием, а не последним: чем ближе к корню, тем
 * понятнее, откуда начинать.
 */
export function usedTokens(
  root: Element,
  component: string,
  consumed: ConsumedIndex,
  probe: UsedTokenProbe,
): UsedToken[] {
  const found = new Map<string, UsedToken>()

  for (const element of [root, ...root.querySelectorAll('*')]) {
    for (const className of element.classList) {
      for (const [name, usage] of consumed.get(className) ?? []) {
        if (!name.startsWith(OWN_PREFIX))
          continue

        const known = found.get(name)
        if (known) {
          known.strict ||= usage.strict
          continue
        }

        found.set(name, {
          name,
          ...originOf(name, component),
          value: probe.read(element, name).trim(),
          strict: usage.strict,
          className,
        })
      }
    }
  }

  return [...found.values()]
}

/** Раскладка по владельцу — в том порядке, в каком её читают: сначала своё. */
export function groupUsedTokens(tokens: readonly UsedToken[]): Record<TokenOrigin, UsedToken[]> {
  return {
    own: tokens.filter(token => token.origin === 'own'),
    component: tokens.filter(token => token.origin === 'component'),
    foundation: tokens.filter(token => token.origin === 'foundation'),
    unknown: tokens.filter(token => token.origin === 'unknown'),
  }
}
