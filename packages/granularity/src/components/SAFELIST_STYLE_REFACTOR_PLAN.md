## Safelist / style-source refactor plan

### Цель
- Для каждого компонента оставить в `.vue` только стабильные базовые классы.
- Все динамические классы вынести в отдельный style-file компонента.
- `safelist.ts` должен получать safelist из style-file и не хранить строковые дубликаты.

### Эталон
- `DsIcon`
- `DsSwitch`

### Правило для base-классов
- Если стабильные base-классы были вынесены в style-file, вернуть их обратно в шаблон `.vue`.
- Отдельно проверить `DsButton`: `base` вернуть в компонент.

### Статусы
- `todo` — ещё не обработан
- `doing` — в работе
- `done` — обработан
- `skip` — уже соответствует паттерну, менять не нужно

### Первая волна — подтверждённые кандидаты
- `done` `DsButton` — стабильные `base`-классы возвращены в `.vue`, в style-file оставлена только динамика
- `done` `DsSelect`
- `done` `DsNumberInput`
- `done` `DsLoading`
- `done` `DsDrawer`
- `done` `DsBadge`
- `done` `DsLink`

### Вторая волна — вероятные кандидаты
- `done` `DsInputTag`
- `done` `DsRadio`
- `done` `DsTextarea`
- `done` `DsTreeSelect`
- `done` `DsDropdown`

### Уже соответствуют паттерну / референсы
- `skip` `DsIcon`
- `skip` `DsSwitch`
- `skip` `DsInput`
- `skip` `DsDialog`
- `skip` `DsModal`
- `skip` `DsFormField`
- `skip` `DsProgressBar`
- `skip` `DsAvatar`

### Порядок работы
1. Обновлять этот файл после завершения каждого компонента.
2. Не добавлять новые тесты.
3. Менять только существующие тесты, если они реально сломались из-за рефакторинга.
4. После всех изменений прогнать релевантные проверки.