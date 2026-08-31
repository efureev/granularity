import { Annotation, Compartment, EditorState, Prec, RangeSetBuilder, type Extension } from '@codemirror/state'
import { Decoration, EditorView, ViewPlugin, keymap, lineNumbers as lineNumbersExt, placeholder as placeholderExt, type DecorationSet, type ViewUpdate } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'

import { classForRole, LEZER_TAGS_BY_ROLE } from '../../highlight/fromLezer'
import type { GrCodeLine, GrCodeRole } from '../../highlight/palette'
import type { MinimalChange } from './editorState'

/** Построчный разбор: единица — строка, потому что мост декорирует окно. */
export type GrCodeLineTokenizer = (text: string) => GrCodeLine

/**
 * **Единственный модуль пакета, знающий CodeMirror.**
 *
 * Импортируется динамически (`await import('./codemirror')`), потому что CM6 —
 * опциональный peer: пакет, взятый ради `GrCodeBlock` или `GrDiff`, не обязан
 * его ставить. Не найдётся — редактор скажет об этом в dev и покажет код без
 * правки, а не уронит приложение.
 */

/** Роли и `Compartment`-ы вынесены наружу: реконфигурация обходится без пересоздания. */
const readonlyCompartment = new Compartment()
const wrapCompartment = new Compartment()
const lineNumbersCompartment = new Compartment()
const languageCompartment = new Compartment()
const attributesCompartment = new Compartment()
const keymapCompartment = new Compartment()
const tokenizerCompartment = new Compartment()

/**
 * Раскладка клавиш.
 *
 * `indentWithTab` — только по явной просьбе: редактор в форме, из которого
 * нельзя выйти по `Tab`, это ловушка клавиатуры. Живёт в `Compartment`, потому
 * что `tabIndents` — обычный проп: сменился он — обязана смениться и раскладка,
 * а пересоздавать ради этого состояние значило бы терять курсор и историю.
 */
function keymapFor(tabIndents: boolean): Extension {
  return keymap.of(tabIndents
    ? [...defaultKeymap, ...historyKeymap, indentWithTab]
    : [...defaultKeymap, ...historyKeymap])
}

/**
 * Мост встроенного разбора в декорации CodeMirror.
 *
 * Нужен там, где грамматики нет: строковый `language` («json») грамматику не
 * несёт, и без моста редактор оставался бы одноцветным рядом с `GrCodeBlock`,
 * который тот же JSON красит. Хуже того, серверная разметка красит его тоже —
 * и цвет пропадал бы ровно в момент гидрации.
 *
 * **Декорируется только видимое окно.** Разбор строчно-локален, поэтому цена
 * не зависит от размера документа: на каждое нажатие разбирается три-четыре
 * десятка строк вьюпорта, а не весь текст. Отсюда же отказ от `doc.toString()`
 * — он сам по себе копирует документ целиком на каждый кадр.
 *
 * Никакого бюджета и порога длины тут поэтому не нужно: работа ограничена
 * окном по построению, а не проверкой.
 */

/** Декорация на роль создаётся один раз: их тысячи на кадр, и каждая — объект. */
const markByRole = new Map<GrCodeRole, Decoration>()

function markFor(role: GrCodeRole): Decoration {
  let mark = markByRole.get(role)

  if (!mark) {
    mark = Decoration.mark({ class: classForRole(role) })
    markByRole.set(role, mark)
  }

  return mark
}

function buildDecorations(view: EditorView, tokenize: GrCodeLineTokenizer): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>()

  for (const { from, to } of view.visibleRanges) {
    let position = from

    while (position <= to) {
      const line = view.state.doc.lineAt(position)

      let offset = line.from

      for (const token of tokenize(line.text)) {
        const end = offset + token.text.length

        // `plain` не красится вовсе: пустая декорация — это лишний диапазон в
        // наборе и лишний `<span>` в DOM на каждый пробел.
        if (token.role !== 'plain' && end > offset)
          builder.add(offset, Math.min(end, line.to), markFor(token.role))

        offset = end

        // Токенизатор, потерявший символ, сдвинул бы всю строку. Разойдись
        // длины — выходим, а не красим соседние токены чужой ролью.
        if (offset >= line.to)
          break
      }

      if (line.to >= view.state.doc.length)
        break

      position = line.to + 1
    }
  }

  return builder.finish()
}

