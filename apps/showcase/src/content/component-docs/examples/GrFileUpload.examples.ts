import type { ShowcaseComponentExampleDoc } from '../types'

export const grFileUploadExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'file-upload-validation',
    title: 'Validation bridge with upload request',
    description: 'Главный сценарий для `GrFileUpload`: validators, upload lifecycle и понятное отображение последнего результата загрузки.',
    status: 'ready',
    previewKey: 'gr-file-upload-validation',    note: 'Покрывает основной integration-case между компонентом и utility-слоем `fileValidation`.',
  },
  {
    id: 'file-upload-custom-ui',
    title: 'Custom trigger UI',
    description: 'Показываем режим без стандартной dropzone-разметки: `GrFileUpload` остаётся orchestrator-слоем, а UI можно собрать из других компонентов пакета.',
    status: 'ready',
    previewKey: 'gr-file-upload-custom-ui',  },
  {
    id: 'file-upload-disabled-and-limit',
    title: 'Disabled and guarded states',
    description: 'Отдельно фиксируем не happy-path режимы: disabled, limit guard и обратную связь через `onExceed`.',
    status: 'ready',
    previewKey: 'gr-file-upload-disabled-and-limit',    note: 'Не-happy-path нужен отдельно, чтобы быстро проверить доступность, disable-state и защиту от превышения лимита.',
  },
  {
    id: 'file-upload-progress',
    title: 'Upload progress with default bar',
    description: 'Дефолтный `GrProgressBar` в зарезервированной зоне: переключение `idle ↔ uploading ↔ success` без layout shift. Прогресс приходит из `ctx.onProgress`, который вызывает пользовательский `request` — этот контракт совместим с `axios.onUploadProgress`.',
    status: 'ready',
    previewKey: 'gr-file-upload-progress',    note: 'Покрывает связку `ctx.onProgress` → `state-change` → дефолтный `GrProgressBar`. Без слотов.',
  },
  {
    id: 'file-upload-progress-slot',
    title: 'Custom progress via scoped slot',
    description: 'Кастомный круговой индикатор и кнопка отмены — через scoped-слот `progress`. Дефолтный бар выключен через `:show-progress="false"`.',
    status: 'ready',
    previewKey: 'gr-file-upload-progress-slot',    note: 'Demonstrates `#progress` slot payload: `percent`, `indeterminate`, `phase`, `files`, `abort`, `state`.',
  },
  {
    id: 'file-upload-action-xhr',
    title: 'Action endpoint with real XHR progress',
    description: 'Сценарий `action`: компонент сам формирует `multipart/form-data` и отправляет POST через `XMLHttpRequest`, давая реальный `upload.onprogress` без какого-либо кода пользователя. Отмена — внутренний `AbortController`.',
    status: 'ready',
    previewKey: 'gr-file-upload-action-xhr',    note: 'Подтверждает миграцию с `fetch` на `XMLHttpRequest`: для action-режима теперь доступен реальный процент. Для просмотра прогресса используй файлы >1 МБ.',
  },
  {
    id: 'file-upload-sizes',
    title: 'Шкала размеров',
    description: 'Меняются поля дроп-зоны, плитка иконки и кегль подписей; вложенный `GrProgressBar` получает толщину из того же размера.',
    status: 'ready',
    previewKey: 'gr-file-upload-sizes',  },
  {
    id: 'file-upload-retry',
    title: 'Accept, remove and retry',
    description: '`accept` фильтрует и диалог, и перетаскивание; набор файлов после ошибки остаётся, лишний убирается из списка, а `retry()` повторяет загрузку без повторного выбора.',
    status: 'ready',
    previewKey: 'gr-file-upload-retry',  },
  {
    id: 'file-upload-per-file',
    title: 'Per-file upload with previews',
    description: '`uploadMode="per-file"` отправляет каждый файл своим запросом (`request` при этом зовётся с массивом из одного файла — контракт не меняется), `concurrency` ограничивает число одновременных соединений, а у строки появляются статус, процент, отмена и повтор именно её. `preview` рисует миниатюры для `image/*` и честно отзывает object URL при удалении и размонтировании.',
    status: 'ready',
    previewKey: 'gr-file-upload-per-file',  },
]
