import type { ShowcaseComponentExampleDoc } from '../types'

export const grCommandPaletteExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'command-palette-basic',
    title: 'Commands with groups and shortcuts',
    description: 'Палитра открывается по ⌘K (Ctrl+K вне macOS) или программно через `v-model`. Команды группируются полем `group`, ищутся по метке, описанию и `keywords`. Команда «Toggle theme» здесь настоящая: переключает тему через `useTheme()`, а её сочетание ⌘J повешено директивой `v-hotkey` — работает и без открытия палитры.',
    status: 'ready',
    previewKey: 'gr-command-palette-basic',    note: 'Поле ввода — `role="combobox"`, список — `role="listbox"`, активная команда указывается через `aria-activedescendant`: фокус не покидает поиск.',
  },
  {
    id: 'command-palette-async',
    title: 'Remote search',
    description: '`:filterable="false"` отдаёт фильтрацию наружу: палитра эмитит `search`, владелец подставляет результаты и `loading`. `:hotkey="null"` отключает глобальное сочетание.',
    status: 'ready',
    previewKey: 'gr-command-palette-async',
  },
  {
    id: 'command-palette-recent',
    title: 'Recent commands and match highlighting',
    description: '`recentIds` поднимает команды отдельной группой наверх — в порядке самого массива и без дублей ниже, — пока запрос пуст. С первой же буквой секция уступает место релевантности, а совпавшие фрагменты метки и описания подсвечиваются `<mark>` (цвет — переменная `--gr-command-match-bg`).',
    status: 'ready',
    previewKey: 'gr-command-palette-recent',
  },
  {
    id: 'command-palette-virtual',
    title: 'Палитра на 5 000 команд',
    description: 'С `virtual` в DOM живёт только окно вокруг вьюпорта; высоту окна задаёт `maxHeight`. Группы при этом сохраняются: если список прокручен внутрь группы, её обёртка всё равно создаётся и берёт имя через `aria-label` — заголовка в разметке в этот момент нет.',
    status: 'ready',
    previewKey: 'gr-command-palette-virtual',    note: '`aria-setsize`/`aria-posinset` считаются по своей группе, а не по всему списку. Стрелки прокручивают список до активной команды прежде, чем перевести на неё `aria-activedescendant`: вне окна элемента в DOM нет.',
  },
]