/**
 * Плагин пересчитывает окно на правке и на прокрутке — и только на них.
 *
 * Смена выделения или фокуса разметку не меняет, а пересборка набора на каждое
 * движение каретки была бы работой впустую.
 */
function tokenizerHighlighting(tokenize: GrCodeLineTokenizer): Extension {
  return ViewPlugin.define(
    view => ({
      decorations: buildDecorations(view, tokenize),
      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged)
          this.decorations = buildDecorations(update.view, tokenize)
      },
    }),
    { decorations: plugin => plugin.decorations },
  )
}

/** Расширение моста или пустое, если встроенного разбора для языка нет. */
export function tokenizerExtension(tokenize: GrCodeLineTokenizer | null): Extension {
  return tokenize ? tokenizerHighlighting(tokenize) : []
}

/** Метка транзакции, рождённой самим редактором. */
const fromEditor = Annotation.define<boolean>()

/**
 * Подсветка: теги Lezer на наши классы ролей.
 *
 * Готовые темы CodeMirror не берутся ни в каком виде — они принесут свою
 * палитру, и редактор станет единственным элементом страницы, не слушающимся
 * темы приложения. Цвет приходит из тех же токенов, что у блока и диффа.
 */
function buildHighlightStyle(): Extension {
  const spec: Array<{ tag: unknown, class: string }> = []
  const registry = tags as unknown as Record<string, unknown>

  for (const [role, tagNames] of Object.entries(LEZER_TAGS_BY_ROLE)) {
    for (const name of tagNames) {
      // `function(variableName)` — модификатор поверх тега: у `tags` он лежит
      // функцией, и разворачивается только так.
      const modifier = /^(\w+)\((\w+)\)$/.exec(name)
      const tag = modifier
        ? (registry[modifier[1]!] as ((inner: unknown) => unknown) | undefined)?.(registry[modifier[2]!])
        : registry[name]

      if (tag)
        spec.push({ tag, class: classForRole(role as GrCodeRole) })
    }
  }

  // `fallback` — штатный способ CodeMirror сказать «это умолчание»: наш стиль
  // применяется, только если потребитель не дал своего. Без него тема, переданная
  // через `extensions`, проигрывала бы нашей — то есть не подключалась бы вовсе.
  return syntaxHighlighting(HighlightStyle.define(spec as never), { fallback: true })
}

/**
 * Тема редактора из наших токенов.
 *
 * Фон и текст — те же переменные, что у блока: редактор и блок стоят рядом, и
 * разойдись они — семейство рассыпается.
 */
const grTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--gr-code-block-bg, var(--gr-muted))',
    color: 'var(--gr-code-block-fg, var(--gr-fg))',
  },
  '&.cm-focused': { outline: 'none' },
  '.cm-content': { caretColor: 'var(--gr-code-editor-cursor, var(--gr-fg))' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--gr-code-editor-cursor, var(--gr-fg))' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'var(--gr-code-editor-selection, var(--gr-info-light))',
  },
  '.cm-activeLine': { backgroundColor: 'var(--gr-code-editor-active-line, transparent)' },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    color: 'var(--gr-code-block-line-number, var(--gr-muted-fg))',
    border: 'none',
  },
})

export interface CreateEditorOptions {
  parent: HTMLElement
  doc: string
  language: unknown
  extensions?: readonly unknown[]
  placeholder?: string
  readonly: boolean
  tabIndents: boolean
  lineNumbers: boolean
  wrap: boolean
  /**
   * ARIA-атрибуты **редактируемого узла**, а не обёртки.
   *
   * Роль `textbox` CodeMirror вешает на `.cm-content`, и имя обязано быть там
   * же: `aria-label` на родителе доступного имени виджету не даёт, и axe
   * справедливо считает поле безымянным.
   */
  contentAttributes: Record<string, string>
  /**
   * Построчный разбор на случай, когда грамматики нет. `null` — грамматика
   * есть или встроенного разбора для языка не существует: тогда плагин не
   * ставится вовсе.
   */
  tokenizeLine: GrCodeLineTokenizer | null
  onChange: (value: string) => void
  onFocus: (event: FocusEvent) => void
  onBlur: (event: FocusEvent) => void
}

