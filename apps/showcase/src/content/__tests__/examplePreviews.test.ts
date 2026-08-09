import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { describe, expect, it } from 'vitest'

import { showcaseComponentEntities } from '../../app/showcase'
import { getShowcaseComponentDoc } from '../componentDocs'
import { companionPackages } from '../companion/companionPackages'
import { demoPathByPreviewKey } from '../../demos/registry'

const demosRoot = fileURLToPath(new URL('../../demos/', import.meta.url))

function demoSource(path: string): string {
  return readFileSync(`${demosRoot}${path}`, 'utf8')
}

const componentExamples = showcaseComponentEntities
  .flatMap(entity => getShowcaseComponentDoc(entity).examples.map(example => ({ entity: entity.name, example })))
  // Заглушки компонентов без своих примеров живут с готовым `code` и демо не имеют.
  .filter(({ example }) => example.code === undefined)

const companionExamples = companionPackages
  .flatMap(pkg => pkg.components.flatMap(component => component.examples.map(example => ({
    entity: component.name,
    example,
  }))))

const allExamples = [...componentExamples, ...companionExamples]

/**
 * Гейт «сниппет и есть демо».
 *
 * Раньше `code` был копией демо-файла, и 102 копии из 253 разошлись с
 * оригиналом: под превью показывался код, которого это превью не рисовало.
 * Копия удалена — исходник читается из того же файла через `?raw`
 * (`src/demos/registry.ts`), — и этот гейт стережёт то, что от контракта
 * осталось: у примера есть ключ, ключ ведёт в существующий файл, реестр не
 * протух.
 */
describe('превью и сниппет — один файл', () => {
  it('у каждого живого примера есть `previewKey`', () => {
    const orphans = allExamples
      .filter(({ example }) => !example.previewKey)
      .map(({ entity, example }) => `${entity}/${example.id}`)

    expect(orphans, 'без ключа примеру неоткуда взять ни превью, ни сниппет').toEqual([])
  })

  it('каждый `previewKey` ведёт в существующий демо-файл', () => {
    const broken = allExamples
      .filter(({ example }) => {
        const path = demoPathByPreviewKey[example.previewKey as keyof typeof demoPathByPreviewKey]
        return !path || !existsSync(`${demosRoot}${path}`)
      })
      .map(({ entity, example }) => `${entity}/${example.id}: ${example.previewKey}`)

    expect(broken, 'добавь запись в `src/demos/registry.ts`').toEqual([])
  })

  it('реестр не протух: у каждой записи есть свой пример', () => {
    const used = new Set(allExamples.map(({ example }) => example.previewKey))
    const unused = Object.keys(demoPathByPreviewKey).filter(key => !used.has(key))

    expect(unused, 'ключ никем не используется — убери его или подключи демо к примеру').toEqual([])
  })

  it('у примеров с демо нет своего `code`', () => {
    const withCode = companionExamples
      .filter(({ example }) => 'code' in example)
      .map(({ entity, example }) => `${entity}/${example.id}`)

    expect(withCode, 'сниппет читается из демо; ручная копия неизбежно разойдётся').toEqual([])
  })

  /**
   * Демо показывает работу компонента, а не работу витрины с локалями:
   * `t('components.GrSwitch.sizes.small')` в сниппете — код, который читатель
   * не может скопировать к себе. Настоящие «про локаль» демо обходятся без
   * этого: язык там либо данные компонента, либо проп `locale`.
   */
  it('в демо, попадающих в сниппет, нет i18n-обвязки витрины', () => {
    const offenders = Object.entries(demoPathByPreviewKey)
      .filter(([, path]) => demoSource(path).includes('useFintI18n'))
      .map(([key]) => key)

    expect(offenders, 'подписи демо — литералами; локаль показывают только демо про локаль').toEqual([])
  })
})
