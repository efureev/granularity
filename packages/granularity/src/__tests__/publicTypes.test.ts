import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * Гейт публичных типов компонента.
 *
 * Дефект, ради которого написан: типы эмитов не выходили наружу ни у одного
 * компонента, тип инстанса — ровно у одного, а именованного интерфейса пропсов
 * не было у двенадцати SFC, включая `GrButton` и `GrInput`. Обёртку вида
 * `defineProps<GrInputProps & { … }>` потребитель написать не мог, а
 * `InstanceType<typeof GrSelect>` у дженериков не типизируется в принципе.
 *
 * Правило: что компонент объявил внутри, то и обязан отдать из своей бочки.
 */

const componentsDir = resolve(process.cwd(), 'src/components')

/**
 * Осознанные исключения. Список закрытый: новый компонент в него не попадает
 * сам собой, а добавляется руками вместе с причиной.
 */
const EXCEPTIONS: Record<string, string> = {
  // Инстанс написан руками и параметризован (`GrTreeInstance<T>`); выводимый
  // тип генериком не будет, и замена сломала бы `GrTreeInstance<MyNode>`.
  'GrTree/GrTreeInstance': 'публичный генерик-тип, объявлен явно в grTreeTypes.ts',
}

type Sfc = {
  dir: string
  name: string
  source: string
  index: string
}

/** SFC, которые бочка компонента действительно экспортирует наружу. */
function exportedSfcs(): Sfc[] {
  const result: Sfc[] = []

  for (const dir of readdirSync(componentsDir)) {
    if (!dir.startsWith('Gr')) continue

    const indexPath = resolve(componentsDir, dir, 'index.ts')
    let index: string
    try {
      index = readFileSync(indexPath, 'utf-8')
    }
    catch {
      continue
    }

    for (const file of readdirSync(resolve(componentsDir, dir))) {
      if (!file.endsWith('.vue')) continue

      const name = file.replace('.vue', '')
      const exported = index.includes(`as ${name} } from './${name}.vue'`)
        || index.includes(`export { default } from './${name}.vue'`)
      if (!exported) continue

      result.push({
        dir,
        name,
        source: readFileSync(resolve(componentsDir, dir, file), 'utf-8'),
        index,
      })
    }
  }

  return result
}

const sfcs = exportedSfcs()

const CONTRACT = [
  { macro: 'defineProps<', suffix: 'Props' },
  { macro: 'defineEmits<', suffix: 'Emits' },
  { macro: 'defineExpose', suffix: 'Instance' },
] as const

describe('публичные типы компонентов', () => {
  it('экспортируемые SFC вообще найдены — иначе гейт молчал бы впустую', () => {
    expect(sfcs.length).toBeGreaterThan(60)
  })

  for (const { macro, suffix } of CONTRACT) {
    const users = sfcs.filter(sfc => sfc.source.includes(macro))

    it.each(users.map(sfc => [`${sfc.dir}/${sfc.name}`, sfc] as const))(
      `%s отдаёт тип ${suffix} из своей бочки`,
      (_id, sfc) => {
        const typeName = `${sfc.name}${suffix}`
        if (EXCEPTIONS[`${sfc.dir}/${typeName}`]) return

        expect(sfc.index).toContain(typeName)
      },
    )
  }
})
