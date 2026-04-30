# Как добавлять новый компонент в `packages/granularity/src`

Этот файл описывает процесс добавления нового компонента в пакет `@feugene/granularity`.

## Базовые принципы

- код нового компонента живёт внутри `packages/granularity/src/components/<ComponentName>`;
- источником правды для подключения компонента в granular-механизмы является `config.ts`;
- набор файлов внутри папки компонента **не обязан быть одинаковым** для всех компонентов: добавляйте только то, что действительно нужно;
- общий пакетный API и registry обновляются вручную, а производные вещи вроде safelist-агрегации и CSS asset generation строятся уже из зарегистрированных конфигов.

## Когда компонент нужно добавлять сюда

Добавляйте компонент в `packages/granularity/src/components`, если он должен участвовать в одном или нескольких текущих механизмах пакета:

- экспортироваться из `@feugene/granularity` или через отдельный subpath `@feugene/granularity/components/<ComponentName>`;
- участвовать в `presetGranularity({ components: [...] })` и общих granular registry;
- иметь собственный component CSS asset `@feugene/granularity/components/<ComponentName>/styles.css`;
- иметь зависимые granular-компоненты, safelist или локальные CSS-файлы, учитываемые preset/node-helper'ами.

## Минимальная структура компонента

Обязательный минимум для нового компонента такой:

```text
src/components/<ComponentName>/
  <ComponentName>.vue
  config.ts
  index.ts
```

Дальше структура зависит от компонента. В текущем коде дополнительно встречаются:

- `ds<ComponentName>Styles.ts` — helper с utility-классами, вариантами, размерами и safelist;
- `safelist.ts` — если safelist удобно держать отдельно;
- `styles.css` — если у компонента есть собственные глобальные CSS-правила;
- `tokens.css` — если у компонента есть собственные CSS custom properties;
- другие локальные helper-файлы — только внутри папки компонента.

Важно: эти файлы **не обязательны сами по себе**. Например, сейчас:

- у `GrDialog`, `GrFormField` и `GrInput` нет отдельного `safelist.ts`, safelist экспортируется из style-helper;
- только `GrIcon` использует `cssFiles` в `config.ts` и хранит локальные `tokens.css` / `styles.css`.

## Пошаговый чеклист

### 1. Создать папку компонента

Создайте `src/components/<ComponentName>/` и добавьте в неё файлы нового компонента, которые действительно относятся к granular-пакету.

Минимум нужен такой:

- `<ComponentName>.vue`;
- `index.ts`;
- `config.ts`.

### 2. Вынести локальную utility/style-логику при необходимости

Если компонент использует вычисляемые UnoCSS-классы, размеры, варианты или общие style-helper'ы, держите их рядом с компонентом.

Текущие примеры из пакета:

- `GrButton/grButtonStyles.ts`;
- `GrDialog/grDialogStyles.ts`;
- `GrFormField/grFormFieldStyles.ts`;
- `GrInput/grInputStyles.ts`.

В таких helper-файлах обычно лежат:

- связанные типы;
- utility-классы и токены классов;
- safelist компонента;
- вспомогательные style-функции.

### 3. Определить, нужен ли компоненту отдельный CSS

Сейчас в пакете есть два разных механизма CSS:

1. **Сгенерированный component style asset** `components/<ComponentName>/styles.css`.
   - Он создаётся автоматически из registry через `granularityStyleAssets`.
   - По умолчанию он есть у каждого компонента, если в `config.ts` не отключать `emitStyleAsset`.

2. **Локальные сырьевые CSS-файлы**, перечисленные в `config.ts` через `cssFiles`.
   - Они нужны только если у компонента реально есть собственные `styles.css`, `tokens.css` или другие локальные CSS-файлы.
   - Сейчас такой сценарий есть, например, у `GrIcon`.

Практическое правило:

- если CSS нужен только этому компоненту и это обычный CSS-файл, положите его в папку компонента;
- если это component-specific custom properties, используйте локальный `tokens.css`;
- если ничего такого нет, не добавляйте лишние `styles.css` и `tokens.css`.

