import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { componentDirs } from '../sources'

/** Объявление эмита вместе с именем его параметра: `(e: 'name', …): void`. */
const EMIT_DECLARATION = /\(\s*(e|event)\s*:\s*'([^']+)'/g

export interface EmitNamingGateOptions {
  /** Директория компонентов; по умолчанию — `<cwd>/src/components`. */
  componentsDir?: string
  /**
   * Префикс имени компонента. По умолчанию `Gr` — обратная совместимость с
   * ядром; companion-пакету со своей приставкой этого хватает, чтобы фабрика
   * увидела его компоненты вместо нуля.
   */
  prefix?: string
}

export interface EmitDeclaration {
  /** Путь от директории компонентов: `GrChip/GrChip.vue`. */
  path: string
  param: string
  name: string
}

/**
 * Объявления эмитов пакета. Отдельно от гейта, чтобы разбор можно было
 * проверить прямо, не подбирая компонент, который случайно его покрывает.
 */
export function collectEmitDeclarations(componentsDir: string, prefix = 'Gr'): EmitDeclaration[] {
  return componentDirs(componentsDir, prefix).flatMap(name => readdirSync(resolve(componentsDir, name))
    .filter(file => file.endsWith('.vue') && !file.includes('.test.'))
    .flatMap((file) => {
      const source = readFileSync(resolve(componentsDir, name, file), 'utf8')

      return [...source.matchAll(EMIT_DECLARATION)].map(match => ({
        path: `${name}/${file}`,
        param: match[1]!,
        name: match[2]!,
      }))
    }))
}

/**
 * Гейт нейминга эмитов.
 *
 * В пакете сосуществовали два регистра: эмиты camelCase (`nodeClick`,
 * `stateChange`, …) и kebab-case (`sort-change`). В шаблоне это разные события
 * для читателя, а IDE не подсказывает.
 *
 * Канон — camelCase, и не только по большинству. Проверено поведением Vue:
 * шаблонный `@sort-change` компилируется в проп `onSortChange`, который находят
 * **оба** объявления, а `onSort-change` — только kebab-объявление. То есть
 * camelCase строго шире: он принимает и `@sort-change`, и `@sortChange`.
 *
 * Побочный вывод: «переходный период с двойным эмитом» здесь навредил бы — оба
 * имени резолвятся в один и тот же `onSortChange`, и обработчик потребителя
 * вызвался бы дважды.
 *
 * `update:*` — отдельный случай (`v-model`), двоеточие в них обязательно.
 *
 * Фабрикой, а не копией в каждом пакете: экземпляры charts и dashboard были
 * побайтово одинаковы, версия ядра отставала на два символа, а у chrono гейта
 * не было вовсе — и `defineGateCoverage` этого не замечал.
 */
export function defineEmitNamingGate(options: EmitNamingGateOptions = {}): void {
  const componentsDir = options.componentsDir ?? resolve(process.cwd(), 'src/components')
  const declarations = collectEmitDeclarations(componentsDir, options.prefix)

  describe('нейминг эмитов', () => {
    it('ни один эмит не объявлен в kebab-case', () => {
      const offenders = declarations
        .filter(({ name }) => !name.startsWith('update:') && name.includes('-'))
        .map(({ path, name }) => `${path}: '${name}'`)

      expect(offenders, offenders.join('\n')).toEqual([])
    })

    it('составные имена — camelCase, а не PascalCase и не snake_case', () => {
      const offenders = declarations
        .filter(({ name }) => !name.startsWith('update:'))
        .filter(({ name }) => /^[A-Z]/.test(name) || name.includes('_'))
        .map(({ path, name }) => `${path}: '${name}'`)

      expect(offenders, offenders.join('\n')).toEqual([])
    })

    it('параметр объявления назван `e`, а не `event`', () => {
      // Имя параметра наружу не видно, но в пакете сосуществовали оба, и
      // читатель соседнего компонента каждый раз решал, есть ли разница.
      // Форматирующий линтер такое не ловит: это не форматирование.
      const offenders = declarations
        .filter(({ param }) => param !== 'e')
        .map(({ path, param, name }) => `${path}: (${param}: '${name}')`)

      expect(offenders, offenders.join('\n')).toEqual([])
    })

    it('разбор нашёл объявления — регулярка не молчит', () => {
      // Сломанное выражение иначе зеленит все три проверки разом.
      expect(declarations.length, 'ни одного объявления эмита не найдено').toBeGreaterThan(0)
    })
  })
}
