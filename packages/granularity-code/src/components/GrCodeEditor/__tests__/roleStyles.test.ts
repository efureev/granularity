import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { classForRole, LEZER_TAGS_BY_ROLE } from '../../../highlight/fromLezer'
import { codeTokenClass } from '../../GrCodeBlock/grCodeBlockStyles'

/**
 * Классы ролей для CodeMirror рождаются в рантайме и в файлах не встречаются
 * ни одной строкой — пресет UnoCSS их не видит и CSS для них не порождает.
 *
 * Поэтому цвет объявлен обычным CSS в `<style>` компонента, и проверять это
 * приходится по исходнику: сборка тут ничего не подскажет, а без правила
 * редактор с подключённой грамматикой остаётся одноцветным — ровно так и было
 * до 0.1.0, пока подсветку не открыли глазами.
 */
const source = readFileSync(resolve(import.meta.dirname, '../GrCodeEditor.vue'), 'utf8')
const styles = /<style>([\s\S]*?)<\/style>/.exec(source)?.[1] ?? ''

describe('цвет ролей для CodeMirror', () => {
  it('в компоненте вообще есть блок стилей', () => {
    expect(styles).not.toBe('')
  })

  it.each(Object.keys(LEZER_TAGS_BY_ROLE))('роль %s покрашена', (role) => {
    expect(styles).toContain(`.${classForRole(role as keyof typeof LEZER_TAGS_BY_ROLE)}`)
  })

  /**
   * Цвет обязан прийти из того же токена, что и у блока: редактор и блок стоят
   * на одной странице, и вторая палитра развела бы их на первом же экране.
   */
  it.each(Object.keys(LEZER_TAGS_BY_ROLE))('роль %s берёт токен блока', (role) => {
    const token = /var\((--gr-code-block-[\w-]+)/.exec(codeTokenClass[role as keyof typeof codeTokenClass])?.[1]

    expect(token, `${role}: у блока не нашлось токена`).toBeTruthy()

    const rule = styles.split('\n').find(line => line.includes(`.${classForRole(role as keyof typeof LEZER_TAGS_BY_ROLE)} `))

    expect(rule, `${role}: нет правила`).toBeTruthy()
    expect(rule).toContain(token!)
  })
})