/**
 * Язык из пропа в расширение.
 *
 * Строка — только имя для серверной разметки, грамматики за ней нет: языковые
 * пакеты CodeMirror в наш манифест не входят, их подключает потребитель.
 */
async function resolveLanguage(language: unknown): Promise<Extension[]> {
  if (!language || typeof language === 'string')
    return []

  if (typeof language === 'function') {
    const resolved = await (language as () => Promise<unknown>)()

    return resolved ? [resolved as Extension] : []
  }

  return Array.isArray(language) ? language as Extension[] : [language as Extension]
}

export async function createEditor(options: CreateEditorOptions): Promise<EditorView> {
  const language = await resolveLanguage(options.language)

  const extensions: Extension[] = [
    // Своя тема — с наименьшим приоритетом: она умолчание, а не диктат.
    // Тема потребителя из `extensions` обязана её перекрывать.
    Prec.lowest(grTheme),
    buildHighlightStyle(),
    history(),
    keymapCompartment.of(keymapFor(options.tabIndents)),
    tokenizerCompartment.of(tokenizerExtension(options.tokenizeLine)),
    languageCompartment.of(language),
    readonlyCompartment.of(EditorState.readOnly.of(options.readonly)),
    wrapCompartment.of(options.wrap ? EditorView.lineWrapping : []),
    lineNumbersCompartment.of(options.lineNumbers ? lineNumbersExt() : []),
    attributesCompartment.of(EditorView.contentAttributes.of(options.contentAttributes)),
    EditorView.updateListener.of((update) => {
      if (!update.docChanged)
        return

      // Транзакция, рождённая применением пропа, обратно не эмитится: иначе
      // получилась бы эхо-петля на каждой букве.
      if (update.transactions.some(tr => tr.annotation(fromEditor) === false))
        return

      options.onChange(update.state.doc.toString())
    }),
    EditorView.domEventHandlers({
      focus: (event) => {
        options.onFocus(event)
        return false
      },
      blur: (event) => {
        options.onBlur(event)
        return false
      },
    }),
    ...(options.placeholder ? [placeholderExt(options.placeholder)] : []),
    ...((options.extensions ?? []) as Extension[]),
  ]

  return new EditorView({
    state: EditorState.create({ doc: options.doc, extensions }),
    parent: options.parent,
  })
}

export function docOf(view: unknown): string {
  return (view as EditorView).state.doc.toString()
}

/** Точечная транзакция вместо пересоздания документа — курсор и история целы. */
export function applyChange(view: unknown, change: MinimalChange): void {
  (view as EditorView).dispatch({
    changes: change,
    annotations: fromEditor.of(false),
  })
}

export function reconfigure(
  view: unknown,
  options: {
    readonly: boolean
    wrap: boolean
    lineNumbers: boolean
    tabIndents: boolean
    contentAttributes: Record<string, string>
    tokenizeLine: GrCodeLineTokenizer | null
  },
): void {
  (view as EditorView).dispatch({
    effects: [
      readonlyCompartment.reconfigure(EditorState.readOnly.of(options.readonly)),
      wrapCompartment.reconfigure(options.wrap ? EditorView.lineWrapping : []),
      lineNumbersCompartment.reconfigure(options.lineNumbers ? lineNumbersExt() : []),
      attributesCompartment.reconfigure(EditorView.contentAttributes.of(options.contentAttributes)),
      keymapCompartment.reconfigure(keymapFor(options.tabIndents)),
      tokenizerCompartment.reconfigure(tokenizerExtension(options.tokenizeLine)),
    ],
  })
}

export function focusEditor(view: unknown): void {
  (view as EditorView).focus()
}

export function blurEditor(view: unknown): void {
  (view as EditorView).contentDOM.blur()
}
