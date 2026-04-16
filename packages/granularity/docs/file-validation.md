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
- `maxFileSizeBytesValidator`
- `maxSizeMbValidator`
- `maxTotalSizeBytesValidator`
- типы из `types.ts`, включая `FileValidator`, `FileValidatorInput`, `FileValidationIssue`, `FileValidationIssueCode`

## Модель валидации

В основе API — композиция валидаторов:

- `FileValidator` принимает `{ files, context }`;
- возвращает массив `FileValidationIssue` синхронно или асинхронно;
- `runFileValidators` запускает набор валидаторов и объединяет результат.

Контекст валидации содержит:

- `source`: `'input' | 'drop'`
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
  maxFileSizeBytesValidator,
  runFileValidators,
} from '@feugene/granularity/fileValidation'

const validators = [
  acceptValidator('image/*,.pdf'),
  maxFileSizeBytesValidator(5 * 1024 * 1024),
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
- `maxFileSizeBytesValidator` / `maxSizeMbValidator` — если нужно ограничение на размер одного файла.
- `maxTotalSizeBytesValidator` — если нужно ограничение на суммарный размер набора файлов.

## Связь с `DsFileUpload` и `vDropzone`

- `DsFileUpload` переиспользует этот API для своей логики.
- `vDropzone` принимает `validators` в binding value и запускает их до вызова `onFiles`.

Иными словами, `fileValidation` — это package-level слой, который можно использовать независимо от конкретного UI.