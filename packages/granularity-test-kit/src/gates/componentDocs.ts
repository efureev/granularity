import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'

import { describe, expect, it } from 'vitest'

/** Секции, без которых компонент невозможно выбрать, не прочитав его целиком. */
export const REQUIRED_DOC_SECTIONS = ['Когда брать', 'Когда взять другое'] as const

/**
 * Обороты, которыми страница-заготовка маскируется под написанную.
 * Каждый — из реальных заготовок, а не выдуман.
 */
const STOP_PHRASES = [
  'TODO',
  'FIXME',
  'будет описано',
  'будет дополнено',
  'описание появится',
  'универсальный компонент для',
  'Lorem ipsum',
]

/**
 * Первая колонка, по которой таблица **может** оказаться перечнем API.
 * Сама по себе она ничего не запрещает: `| Слот | Что заменяет |` — это
 * матрица поведения, и таких таблиц на страницах пакета большинство.
 */
const API_TABLE_SUBJECTS = [
  'проп',
  'пропс',
  'свойство',
  'событие',
  'слот',
  'метод',
  'prop',
  'props',
  'property',
  'event',
  'slot',
  'method',
]

/**
 * Колонка типа — подпись именно **референса**, а не разбора: тип приходит из
 * сигнатуры, руками его переписывают только при попытке продублировать
 * генератор.
 */
const API_TABLE_TYPE_COLUMNS = ['тип', 'type', 'сигнатура', 'signature']

/** Столько строк с API-подлежащим в первой колонке — это уже перечень. */
const API_TABLE_ROW_LIMIT = 8

export interface ComponentDocsGateOptions {
  /** Корень пакета; по умолчанию — cwd, из которого запущен vitest. */
  pkgDir?: string
  /** Директория страниц компонентов относительно корня пакета. */
  docsDir?: string
  /** Индекс, в котором имя компонента обязано быть ссылкой на его страницу. */
  indexPath?: string
  /**
   * Обязательные секции. Пустой массив отключает проверку содержания и
   * оставляет только проверки существования — режим пакета, который ещё
   * переводит страницы на новый формат.
   */
  requiredSections?: readonly string[]
  /**
   * Компоненты, у которых в экосистеме нет соседа, и `Когда взять другое`
   * поэтому не содержит ссылок. Ключ — имя компонента, значение — причина:
   * молчаливое исключение через год никто не сможет объяснить.
   */
  redirectExempt?: Readonly<Record<string, string>>
}

export interface DocSection {
  title: string
  body: string
}

/** Текст без markdown-разметки — для оценки того, написано ли что-то по существу. */
export function significantText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_|#>-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function splitSections(markdown: string): DocSection[] {
  const sections: DocSection[] = []
  let current: DocSection | null = null
  let insideFence = false

  for (const line of markdown.split('\n')) {
    if (line.startsWith('```'))
      insideFence = !insideFence

    const heading = insideFence ? null : /^## (.*)$/.exec(line)
    const title = heading?.[1]?.trim()

    if (title) {
      const section: DocSection = { title, body: '' }
      current = section
      sections.push(section)
      continue
    }

    if (current)
      current.body += `${line}\n`
  }

  return sections
}

/** Абзац назначения: первый непустой блок после H1, не заголовок и не фенс. */
export function leadParagraph(markdown: string): string | null {
  const lines = markdown.split('\n')
  const start = lines.findIndex(line => line.startsWith('# '))

  if (start === -1)
    return null

  const paragraph: string[] = []

  for (const line of lines.slice(start + 1)) {
    if (!line.trim()) {
      if (paragraph.length)
        break

      continue
    }

    if (!paragraph.length && (line.startsWith('#') || line.startsWith('```') || line.startsWith('|')))
      return null

    paragraph.push(line)
  }

  return paragraph.length ? paragraph.join(' ') : null
}

