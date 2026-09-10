import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const dir = resolve(__dirname, '..')

/**
 * Поверхность сервиса и окна обязана совпадать.
 *
 * `DialogPromptOptions` — рукописный повтор пропов `GrPromptDialog`, а связка в
 * `GrDialogServiceItem.vue` перечисляет их по одному. Пока это держалось только
 * вниманием, поле опций объявляли, а привязать забывали: ровно так `autocomplete`
 * и не доехал до поля, и обойти это потребителю было нечем — окно живёт в
 * портале, до вложенного `GrInput` не дотянуться.
 */
function promptOptionNames(): string[] {
  const source = readFileSync(resolve(dir, 'types.ts'), 'utf-8')
  const start = source.indexOf('export interface DialogPromptOptions')
  const end = source.indexOf('\n}', start)

  expect(start, 'интерфейс DialogPromptOptions не найден').toBeGreaterThan(-1)

  return [...source.slice(start, end).matchAll(/^\s{2}(\w+)\??:/gm)].map(match => match[1])
}

function forwardedNames(): Set<string> {
  const source = readFileSync(resolve(dir, 'GrDialogServiceItem.vue'), 'utf-8')

  return new Set([...source.matchAll(/promptOptions\.(\w+)/g)].map(match => match[1]))
}

/**
 * Поля, которые до окна доезжают не пропом. Список закрытый: он же не даёт
 * «забыл привязать» спрятаться за «ну это особый случай».
 *
 * Унаследованного из `DialogBaseOptions` здесь нет — разбор читает тело самого
 * `DialogPromptOptions`, и общие поля (`title`, `description`) в него не попадают.
 */
const FORWARDED_OTHERWISE: Readonly<Record<string, string>> = {
  // Начальное значение живёт в `v-model:value`, а не в одноимённом пропе.
  value: 'v-model:value',
  // Колбэк подтверждения обрабатывает сервис, окну он не передаётся.
  onConfirm: 'обрабатывает сервис',
}

describe('поверхность prompt: сервис и окно', () => {
  it('каждое поле DialogPromptOptions доезжает до окна', () => {
    const forwarded = forwardedNames()

    const lost = promptOptionNames()
      .filter(name => !forwarded.has(name) && !(name in FORWARDED_OTHERWISE))

    expect(lost, 'объявлены в опциях, но не привязаны в GrDialogServiceItem.vue').toEqual([])
  })

  it('исключения не протухли — каждое всё ещё объявлено в опциях', () => {
    const declared = new Set(promptOptionNames())
    const stale = Object.keys(FORWARDED_OTHERWISE).filter(name => !declared.has(name))

    expect(stale, 'исключение есть, а поля опций нет').toEqual([])
  })
})