### 4. Создать `config.ts`

`config.ts` — обязательная точка регистрации компонента.

Именно отсюда текущий код получает:

- `name` компонента;
- `safelist`;
- `dependencies` на другие granular-компоненты;
- `cssFiles`, если у компонента есть локальные CSS-файлы;
- имя итогового component style asset.

Пример для компонента без собственных CSS-файлов:

```ts
import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { grButtonSafelist } from './safelist'

export const grButtonConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'GrButton',
  safelist: grButtonSafelist,
})
```

Пример для компонента с зависимостями:

```ts
import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { grDialogSafelist } from './grDialogStyles'

export const grDialogConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'GrDialog',
  dependencies: ['GrButton', 'GrModal'],
  safelist: grDialogSafelist,
})
```

Пример для компонента с локальными CSS-файлами:

```ts
import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { grIconSafelist } from './safelist'

export const grIconConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'GrIcon',
  safelist: grIconSafelist,
  cssFiles: ['./tokens.css', './styles.css'],
})
```

### 5. Создать `index.ts`

`index.ts` нужен для публичного API компонента и его подключения в пакетный entrypoint.

Минимум:

```ts
export { default } from './GrIcon.vue'
export { default as GrIcon } from './GrIcon.vue'
```

Если наружу должны торчать типы, safelist или helper'ы, экспортируйте их здесь же.

### 6. Убедиться, что utility-классы компонента видны preset-сборке

Полный пакетный `styles.css` больше не собирается через `src/styles.css.ts`.

Теперь build прогоняет `presetGranularityNode` по исходникам компонентов и извлекает utility-классы прямо из `*.vue` / `*.ts` файлов внутри `src/components/*`.

Практическое правило:

- держите реальные UnoCSS-классы в component source или в локальных helper-файлах рядом с компонентом;
- если нужны обычные CSS-файлы, перечисляйте их через `cssFiles` в `config.ts`;
- не добавляйте отдельные `styles.css.ts`-entrypoint'ы ради package bundle.

## Что обязательно обновить вне папки компонента

### 1. `src/granular-provider/shared.ts`

Подключите новый `config.ts` в `granularityComponentConfigs` (browser-safe `./config.ts`).

Если у компонента есть node-only вариант конфига (например, чтение токенов
с диска через `tokenDefinitionsFromCssSync` — как у `GrButton`),
переопределите его в `src/granular-provider/node.ts` через массив
`overrides`, передаваемый в `createGranularityProvider(...)`. Для браузера
в `src/granular-provider/index.ts` аналогично передаётся `./config.ts`-вариант.

Именно из этого реестра потом строятся:

- `resolveGranularityComponentNames(...)`;
- зависимости между компонентами;
- `granularityComponents` и общий safelist;
- `granularityStyleAssets`;
- extra CSS assets в `vite.config.ts`.

### 2. `src/index.ts`

Добавьте экспорт компонента в общий пакетный entrypoint.

Минимум:

```ts
export * from './components/GrIcon'
```

### 3. `package.json`

Subpath exports пакета задаются вручную в `packages/granularity/package.json`.

Если компонент должен быть доступен как отдельный импорт, добавьте export для:

- `./components/<ComponentName>`;
- `./components/<ComponentName>/styles.css`.

Пример:

```json
"./components/GrIcon": {
  "types": "./dist/types/src/components/GrIcon/index.d.ts",
  "import": "./dist/components/GrIcon/index.js"
},
"./components/GrIcon/styles.css": "./dist/components/GrIcon/styles.css"
```

### 4. `package` CSS-exports

Foundation-only слой публикуется как `@feugene/granularity/foundation.css`, а полный пакетный bundle — как `@feugene/granularity/styles.css`.

Оба артефакта собираются из Uno preset, поэтому отдельно править общий source-entrypoint для CSS не нужно.

## Как понять, нужны ли `styles.css`, `tokens.css` и `safelist.ts`

### Нужен `styles.css`, если:

