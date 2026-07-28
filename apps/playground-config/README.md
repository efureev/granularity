# `apps/playground-config`

Стенд для `GrConfigProvider` и его контракта `componentDefaults`.

## Зачем нужен

Контракт `componentDefaults` собирается из аугментаций, которые компоненты объявляют
в своих папках (`GrButton/defaults.ts` → `declare module`). Такая схема может тихо
сломаться на границе пакета: аугментация видна внутри монорепо, но не долетает до
потребителя через subpath-экспорты и опубликованные `dist/types/**`.

Поэтому приложение подключает пакет **как внешний потребитель**:

- импорты только по subpath — `@feugene/granularity/components/GrButton`;
- в `tsconfig.json` **намеренно нет** `paths`-алиасов на `src` (в отличие от
  `playground-5`), иначе типы резолвились бы в исходники и проверка ничего бы не
  доказывала.

## Что проверяет

`yarn typecheck` гоняет две программы:

- **`src/typeContract.ts`** — импортированы `GrButton`, `GrInput`, `GrBadge`. Валидный
  конфиг проходит; неизвестный компонент, неизвестный проп и неверное значение
  помечены `@ts-expect-error`. Если аугментация не долетит, директивы станут
  неиспользуемыми и `vue-tsc` упадёт.
- **`checks/isolatedRegistry.ts`** (`tsconfig.checks.json`) — импортирован только
  `GrConfigProvider`. Утверждает, что `keyof GrComponentDefaults` — это `never`, то
  есть реестр пуст без импортов компонентов и типы не приезжают «оптом».

Обе проверки фальсифицируемы, это проверялось руками: импорт `GrButton` в
изолированной программе роняет вторую, отключение `declare module` в пакете — первую.

`src/App.vue` — рантайм-половина: те же subpath-импорты, тумблер включает и выключает
`componentDefaults`, у контролов внутри провайдера не задано ни одного настраиваемого
пропа.

## Команды

```bash
yarn workspace @feugene/granularity-playground-config typecheck  # собственно проверка
yarn workspace @feugene/granularity-playground-config dev
yarn workspace @feugene/granularity-playground-config build
```

Из корня — `yarn typecheck:playground-config` и `yarn build:playground-config`.

Проверка идёт против собранного `dist`, поэтому после правок библиотеки нужен
`yarn build:granularity`.
