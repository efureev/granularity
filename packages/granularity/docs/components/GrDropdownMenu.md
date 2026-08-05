# GrDropdownMenu

Готовое меню действий поверх `GrDropdown`: список, группы, заголовки,
разделители, колонки и пункты.

Клавиатура и стек слоёв — у `GrDropdown` ([`../keyboard.md`](../keyboard.md),
[`../z-index.md`](../z-index.md)).

## Роли: почему их нельзя пропустить

Панель `GrDropdown` объявляет `role="menu"`, а эта роль делает **всех** своих
потомков презентационными. Поэтому роли здесь не украшение, а условие того, что
меню вообще существует для скринридера:

- пункт — `role="menuitem"` (или `menuitemcheckbox`/`menuitemradio`);
- разделитель — `role="separator"`;
- группа — `role="group"` с именем из заголовка через `aria-labelledby`;
- заголовок группы — `role="presentation"`;
- список, колонки и колонка — `role="none"`: обёртка между `menu` и `menuitem`
  ломает `aria-required-children`.

## Пункты-переключатели

`role="menuitemcheckbox"` и `role="menuitemradio"` требуют `aria-checked` —
компонент выставляет его в обоих состояниях, иначе AT прочитает пункт как
обычную команду. Место под отметку занято всегда, когда пункт переключаемый:
иначе строки «включено» и «выключено» разъезжаются по горизонтали.

```vue
<GrDropdownMenuItem role="menuitemcheckbox" :checked="showArchived" @click="toggle">
  Показывать архив
</GrDropdownMenuItem>
```

Иконка и сочетание клавиш задаются пропами `icon` / `shortcut` либо слотами
`#icon` / `#shortcut` (слот сильнее).

## Меню из модели

Композиция подкомпонентов остаётся для нестандартных пунктов, но девять меню из
десяти однотипны — их проще описать массивом:

```vue
<GrDropdownMenu :items="items" @select="onSelect" />
```

```ts
const items: GrDropdownMenuEntry[] = [
  { key: 'rename', label: 'Переименовать', shortcut: '⌘R' },
  { type: 'divider' },
  { type: 'group', title: 'Вид', items: [
    { key: 'compact', label: 'Компактно', role: 'menuitemradio', checked: true },
  ] },
  { key: 'delete', label: 'Удалить', variant: 'danger' },
]
```

`select` не эмитится для `disabled`-пункта. Пункт с `href` рендерится ссылкой.
Слот по умолчанию сильнее модели: передали и то и другое — победит слот.

## Оформление

`variant="danger"` красит пункт ролью `--gr-danger-text`, а не насыщенным тоном:
насыщенный тон как цвет текста не проходит контраст. Disabled гасится фоном
(`--gr-muted`), а не `opacity`, и не пропускает ни клик, ни клавиатурную
активацию — обработчик на самом пункте останавливается
`stopImmediatePropagation`.

Все классы каталога живут в `grDropdownMenuStyles.ts` и объявлены в safelist:
`.ts`-хелпер бандлер выносит в общий чанк, вне области скана компонента, и без
safelist у изолированного потребителя пропали бы выравнивание, колонки и цвета.