export function markdownLinks(markdown: string): string[] {
  return [...markdown.matchAll(/\]\(([^)]+)\)/g)]
    .map(match => match[1])
    .filter((target): target is string => target !== undefined)
}

export interface MarkdownTable {
  header: string[]
  rowCount: number
}

export function markdownTables(markdown: string): MarkdownTable[] {
  const lines = markdown.split('\n')
  const tables: MarkdownTable[] = []

  const cells = (line: string): string[] => line
    .split('|')
    .slice(1, -1)
    .map(cell => cell.trim().replace(/[`*]/g, '').toLowerCase())

  for (let index = 0; index < lines.length - 1; index += 1) {
    const header = lines[index]
    const delimiter = lines[index + 1]

    if (header === undefined || delimiter === undefined)
      continue

    if (!header.trim().startsWith('|') || !/^\s*\|[\s|:-]+\|\s*$/.test(delimiter))
      continue

    let rowCount = 0

    while (lines[index + 2 + rowCount]?.trim().startsWith('|'))
      rowCount += 1

    tables.push({ header: cells(header), rowCount })
    index += rowCount + 1
  }

  return tables
}

/**
 * Таблица — рукописный перечень API, если её подлежащее это проп, событие,
 * слот или метод **и** при этом либо есть колонка типа, либо строк столько,
 * что перечислено уже всё.
 *
 * Разбор двух-трёх пропов таблицей — нормальный приём страниц пакета
 * (`| Проп | Что делает |` у `GrTree`), и запрещать его нельзя: запрет
 * касается дубля генератора, а не табличной формы.
 */
export function looksLikeApiReference(table: MarkdownTable): boolean {
  const subject = table.header[0]

  if (subject === undefined || !API_TABLE_SUBJECTS.includes(subject))
    return false

  return table.header.slice(1).some(cell => API_TABLE_TYPE_COLUMNS.includes(cell))
    || table.rowCount >= API_TABLE_ROW_LIMIT
}

/**
 * Гейт на страницу компонента.
 *
 * Держит **форму**: страница есть у каждого компонента реестра, сирот нет,
 * обе обязательные секции на месте и непусты, редиректы ведут в живые файлы,
 * имя стоит ссылкой в индексе, рукописного перечня API на странице нет.
 *
 * Смысла утверждений он не видит и видеть не может: сверка страницы с кодом —
 * шаг ревью (`.claude/rules/component-docs.md`), а не тест. Задача гейта в
 * другом — не дать компоненту появиться без страницы и не дать странице
 * ссылаться в пустоту, потому что оба отказа проходят CI молча.
 */
export function defineComponentDocsGate(options: ComponentDocsGateOptions = {}): void {
  const pkgDir = options.pkgDir ?? process.cwd()
  const docsDir = resolve(pkgDir, options.docsDir ?? 'docs/components')
  const indexPath = resolve(pkgDir, options.indexPath ?? 'docs/components.md')
  const requiredSections = options.requiredSections ?? REQUIRED_DOC_SECTIONS
  const redirectExempt = options.redirectExempt ?? {}

  /** Публичный компонент = директория с `index.ts` и `config.ts`. */
  const publicComponents = readdirSync(resolve(pkgDir, 'src/components'), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(name => (
      existsSync(resolve(pkgDir, 'src/components', name, 'index.ts'))
      && existsSync(resolve(pkgDir, 'src/components', name, 'config.ts'))
    ))
    .sort()

  const pagePath = (component: string): string => resolve(docsDir, `${component}.md`)
  const readPage = (component: string): string => readFileSync(pagePath(component), 'utf8')

  const documented = publicComponents.filter(component => existsSync(pagePath(component)))

  describe('страницы компонентов', () => {
    it('у каждого публичного компонента есть страница', () => {
      expect(documented).toEqual(publicComponents)
    })

    it('в каталоге страниц нет сирот', () => {
      const pages = existsSync(docsDir)
        ? readdirSync(docsDir).filter(name => name.endsWith('.md')).map(name => name.slice(0, -3)).sort()
        : []

      // Обратный случай: компонент удалили, страница осталась и продолжает
      // рассказывать про то, чего в пакете нет.
      expect(pages).toEqual(publicComponents)
    })

    it('имя каждого компонента стоит ссылкой в индексе', () => {
      const index = readFileSync(indexPath, 'utf8')
      const missing = publicComponents.filter(component => !index.includes(`(./components/${component}.md)`))

      expect(missing, 'нет ссылки в индексе').toEqual([])
    })

    describe.each(documented.map(component => [component] as const))('%s', (component) => {
      const markdown = readPage(component)
      const sections = splitSections(markdown)
      const lead = leadParagraph(markdown)

      it('H1 начинается с имени компонента', () => {
        // Не строгое равенство: страница вправе уточнить предмет
        // (`# GrDialogService (useDialogService)`). Ловится другое — copy-paste
        // чужого заголовка и имя в бэктиках: ни то ни другое не начинается
        // с самого имени.
        const h1 = markdown.split('\n')[0] ?? ''

        expect(h1.startsWith(`# ${component}`), `H1 должен начинаться с «# ${component}», а не «${h1}»`).toBe(true)
      })

      it('под H1 — абзац назначения', () => {
        // Страница-заготовка обычно начинается сразу с заголовка или примера:
        // назначение в ней просто не написано.
        expect(lead, 'первый блок после H1 должен быть абзацем текста').not.toBeNull()
      })

      it('нет рукописного перечня API', () => {
        const offenders = markdownTables(markdown)
          .filter(looksLikeApiReference)
          .map(table => `${table.header.join(' | ')} (${table.rowCount} строк)`)

        expect(offenders, 'перечень API генерируется, руками его писать нельзя').toEqual([])
      })

      it('нет заглушек', () => {
        const found = STOP_PHRASES.filter(phrase => markdown.toLowerCase().includes(phrase.toLowerCase()))

        expect(found).toEqual([])
      })

      it('все ссылки страницы ведут в существующие файлы', () => {
        const broken = markdownLinks(markdown)
          .filter(link => !/^[a-z]+:/i.test(link) && !link.startsWith('#'))
          .map(link => link.split('#')[0] ?? '')
          .filter(link => link.length > 0)
          .filter(link => !existsSync(resolve(dirname(pagePath(component)), link)))

        expect([...new Set(broken)]).toEqual([])
      })

      it.each(requiredSections.map(title => [title] as const))('есть секция «%s»', (title) => {
        expect(sections.map(section => section.title)).toContain(title)
      })

      it.runIf(requiredSections.includes('Когда брать'))('«Когда брать» написана по существу', () => {
        const section = sections.find(item => item.title === 'Когда брать')!
        const bullets = section.body.split('\n').filter(line => /^\s*-\s+\S/.test(line))
        const text = significantText(section.body)

        expect(bullets.length, 'нужно 3–5 сценариев; меньше двух — это не выбор').toBeGreaterThanOrEqual(2)
        expect(text.length, 'секция слишком короткая, чтобы что-то объяснить').toBeGreaterThanOrEqual(120)
        expect(text, 'секция дословно повторяет абзац назначения').not.toBe(significantText(lead ?? ''))
      })

      it.runIf(requiredSections.includes('Когда взять другое'))('«Когда взять другое» ведёт к соседям', () => {
        const section = sections.find(item => item.title === 'Когда взять другое')!
        const links = markdownLinks(section.body).filter(link => link.endsWith('.md'))
        const reason = redirectExempt[component]

        if (reason) {
          expect(reason.length, 'исключение обязано объясняться, а не молчать').toBeGreaterThan(10)
          expect(significantText(section.body).length).toBeGreaterThanOrEqual(40)
          return
        }

        expect(links.length, 'нужна хотя бы одна ссылка на соседний компонент').toBeGreaterThanOrEqual(1)
      })
    })
  })
}
