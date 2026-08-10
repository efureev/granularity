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
]
