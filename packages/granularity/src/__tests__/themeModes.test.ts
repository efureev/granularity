import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * Режимы — открытый набор темы, а не пара `light`/`dark`.
 *
 * Режим включается парой `data-theme="<тема>-<режим>"`, классов `.light`/`.dark`
 * granum не выводит, а режимов у темы может быть больше двух. Поэтому в `src`
 * нет ни закрытого типа `'light' | 'dark'` (тип режима — `GrModeName`, набор —
 * из манифеста или данных темы), ни селекторов по голому имени режима: такой
 * селектор не совпадает ни с одной парой и молча не срабатывает.
 */

const SRC = resolve(process.cwd(), 'src')
const SELF = 'src/__tests__/themeModes.test.ts'

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory())
      return sources(path)
    return /\.(?:ts|vue|css)$/.test(entry.name) ? [path] : []
  })
}

const RULES: { name: string, pattern: RegExp }[] = [
  { name: 'закрытый тип режима', pattern: /(['"])(?:light|dark)\1\s*\|\s*(['"])(?:light|dark)\2/ },
  { name: 'селектор по голому имени режима', pattern: /\[data-theme\s*[~|^$*]?=\s*(['"]?)(?:light|dark)\1\s*\]/ },
  // Обратные кавычки не в счёт: `.dark` в комментарии — упоминание, а не селектор.
  { name: 'класс режима в селекторе', pattern: /(?:^|['"\s,>+~(])\.(?:light|dark)(?=\s*[{,:.[>+~)'"]|\s*$)/m },
  { name: 'класс режима на элементе', pattern: /classList\.\w+\(\s*(['"])(?:light|dark)\1/ },
]

function violations(text: string): string[] {
  return text.split('\n').flatMap((line, index) =>
    RULES.filter(rule => rule.pattern.test(line)).map(rule => `${index + 1}: ${rule.name} — ${line.trim()}`))
}

describe('режимы без закрытого набора light/dark', () => {
  it('в src нет `\'light\' | \'dark\'`, селекторов голого режима и классов .light/.dark', () => {
    const found = sources(SRC)
      .map(path => relative(process.cwd(), path))
      .filter(path => path !== SELF)
      .flatMap(path => violations(readFileSync(path, 'utf8')).map(line => `${path}:${line}`))

    expect(found).toEqual([])
  })

  it('правила ловят каждое нарушение и не трогают пары и свойства', () => {
    expect(violations('type Mode = \'light\' | \'dark\'')).toHaveLength(1)
    expect(violations('[data-theme=\'dark\'] .x { color: red }')).toHaveLength(1)
    expect(violations('.dark .gr-card { color: red }')).toHaveLength(1)
    expect(violations('document.querySelector(\'.dark\')')).toHaveLength(1)
    expect(violations('root.classList.add(\'dark\')')).toHaveLength(1)

    expect(violations('[data-theme="slate-dark"] .x { color: red }')).toEqual([])
    expect(violations('const dark = props.dark ?? group!.dark.value')).toEqual([])
    expect(violations('class="dark:bg-[var(--gr-bg)]"')).toEqual([])
  })
})