- у компонента есть собственные глобальные селекторы;
- есть CSS, который не выражается только через utility-классы;
- этот CSS не должен жить в общих `src/styles/base.css` или theme-файлах.

### Нужен `tokens.css`, если:

- у компонента есть локальные CSS custom properties;
- это не общие системные токены пакета;
- переменные относятся только к этому компоненту.

### Нужен `safelist.ts`, если:

- safelist удобно держать отдельным файлом;
- он не живёт естественно в `ds<ComponentName>Styles.ts`.

Если safelist уже экспортируется из style-helper, отдельный `safelist.ts` не требуется.

## Как тестировать новый компонент

Минимум нужно обновить `src/__tests__/presetGranularity.test.ts`.

В текущем коде там проверяются:

- подключение нового `config.ts` в `granularityComponentConfigs` (`src/granular-provider/shared.ts`);
- safelist компонента в `granularityComponents` и `getGranularitySafelist(...)`;
- зависимости `dependencies`, если они есть;
- `styleAssetFileName`;
- `cssFiles` и `cssFileAssetNames`, если компонент использует локальные CSS-файлы;
- итоговый список `granularityStyleAssets`.

Если у компонента есть заметная runtime-логика, добавьте и отдельные component tests рядом с компонентом, как это сделано у `GrModal`, `GrPromptDialog` и `GrSelect`.

## Что проверить перед завершением задачи

1. У компонента есть минимум `config.ts`, `index.ts` и основной `.vue`-файл.
2. Компонент зарегистрирован в `src/granular-provider/shared.ts` (browser-конфиг); node-only конфиг, если нужен, подключён в `src/granular-provider/node.ts`.
3. Компонент экспортируется из `src/index.ts`.
4. При необходимости обновлён `packages/granularity/package.json`.
5. Локальные CSS-файлы добавлены в `config.ts` только если они реально есть.
6. Обновлён `src/__tests__/presetGranularity.test.ts` и связанные component tests, если они нужны.
7. Для компонента добавлены все ожидаемые публичные entrypoint'ы и связанные style asset'ы.

## Как добавлять директивы

Директивы в пакете живут отдельно от компонентов — в `packages/granularity/src/directives`.

### Минимальная схема

1. Добавьте новый файл `src/directives/<directiveName>.ts`.
2. Если директива зависит от компонентов или их helper'ов, импортируйте их через относительные пути внутри `packages/granularity/src`.
3. Подключите директиву в `src/directives/index.ts`, чтобы она попала в публичный API.
4. Если директива должна быть доступна через отдельный subpath, убедитесь, что `src/directives/index.ts` подключён как entry в `vite.config.ts`, а `packages/granularity/package.json` содержит export `./directives`.

### Практические правила

- общие типы и утилиты переиспользуйте из `packages/granularity/src`, если они уже есть, вместо дублирования логики;
- если директива нужна только внутренним granular-компонентам, всё равно держите её в `src/directives`, а не внутри одной компонентной папки;
- если вместе с директивой появляется новый публичный API, проверьте, что он экспортируется через `src/directives/index.ts` и описан в `packages/granularity/package.json`, когда нужен отдельный subpath;
- если директива должна быть доступна как глобальная шаблонная директива в IDE конечного приложения, обновите `src/directives/globalDirectives.ts` и проверьте, что `src/directives/index.ts` продолжает подключать этот augmentation через `export type {} from './globalDirectives'`.

## Короткий шаблон действий

1. Создать `src/components/<ComponentName>/`.
2. Добавить `<ComponentName>.vue`, `config.ts` и `index.ts`.
3. При необходимости вынести style/helper-логику в локальные `ds*.ts` и/или `safelist.ts`.
4. При необходимости добавить `styles.css`, `tokens.css` и перечислить нужные файлы в `config.ts`.
5. Подключить компонент в `src/registry/components.ts`.
6. Обновить `src/index.ts` и `packages/granularity/package.json`, если нужен публичный subpath export.
7. Обновить `src/__tests__/presetGranularity.test.ts` и сопутствующие тесты.
8. Проверить, что новый компонент или директива корректно подключены в публичный API пакета.