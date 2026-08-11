# Валидация файлов

`@feugene/granularity` публикует отдельный package-level API для повторного использования логики валидации файлов вне конкретного компонента.

Entrypoint:

- `@feugene/granularity/fileValidation`

Этот API используется внутри сценариев загрузки файлов и может применяться отдельно, например вместе с `vDropzone`, собственным input-компонентом или кастомным upload-flow приложения.

## Что экспортируется

- `FileValidationError`
- `normalizeFiles`
- `runFileValidators`
- `matchAccept`
- `acceptValidator`
- `allowedExtensionsValidator`
- `allowedMimeTypesValidator`
- `maxCountValidator`
- `maxFileSize`
- `maxTotalSizeBytesValidator`
- типы из `types.ts`, включая `FileValidator`, `FileValidatorInput`, `FileValidationIssue`, `FileValidationIssueCode`

## Модель валидации

В основе API — композиция валидаторов:

- `FileValidator` принимает `{ files, context }`;
- возвращает массив `FileValidationIssue` синхронно или асинхронно;
- `runFileValidators` запускает набор валидаторов и объединяет результат.

Контекст валидации содержит:

- `source`: `'input' | 'drop' | 'form'` — выбор в диалоге, перетаскивание или
  проверка формы перед отправкой. Различать их стоит дорогому валидатору: он
  вправе работать на submit и молчать на каждом выборе файла
- `multiple`: `boolean`
- `accept?`: `string`

Каждая проблема валидации описывается через `FileValidationIssue`:

- `code`
- `message`
- `fileName?`
- `meta?`
- `i18nKey?`
- `i18nParams?`

## Базовый пример

```ts
import {
  acceptValidator,
  maxFileSize,
  runFileValidators,
} from '@feugene/granularity/fileValidation'

const validators = [
  acceptValidator('image/*,.pdf'),
  maxFileSize({ mb: 5 }),
]

const files = [file]

const result = await runFileValidators(files, validators, {
  source: 'input',
  multiple: false,
  accept: 'image/*,.pdf',
})

if (result.issues.length > 0) {
  // показать ошибки пользователю
}
```

## Когда использовать готовые валидаторы

- `acceptValidator` — если вы опираетесь на строку `accept` и хотите повторить браузерно-ожидаемое поведение на уровне логики.
- `allowedExtensionsValidator` — если важен whitelisting по расширениям.
- `allowedMimeTypesValidator` — если важен whitelisting по MIME type.
- `maxFileSize` — если нужно ограничение на размер одного файла. Предел задаётся тем способом, каким он
  приходит: `{ bytes }` из документации API, `{ mb }` из UI-конфига. Код ошибки один — `maxFileSize`, поэтому
  обработчику потребителя не приходится ветвиться по тому, в чём набран лимит.
- `maxTotalSizeBytesValidator` — если нужно ограничение на суммарный размер набора файлов.
- `maxCountValidator` — если нужно ограничение на количество файлов в наборе (`limit` у `GrFormFile` — сахар к нему).

## Связь с `GrFileUpload`, `vDropzone` и `GrForm`

- `GrFileUpload` переиспользует этот API для своей логики.
- `vDropzone` принимает `validators` в binding value и запускает их до вызова `onFiles`.
- `GrForm` собирает те же валидаторы из декларативного правила
  `file: { accept, maxSizeMb, … }` (см. [`components/GrForm.md`](./components/GrForm.md)),
  поэтому ограничение, переехавшее из пропов поля в правило формы, не меняет ни
  поведения, ни текста ошибки.

Иными словами, `fileValidation` — это package-level слой, который можно использовать независимо от конкретного UI.