# Changelog

All notable changes to the [`@feugene/granularity-tokens`](.) package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- **`docs/themes.md`** — что тема обязана объявить, суффиксы ролей и ловушки контраста, свой
  режим (`extendMode`, `createMode`, `tone`), своя тема (`loadTheme`), превью и проверка перед
  выкладкой. Раздел переехал из `docs/theming.md` ядра целиком.
- **Выпуск тегом `granularity-tokens-v*`** — своя джоба CI (линт, типы, гейт генератора, тесты,
  сборка, `publint`) и публикация в npm и GitHub Packages. Выпускается раньше ядра: ядро и
  спутники зависят от пакета диапазоном.
- **Пакет токенов и тем дизайн-системы.** Словарь токенов, данные тем и сборка темы вынесены из
  `@feugene/granularity`: реестр без значений (`tokens/foundation.json`, `roles.json`,
  `derived.json` — 101 примитив, 94 роли, 18 формул), тема `slate` в `themes/slate/` с режимами
  `light` и `dark`, каталог тем `grThemeCatalog`.
- **`defineTheme`** собирает тему целиком: наследование темы от темы и режима от режима, полнота по
  реестру, контраст и различимость тонов в каждом режиме, фолбэки производных для браузеров без
  `color-mix`. Результат — данные в форме `GranumThemeData` контракта granum 3.
- **`loadTheme`** (`/theme/node`) читает тему из папки, находит тему-базу по id и отдаёт
  прочитанные файлы в `sources`, а тему каталога в цепочке — в `extends`: по ней granum берёт
  токены компонентов для темы приложения в `theme` или `previews`.
- **Провайдер granum без компонентов — владелец каталога тем.** `granum.manifest.json` с каталогом
  (`slate`), реестром токенов (`themes/registry.json`) и формулами производных (`tokens.css` на
  `:root, [data-theme]`); сборка — `granumProvider()` granum 3. Ядро подключает пакет
  зависимостью провайдера.
- **`extendMode`, `createMode`** — режим поверх готового и с нуля (были `extendTheme`/`createTheme`
  в `@feugene/granularity/theme`). Базой служит любой режим любой темы: `'dark'` встроенной,
  `{ theme, mode }` темы данными или другой собранный режим. Результат — полный набор ролей, CSS
  под парой `<тема>-<режим>` и `definition` — готовый вход `modes.define` конфига granum с одними
  отличиями. Покомпонентные токены сверяются с `knownComponentTokens`, если список передан.
- `tone`, `validateTheme`, цветовая математика и `applyTheme` — те же, что были в
  `@feugene/granularity/theme`. `GR_BUILTIN_THEME` и схемы встроенных режимов генерируются из темы
  по умолчанию.
- Гейты значений идут по каждой паре «тема × режим»: различимость тонов, запрет тона в роли текста,
  граница контрола, палитра графиков, тени по режимам, полнота и каталог.
- **`grThemeManifest(id?)` и `GR_DEFAULT_THEME_ID`.** Манифест режимов темы каталога в форме
  `virtual:granum/themes` — для приложения без плагина granum, подключившего готовый
  `themes/<id>.css`: пары по правилу granum по умолчанию (`data-theme`, `<тема>-<режим>`).

### Changed

- **Тени `--gr-shadow-1..3` — только роли режима.** Примитивом остаётся `--gr-shadow-0`: тень,
  объявленная и в `:root`, и в режиме, при равной специфичности решалась порядком файлов.
