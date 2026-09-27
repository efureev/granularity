# Интеграция с `granum`

`@feugene/granularity` подключается к приложению через
[`@feugene/granum`][granum] — конвейер сборки гранулярных UI-пакетов. Пакет
собирается его плагином и публикует рядом с `dist` машинно-порождённый
`granum.manifest.json`; приложение читает манифест и по своей селекции
собирает CSS.

Базовые понятия (контракт провайдера, слои каскада, темы, safelist, обрезка
токенов) описаны в документации granum — см. [`docs/ru`][granum-docs].

## Что именно подключается

- `granum()` — плагин приложения из `@feugene/granum/vite`; читает манифесты
  провайдеров и отдаёт виртуальные модули: `virtual:granum.css` (весь CSS),
  `virtual:granum/layers/<layer>.css` (один слой), `virtual:granum/components`
  (реэкспорт селекции), `virtual:granum/themes` (манифест тем для рантайма).
- `defineGranumConfig` — типизированный `granum.config.ts` приложения.
- `miniEngine()` из `@feugene/granum-engine-mini` — движок утилит. Своей
  реализации движка granum не содержит, поэтому в `devDependencies` приложения
  пакета два: конвейер и движок. Поле `engine` обязательно и принимает
  **инстанс**: строку `'builtin'` и объект опций granum отклоняет
  `InvalidConfigError` с путём до поля.
- `granum.manifest.json` пакета — источник правды о компонентах: классы,
  потребляемые токены, зависимости, файлы темы и CSS. Лежит в `dist`,
  экспортируется как `@feugene/granularity/granum.manifest.json`.

Сканирования `node_modules` в granum нет: классы компонентов извлечены на
сборке пакета и уже лежат в манифесте.

## Базовый пример

```ts
// granum.config.ts
import { defineGranumConfig } from '@feugene/granum/vite'
import { miniEngine } from '@feugene/granum-engine-mini'

export default defineGranumConfig({
  engine: miniEngine(),
  providers: ['@feugene/granularity'],
  appSources: { dirs: ['src'] },
})
```

```ts
// vite.config.ts
import { granum } from '@feugene/granum/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

import granumConfig from './granum.config'

export default defineConfig({ plugins: [vue(), granum(granumConfig)] })
```

```ts
// src/main.ts
import 'virtual:granum.css'
```

По умолчанию при таких опциях:

- в сборку входят все компоненты провайдера (`components: 'all'`);
- подмешиваются `tokens.css` и `base.css` пакета и тема `light`
  (`defaultThemes` провайдера);
- классы разметки приложения извлекаются из `appSources`;
- правила и варианты приходят от `miniEngine()` — `preset-mini` плюс
  доп-правила, на которых нарисованы компоненты (опция `extraRules`, включена
  по умолчанию).

Готовая связка — в `apps/playground-5`.

## Наращиваем опции

### Сужаем список компонентов

```ts
defineGranumConfig({
  engine: miniEngine(),
  providers: ['@feugene/granularity'],
  components: [
    { provider: '@feugene/granularity', names: ['GrButton'] },
  ],
  appSources: { dirs: ['src'] },
})
```

Зависимости компонента granum развернёт сам: селекция замыкается транзитивно
по графу из манифеста, зависимости встают раньше зависящих.

### Темы

```ts
defineGranumConfig({
  engine: miniEngine(),
  providers: ['@feugene/granularity'],
  themes: { names: ['light', 'dark'] },
})
```

Своя тема приложения задаётся в том же месте — `themes.define` с `extends`
или `tokensRef`; переопределение отдельных токенов — `themes.tokenOverrides`.
Подробности — [`theming.md`](./theming.md).

### Обрезка неиспользуемых токенов

```ts
defineGranumConfig({
  engine: miniEngine(),
  providers: ['@feugene/granularity'],
  components: [{ provider: '@feugene/granularity', names: ['GrButton'] }],
  appSources: { dirs: ['src'] },
  pruneTokens: { mode: 'on' },
})
```

Пакет объявляет больше двух сотен токенов, и приложению с одной кнопкой нужна
их малая часть. Порядок внедрения: `mode: 'report'` → посмотреть план в
`dist/granum-report.json` → `mode: 'on'`. `appSources` при этом обязателен:
токен, который приложение взяло само, иначе уедет из CSS при зелёной сборке.

### Импорт компонента вне селекции

```ts
defineGranumConfig({
  engine: miniEngine(),
  providers: ['@feugene/granularity'],
  components: [{ provider: '@feugene/granularity', names: ['GrButton'] }],
  js: { guard: 'error' },
})
```

`guard` ловит импорт компонента, которого нет в селекции: его CSS в сборку не
попал бы, и компонент отрендерился бы голым. Режим `components: 'imports'`
считает селекцию по импортам и тегам в `appSources` — тогда списка можно не
вести вовсе.

## Слои каскада вместо порядка конкатенации

