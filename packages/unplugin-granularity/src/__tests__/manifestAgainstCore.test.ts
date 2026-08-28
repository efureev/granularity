import type { ComponentResolverObject } from 'unplugin-vue-components/types'
import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'

import { GRANULARITY_DIRECTIVES, GRANULARITY_PACKAGE_NAME } from '../manifest'
import { createGranularResolver } from '../resolver'

/**
 * Гейт дрейфа: whitelist резолвера против того, что ядро правда отгружает.
 *
 * Манифест держится руками — так решено ради детерминизма и нулевого I/O в
 * рантайме резолвера, и это верно. Плата за решение в том, что расхождение с
 * ядром ничем не наказывается: собственные тесты пакета сверяют вывод резолвера
 * с такими же литералами, какие в него зашиты, и остаются зелёными, когда
 * директиву в ядре переименовали, а компонентный subpath перестал
 * существовать. У компонентных пакетов эту роль играет `granular doctor`;
 * провайдера у резолвера нет, и доктору тут проверять нечего.
 *
 * Источник истины — `exports` ядра, а не его исходники: резолвер выдаёт
 * потребителю строку импорта, и живёт она ровно до тех пор, пока такой ключ
 * объявлен. Неопубликованный subpath — это `ERR_PACKAGE_PATH_NOT_EXPORTED` на
 * сборке потребителя, а не у нас.
 */

interface PackageManifest {
  exports: Record<string, unknown>
}

const require = createRequire(import.meta.url)
const core = require('@feugene/granularity/package.json') as PackageManifest

const CORE_KEYS = Object.keys(core.exports)

/**
 * Модули `directives/`, у которых нет своей директивы. `globalDirectives` —
 * сборка «зарегистрировать всё разом»: в шаблоне такого имени не бывает, и
 * резолверу оно не нужно.
 */
const NOT_A_DIRECTIVE = new Set(['globalDirectives'])

function resolveWith(resolver: ComponentResolverObject, name: string): { from?: string } | undefined {
  return (resolver.resolve as (name: string) => { from?: string } | undefined)(name)
}

const coreDirectiveModules = CORE_KEYS
  .filter(key => key.startsWith('./directives/'))
  .map(key => key.slice('./directives/'.length))
  .filter(module => !NOT_A_DIRECTIVE.has(module))

const coreComponents = CORE_KEYS
  .filter(key => /^\.\/components\/[A-Za-z]+$/.test(key))
  .map(key => key.slice('./components/'.length))

describe('манифест директив против exports ядра', () => {
  it.each(Object.entries(GRANULARITY_DIRECTIVES))('%s указывает на живой subpath', (_name, descriptor) => {
    expect(CORE_KEYS).toContain(`./directives/${descriptor.module}`)
  })

  it.each(Object.entries(GRANULARITY_DIRECTIVES))('%s правда экспортирует свою директиву', async (_name, descriptor) => {
    const module = await import(`${GRANULARITY_PACKAGE_NAME}/directives/${descriptor.module}`) as Record<string, unknown>

    expect(Object.keys(module)).toContain(descriptor.named)
  })

  it('ядро не завело директиву, о которой резолвер не знает', () => {
    const known = new Set(Object.values(GRANULARITY_DIRECTIVES).map(descriptor => descriptor.module))

    expect(coreDirectiveModules.filter(module => !known.has(module))).toEqual([])
  })

  it('в ядре есть директивы — иначе гейт зелен от пустоты, а не от порядка', () => {
    expect(coreDirectiveModules.length).toBeGreaterThan(0)
  })
})

describe('резолвинг компонентов против exports ядра', () => {
  const resolver = createGranularResolver({ packageName: GRANULARITY_PACKAGE_NAME, prefix: 'Gr' })

  it('каждый компонентный subpath ядра резолвится в него же', () => {
    const broken = coreComponents
      .map(name => ({ name, from: resolveWith(resolver, name)?.from }))
      .filter(({ from }) => !from || !CORE_KEYS.includes(from.replace(GRANULARITY_PACKAGE_NAME, '.')))

    expect(broken).toEqual([])
  })

  it('компоненты в ядре есть', () => {
    expect(coreComponents.length).toBeGreaterThan(0)
  })
})

describe('side-effect на CSS компонента', () => {
  /**
   * Опция `importStyle` выключена по умолчанию именно потому, что ядро таких
   * subpath'ов не публикует, а включённая давала
   * `ERR_PACKAGE_PATH_NOT_EXPORTED` на каждом компоненте. Гейт держит этот
   * довод привязанным к факту: начнёт ядро публиковать по-компонентный CSS —
   * тест упадёт, и умолчание надо будет пересмотреть, а не оставлять по
   * инерции.
   */
  it('ядро по-прежнему не публикует `components/<Name>/styles.css`', () => {
    expect(CORE_KEYS.filter(key => /^\.\/components\/[A-Za-z]+\/styles\.css$/.test(key))).toEqual([])
  })
})
