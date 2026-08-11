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
]
