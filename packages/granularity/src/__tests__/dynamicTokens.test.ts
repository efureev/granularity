import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { describe, expect, it } from 'vitest'

import { granularityComponentConfigs } from '../granular-provider/shared'
import { grDerivedTokens, grFoundationTokens, grThemeTokens } from '../tokens'
import { componentSourceFiles, publicComponents } from './componentGraph'

/**
 * Токен, к которому компонент обращается ДИНАМИЧЕСКИ, статический скан не
 * находит: имя приходит параметром, а `var()` собирается в рантайме. Пресет
 * такой токен считает никому не нужным и при включённой обрезке
 * (`pruneTokens`) удаляет его объявление — молча: сборка зелёная, `z-index`
 * разрешается в `unset`, панель уезжает под соседний слой.
 *
 * Единственная защита — объявить его в `dynamicTokens` конфига компонента.
 * Забыть это невозможно проверить глазами: ни один существующий гейт такую
 * потерю не видит, потому что CSS остаётся валидным.
 *
 * Гейт держит три правила. Первые два знают ровно про те два композабла,
 * которые собирают `var()` (`composables/internal/overlayStack.ts`); третье
 * ловит любой новый источник, о котором гейт ещё не знает.
 */

const pkgDir = process.cwd()
const componentsDir = resolve(pkgDir, 'src/components')

/** Имена всех токенов пакета БЕЗ префикса `--`. */
const knownTokens = new Set(
  [...grFoundationTokens, ...grDerivedTokens, ...grThemeTokens].map(token => token.name.replace(/^--/, '')),
)

/** Дефолты композаблов — источник имени, когда компонент его не передаёт. */
const FLOATING_DEFAULT = 'gr-z-dropdown'
/** Ветка `calc(var(--gr-z-modal) + N)` в `floatingLayerZIndex`. */
const FLOATING_NESTED_IN_MODAL = 'gr-z-modal'
/** Дефолт `modalLayerZIndex`. */
const MODAL_DEFAULT = 'gr-z-modal'

/** Комментарии выброшены: закомментированный вызов требованием быть не должен. */
function sourceOf(component: string): string {
  return componentSourceFiles(resolve(componentsDir, component))
    .map(file => readFileSync(file, 'utf8'))
    .join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

function declaredOf(component: string): string[] {
  const config = granularityComponentConfigs[component as keyof typeof granularityComponentConfigs]
  return [...(config?.dynamicTokens ?? [])]
}

/** Имя, переданное композаблу параметром `zIndexVar`, если оно там литерал. */
function passedZIndexVar(source: string): string | undefined {
  return source.match(/zIndexVar:\s*'--([\w-]+)'/)?.[1]
}

describe('dynamicTokens: компоненты, зовущие useFloating', () => {
  const users = publicComponents.filter(name => /\buseFloating\(/.test(sourceOf(name)))

  it('такие компоненты в пакете есть — иначе гейт проверяет пустоту', () => {
    expect(users.length).toBeGreaterThan(0)
  })

  it.each(users)('%s объявляет свой слой и слой модалки', (component) => {
    const source = sourceOf(component)
    const declared = declaredOf(component)
    const own = passedZIndexVar(source) ?? FLOATING_DEFAULT

    // Собственный слой панели: имя уходит в `floatingLayerZIndex` параметром.
    expect(declared).toContain(own)
    // Панель, открытая ВНУТРИ модалки, встаёт над ней через
    // `calc(var(--gr-z-modal) + N)` — этот токен читают все, кто зовёт композабл.
    expect(declared).toContain(FLOATING_NESTED_IN_MODAL)
  })
})

describe('dynamicTokens: компоненты, зовущие useModalOverlay', () => {
  const users = publicComponents.filter(name => /\buseModalOverlay\(/.test(sourceOf(name)))

  it('такие компоненты в пакете есть', () => {
    expect(users.length).toBeGreaterThan(0)
  })

  it.each(users)('%s объявляет слой модалки', (component) => {
    expect(declaredOf(component)).toContain(MODAL_DEFAULT)
  })
})

/**
 * Компоненты, которые собирают `var()` из имени, пришедшего ОТ ПРИЛОЖЕНИЯ.
 *
 * Объявлять им нечего: имя произвольное, оно принадлежит потребителю, и
 * держать его — его же забота (`pruneTokens.keep`). Собственный слой у таких
 * компонентов задан статическим классом и виден скану обычным порядком.
 *
 * Список проверяется на протухание: запись, переставшая собирать `var()`,
 * обязана уйти отсюда.
 */
const APP_SUPPLIED_NAME: Record<string, string> = {
  // Проп `zIndexVar` документирован как escape-hatch мимо `--gr-z-loading`:
  // приложение подменяет слой своей переменной. Свой слой — статический
  // `z-[var(--gr-z-loading)]` в `grLoadingStyles.ts`.
  GrLoading: 'zIndexVar — escape-hatch приложения мимо --gr-z-loading',
}

function assemblesVar(source: string): boolean {
  return source.includes('var(${') || /['"`]var\(['"`]\s*\+/.test(source)
}

describe('dynamicTokens: собственная сборка var() в компоненте', () => {
  it('компонент, собирающий var() сам, объявляет хоть что-то', () => {
    // Третье правило ловит источник, о котором гейт ещё не знает: не
    // `overlayStack`, а что-то новое. Конкретное имя здесь не вывести —
    // требуем непустое объявление.
    const offenders = publicComponents.filter(name => (
      assemblesVar(sourceOf(name))
      && declaredOf(name).length === 0
      && !(name in APP_SUPPLIED_NAME)
    ))

    expect(offenders).toEqual([])
  })

  it('список исключений не протух', () => {
    const stale = Object.keys(APP_SUPPLIED_NAME).filter(name => !assemblesVar(sourceOf(name)))
    expect(stale).toEqual([])
  })
})

describe('dynamicTokens: объявления не протухли', () => {
  it('каждое объявленное имя существует среди токенов пакета', () => {
    // Опечатка либо строка, оставшаяся после того, как компонент перестал
    // собирать имя в рантайме. Само по себе ничего не ломает — потому и
    // гниёт незамеченным.
    const unknown: string[] = []
    for (const component of publicComponents) {
      for (const token of declaredOf(component)) {
        if (!token.endsWith('*') && !knownTokens.has(token))
          unknown.push(`${component}: --${token}`)
      }
    }

    expect(unknown).toEqual([])
  })

  it('шкала слоёв объявлена хоть кем-то — иначе обрезка снесёт её целиком', () => {
    const declared = new Set(publicComponents.flatMap(declaredOf))
    expect([...declared].filter(t => t.startsWith('gr-z-')).sort())
      .toEqual(['gr-z-dropdown', 'gr-z-modal', 'gr-z-tooltip'])
  })
})
