import type { Extension, Mark, Node } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

/**
 * Готовые схемы редактора и собранный по ним тулбар.
 *
 * Модуль чистый и не монтируется: состав схемы и соответствие «кнопка →
 * команда» проверяются без DOM. Отдельным файлом ещё и потому, что схема — это
 * **данные**: тулбар строится из этого списка, а не пишется разметкой. Напиши
 * его руками, и первая же правка схемы разойдётся с панелью молча — кнопка
 * останется, а команда за ней перестанет существовать.
 */

/** Что схема разрешает в документе. Имена — расширений TipTap. */
export type GrRichTextSchemaName = 'minimal' | 'article'

export type GrRichTextExtension = Extension | Mark | Node

/** Действие тулбара: чем рисуется, что делает, чем подписано. */
export interface GrRichTextAction {
  /** Идентификатор кнопки; он же ключ для `data-key` и для роверной навигации. */
  key: string
  /** Имя марки или узла для `editor.isActive(...)`. `null` — состояния нет. */
  active: string | null
  /** Параметры для `isActive`: заголовок первого уровня — это `heading` с `level`. */
  activeAttrs?: Record<string, unknown>
  /** Имя команды цепочки TipTap. */
  command: string
  /** Аргумент команды, если он нужен. */
  commandArgs?: Record<string, unknown>
  /** Ключ подписи; fallback совпадает с английским словарём. */
  labelKey: string
  labelFallback: string
  /** Группа тулбара: между группами ставится разделитель. */
  group: 'inline' | 'block' | 'list'
}

const INLINE_ACTIONS: GrRichTextAction[] = [
  { key: 'bold', active: 'bold', command: 'toggleBold', labelKey: 'grEditor.richText.bold', labelFallback: 'Bold', group: 'inline' },
  { key: 'italic', active: 'italic', command: 'toggleItalic', labelKey: 'grEditor.richText.italic', labelFallback: 'Italic', group: 'inline' },
  { key: 'strike', active: 'strike', command: 'toggleStrike', labelKey: 'grEditor.richText.strike', labelFallback: 'Strikethrough', group: 'inline' },
  { key: 'code', active: 'code', command: 'toggleCode', labelKey: 'grEditor.richText.code', labelFallback: 'Inline code', group: 'inline' },
]

const LIST_ACTIONS: GrRichTextAction[] = [
  { key: 'bulletList', active: 'bulletList', command: 'toggleBulletList', labelKey: 'grEditor.richText.bulletList', labelFallback: 'Bulleted list', group: 'list' },
  { key: 'orderedList', active: 'orderedList', command: 'toggleOrderedList', labelKey: 'grEditor.richText.orderedList', labelFallback: 'Numbered list', group: 'list' },
]

const BLOCK_ACTIONS: GrRichTextAction[] = [
  { key: 'heading2', active: 'heading', activeAttrs: { level: 2 }, command: 'toggleHeading', commandArgs: { level: 2 }, labelKey: 'grEditor.richText.heading2', labelFallback: 'Heading', group: 'block' },
  { key: 'heading3', active: 'heading', activeAttrs: { level: 3 }, command: 'toggleHeading', commandArgs: { level: 3 }, labelKey: 'grEditor.richText.heading3', labelFallback: 'Subheading', group: 'block' },
  { key: 'blockquote', active: 'blockquote', command: 'toggleBlockquote', labelKey: 'grEditor.richText.blockquote', labelFallback: 'Quote', group: 'block' },
  { key: 'codeBlock', active: 'codeBlock', command: 'toggleCodeBlock', labelKey: 'grEditor.richText.codeBlock', labelFallback: 'Code block', group: 'block' },
]

/**
 * Состав схем.
 *
 * `minimal` — то, что нужно комментарию и короткому описанию: начертание,
 * ссылка, список. `article` добавляет структуру: заголовки, цитату, блок кода.
 *
 * Заголовок первого уровня не даёт ни одна: `h1` на странице один и принадлежит
 * ей, а не полю ввода внутри неё. Редактор, позволяющий вставить второй, ломает
 * структуру документа у того, кто просто печатал текст.
 */
export interface GrRichTextSchema {
  /** Расширения TipTap. */
  extensions: GrRichTextExtension[]
  /** Действия тулбара в порядке показа. */
  actions: GrRichTextAction[]
}

function starterKit(options: { headings: Array<2 | 3>, blocks: boolean }): GrRichTextExtension {
  return StarterKit.configure({
    heading: options.blocks ? { levels: options.headings } : false,
    blockquote: options.blocks ? undefined : false,
    codeBlock: options.blocks ? undefined : false,
    horizontalRule: options.blocks ? undefined : false,
    // Ссылка приходит из starter-kit; открывать её кликом внутри поля ввода
    // нельзя — пользователь правит текст, а не читает его.
    link: { openOnClick: false },
  })
}

export function createSchema(name: GrRichTextSchemaName): GrRichTextSchema {
  const blocks = name === 'article'

  return {
    extensions: [starterKit({ headings: [2, 3], blocks })],
    actions: blocks
      ? [...INLINE_ACTIONS, ...BLOCK_ACTIONS, ...LIST_ACTIONS]
      : [...INLINE_ACTIONS, ...LIST_ACTIONS],
  }
}

/** Имена схем — для пропа и для тестов. */
export const GR_RICH_TEXT_SCHEMAS: readonly GrRichTextSchemaName[] = ['minimal', 'article']