`virtual:granum.css` начинается с объявления порядка:

```css
@layer granum.tokens, granum.base, granum.themes, granum.components, granum.utilities;
```

Отсюда следует то, ради чего слои и заведены: утилита в разметке приложения
перебивает базовый стиль компонента, а нелейерный CSS приложения перебивает
всё. Отдельный слой можно загрузить сам по себе —
`virtual:granum/layers/utilities.css`, — но тогда порядок слоёв нужно объявить
в приложении самому: первым появлением слоя задаётся его место в каскаде.

`css: { layers: false }` даёт тот же порядок без обёрток `@layer` — для
приложений с legacy-CSS, который живёт вне слоёв.

## Словарь утилит: диалект и отпечаток

Компоненты пакета пользуются утилитами, которых в `preset-mini` нет вовсе:
`sr-only`, `tabular-nums`, `animate-spin`, `divide-y`, `space-y-*`,
`backdrop-*`, `uppercase`. Их привозит дополнительный набор правил
`miniEngine()` (опция `extraRules`, включена по умолчанию), и без него
компоненты рисуются не полностью: «скрытая» подпись таблицы видна обычным
текстом, спиннер не крутится, у списков нет разделителей.

Поэтому пакет объявляет в манифесте **диалект словаря** —
`unocss/preset-mini+granum@66`. Диалект — имя словаря классов, а не версия
реализации, и решает он ровно один вопрос: грузить ли правила пакета. Рядом
лежит **отпечаток словаря** (`vocabulary`) — ключ фактического набора имён,
которые умел сгенерировать движок сборки пакета; он решает другой вопрос:
верить списку классов из манифеста или пересчитать его.

Что из этого следует у приложения:

- тот же диалект и тот же отпечаток — быстрый путь, классы берутся из
  манифеста;
- тот же диалект, другой отпечаток — так выглядит любое приложение, добавившее
  своё правило фабрике движка: классы пересчитываются заново по файлам из
  манифеста, уже с правилами пакета. Само по себе это не предупреждение;
- **движок другого словаря** — `provider-dialect-mismatch` у доктора. Правила
  пакета при этом не грузятся (`engine-rules-skipped`), классы пересчитываются
  без них, и имена, которых чужой словарь не знает, перечисляются
  **поимённо** в `provider-classes-dropped` и остаются видны в
  `classes.unmatched` отчёта. Это и есть выгода объявленного диалекта: вместо
  тихо недорисованных компонентов — список того, что потерялось, и
  `granum why-css granum.config.ts divide-y` с объяснением по конкретному
  классу.

Выход из расхождения один из двух: движок того же диалекта либо нужные правила
своему — `miniEngine({ rules: [...] })`. Смешать два словаря в одной сборке
нельзя: имена пересекаются, а смысл у них разный. Подробности —
[«Движки и диалекты»][granum-engines] в документации granum.

Со стороны пакета связку держит гейт `src/__tests__/presetUtilities.test.ts`:
он сверяет тот же список утилит с `miniEngine()` и с ним же без доп-правил.

## Иконки классом: правило заводит приложение

Иконки самого пакета в CSS не нуждаются — они вкомпилированы в `dist`.
Но если вы передаёте иконку **классом** (`icon="i-lucide-user"`), этот класс
обязан кто-то сгенерировать. `miniEngine()` правил иконок не знает, а поля для
правил у конфига granum нет и не появится: правила приложения передаются
**фабрике движка**.

Практический выбор:

- передавать иконку Vue-компонентом (`:icon="LucideUser"`) — работает без
  единой настройки;
- либо завести правило самому — `miniEngine({ rules: [...] })` — либо взять
  движок, который умеет иконки. Диалект от `rules` не меняется, меняется
  отпечаток: классы пакета будут пересчитаны, и это норма, а не дефект.

Подробности и пример — [«Иконки» в `installation.md`](./installation.md#иконки).

## Отчёт сборки

Рядом с бандлом приложения появляется `dist/granum-report.json`: селекция и её
цепочки, активные темы, классы без правила с источниками, safelist, покрытый
статикой, план обрезки токенов, токены без объявления и размеры слоёв по
собранному ассету. Прочитать его глазами — `granum report`, проверить
конфигурацию без сборки — `granum doctor granum.config.ts`.

## Ссылки

- [`@feugene/granum`][granum] ([документация `docs/ru`][granum-docs],
  [быстрый старт][granum-getting-started], [CLI][granum-cli],
  [движки и диалекты][granum-engines])
- [`theming.md`](./theming.md) — темы и токены пакета
- [`styling.md`](./styling.md) — сценарии подключения CSS

[granum]: https://github.com/efureev/granum
[granum-docs]: ../../../../granum/docs/ru/README.md
[granum-getting-started]: ../../../../granum/docs/ru/getting-started.md
[granum-cli]: ../../../../granum/docs/ru/cli.md
[granum-engines]: ../../../../granum/docs/ru/engines-and-dialects.md
