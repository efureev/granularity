import { createUsageSnippet } from '../../components/doc/entityPageHelpers'

import type { ShowcaseEntityRegistryItem } from '../model'
import type {
  ShowcasePackageDocMeta,
  ShowcasePackageExampleDoc,
} from './types'

export function createReadyExamples(
  items: Array<Omit<ShowcasePackageExampleDoc, 'status'>>,
): ShowcasePackageExampleDoc[] {
  return items.map(item => ({
    ...item,
    status: 'ready',
  }))
}

export function createFallbackDoc(entity: ShowcaseEntityRegistryItem): ShowcasePackageDocMeta {
  return {
    overview: [
      `${entity.title} уже собран из публичного API пакета и доступен как самостоятельная showcase-сущность.`,
      'Для этой сущности можно использовать generated import snippet и общую package-level документацию.',
    ],
    examples: entity.examples.map(example => ({
      ...example,
      code: createUsageSnippet(entity),
      note: 'Пока используется metadata fallback. Живой preview будет добавлен в следующих итерациях showcase.',
    })),
    apiSections: entity.apiSections,
    usage: ['Начните с import snippet ниже и адаптируйте параметры под свой feature-flow.'],
    caveats: ['Проверьте ограничения конкретной package-level сущности перед использованием в production flow.'],
    integrationNotes: ['Используйте detail page как отправную точку для интеграции в showcase и продуктовый код.'],
  }
}