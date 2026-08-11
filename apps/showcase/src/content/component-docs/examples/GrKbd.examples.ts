import type { ShowcaseComponentExampleDoc } from '../types'

export const grKbdExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'kbd-basic',
    title: 'Клавиши, сочетания и размеры',
    description: 'Сочетание задаётся пропом `keys` — строкой или набором токенов; слот остаётся для одиночной клавиши. Шкала размеров полная: `xs…lg`.',
    status: 'ready',
    previewKey: 'gr-kbd-basic',
  },
  {
    id: 'kbd-hotkey-hints',
    title: 'Подсказки хоткеев в меню',
    description: 'Токен `mod` пишется один раз и показывается по платформе; `platform` позволяет зафиксировать её вручную.',
    status: 'ready',
    previewKey: 'gr-kbd-hotkey-hints',
  },
  {
    id: 'kbd-navbar-search',
    title: 'Поиск в шапке приложения',
    description: 'Сочетание рядом с кнопкой — единственный способ узнать про ⌘K, не нажимая его. Кнопка открывает `GrCommandPalette`, а само сочетание вешает директива `v-hotkey`; диктору его сообщает `aria-keyshortcuts`, поэтому клавиши в разметке декоративны.',
    status: 'ready',
    previewKey: 'gr-kbd-navbar-search',
  },
  {
    id: 'kbd-variants',
    title: 'Одна плашка, отдельные клавиши, аккорд',
    description: 'По умолчанию сочетание рисуется одной плашкой — так его пишут сами системы: `⌘K` на macOS и `Ctrl+K` на прочих (разделитель ставится сам: символы склеиваются, слова — нет). `split` возвращает плашку на клавишу, `sequence` — аккорд «G затем I». Клавиши без букв приходят токенами (`up`, `tab`, `backspace`), и диктор получает имя вместо глифа.',
    status: 'ready',
    previewKey: 'gr-kbd-variants',
  },
  {
    id: 'kbd-tokens',
    title: 'Все клавиши, которые понимает `keys`',
    description: 'Список приходит из самого пакета (`GR_KBD_TOKENS`), а не переписан в витрине: своя копия разошлась бы с форматтером на первой же новой клавише. Для каждой клавиши видно, что писать в `keys`, какие синонимы принимаются и какое имя получит диктор вместо глифа.',
    status: 'ready',
    previewKey: 'gr-kbd-tokens',
  },
]
