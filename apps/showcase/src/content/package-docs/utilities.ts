import { createReadyExamples } from './shared'
import type { PackageDocOverride } from './types'

export const utilityPackageDocOverrides: Record<string, PackageDocOverride> = {
  FileValidationError: {
    overview: [
      '`FileValidationError` — это типизированная ошибка для случаев, когда file-validation pipeline нашёл проблемы и их нужно отдать в UI или логирование единым объектом.',
      'Она удобна как bridge между low-level validators и upload-компонентами/директивами, которые хотят работать с `issues` как со структурированными данными.',
    ],
    examples: createReadyExamples([
      {
        id: 'file-validation-error-shape',
        title: 'Structured validation issues',
        description: 'Вместо строковой ошибки UI получает массив issues с `code`, `message`, `fileName` и optional meta.',
        code: [
          "import { FileValidationError } from '@feugene/granularity/fileValidation'",
          '',
          'try {',
          '  await submitFiles(files)',
          '} catch (error) {',
          '  if (error instanceof FileValidationError) {',
          '    console.log(error.issues)',
          '  }',
          '}',
        ].join('\n'),
      },
    ]),
    apiSections: [
      {
        key: 'parameters',
        title: 'Constructor input',
        origin: 'manual',
        items: [
          { name: 'issues', type: 'FileValidationIssue[]', description: 'Набор ошибок валидации, из которого формируется экземпляр ошибки.' },
        ],
      },
      {
        key: 'returns',
        title: 'Shape',
        origin: 'manual',
        items: [
          { name: 'name', type: 'string', description: 'Стандартное имя ошибки `FileValidationError`.' },
          { name: 'issues', type: 'FileValidationIssue[]', description: 'Структурированный список validation issues.' },
          { name: 'message', type: 'string', description: 'Сводное текстовое представление для fallback-логирования.' },
        ],
      },
    ],
    usage: [
      'Используйте как единый error-contract между validators, dropzone flows и UI-сообщениями.',
      'На уровне интерфейса лучше опираться на `issues[].code`, а `message` держать как fallback.',
    ],
    caveats: [
      'Не завязывайте бизнес-логику только на текст `message` — стабильнее опираться на `code` и `meta`.',
      'Mixed pipelines могут возвращать несколько issues сразу, поэтому UI должен уметь отрисовать список.',
    ],
    integrationNotes: [
      'Особенно полезен в сочетании с `vDropzone` и `DsFileUpload`, где validation errors нужно сразу показать пользователю.',
      'Подходит как boundary object между reusable validators и feature-specific error presentation.',
    ],
  },
  acceptValidator: {
    overview: [
      '`acceptValidator` превращает строку `accept` в полноценный validator с понятными issues и кодом ошибки `accept`.',
      'Это удобный bridge между нативным `accept`-атрибутом и структурированным UI, которому нужен не только boolean, но и объяснимая причина отказа.',
    ],
    examples: createReadyExamples([
      {
        id: 'accept-validator-preview',
        title: 'Validate the same rules as native input',
        description: 'Один validator покрывает сценарии с расширениями, MIME-типами и wildcard-паттернами, сохраняя совместимость со строкой `accept`.',
        previewKey: 'accept-validator-preview',
        code: [
          "import { acceptValidator } from '@feugene/granularity/fileValidation'",
          '',
          "const validator = acceptValidator('.pdf,image/*')",
          'const issues = validator({',
          '  files,',
          "  source: 'input',",
          '  multiple: true,',
          "  accept: '.pdf,image/*',",
          '})',
        ].join('\n'),
        note: 'Подходит, когда нужно отобразить причину отклонения файла в UI, а не просто молча игнорировать его.',
      },
    ]),
    apiSections: [
      {
        key: 'parameters',
        title: 'Parameters',
        origin: 'manual',
        items: [
          { name: 'accept', type: 'string | undefined', description: 'Та же строка правил, которую вы бы передали в `<input type="file" accept="…">`.' },
        ],
      },
      {
        key: 'returns',
        title: 'Returns / Errors',
        origin: 'manual',
        items: [
          { name: 'validator', type: 'FileValidator', description: 'Возвращает validator, который добавляет issues с кодом `accept` для несовпавших файлов.' },
        ],
      },
    ],
    usage: [
      'Используйте, когда accept-правила должны совпадать с браузерным input-flow, но ошибки нужно показать в собственном UI.',
      'Хорошо работает как первый шаг в pipeline перед более специфичными validators по размеру и бизнес-правилам.',
    ],
    caveats: [
      'Validator не нормализует список файлов и не учитывает single/multi режим — это зона ответственности `runFileValidators`.',
      'Если accept-строка пустая, validator становится no-op и не создаёт issues.',
    ],
    integrationNotes: [
      'Практический сценарий — использовать ту же строку `accept`, что и в `DsFileUpload`, чтобы UI и validator pipeline расходились как можно меньше.',
      'В паре с `FileValidationError` удобно преобразуется в список человекочитаемых upload-errors.',
    ],
  },
  allowedExtensionsValidator: {
    overview: [
      '`allowedExtensionsValidator` вводит явный allow-list по расширениям файлов и возвращает issues с кодом `extension`.',
      'Он полезен там, где доменная логика опирается именно на расширения: шаблоны документов, выгрузки, архивы и legacy flows с ненадёжным MIME.',
    ],
    examples: createReadyExamples([
      {
        id: 'allowed-extensions-validator-preview',
        title: 'Lock uploads to known extensions',
        description: 'Validator нормализует `.pdf`/`pdf` и делает allow-list стабильным даже при разной форме конфигурации.',
        previewKey: 'allowed-extensions-validator-preview',
        code: [
          "import { allowedExtensionsValidator } from '@feugene/granularity/fileValidation'",
          '',
          "const validator = allowedExtensionsValidator(['pdf', '.png'])",
          'const issues = validator({ files, source: "drop", multiple: true })',
        ].join('\n'),
      },
    ]),
    apiSections: [
      {
        key: 'parameters',
        title: 'Parameters',
        origin: 'manual',
        items: [
          { name: 'exts', type: 'string[]', description: 'Разрешённые расширения без учёта регистра; точки в начале необязательны.' },
        ],
      },
      {
        key: 'returns',
        title: 'Returns / Errors',
        origin: 'manual',
        items: [
          { name: 'validator', type: 'FileValidator', description: 'Возвращает issues с кодом `extension` для файлов с запрещённым расширением.' },
        ],
      },
    ],
    usage: [
      'Подходит для бизнес-flow, где список форматов важнее MIME и должен оставаться читаемым в конфигурации.',
      'Часто сочетается с `allowedMimeTypesValidator`, когда нужен и UX-friendly accept, и строгий серверный контракт.',
    ],
    caveats: [
      'Файлы без расширения пропускаются; если их нужно запрещать, добавьте дополнительный кастомный validator.',
      'Одно лишь расширение не гарантирует содержимое файла, поэтому для security-sensitive сценариев его стоит сочетать с server-side проверкой.',
    ],
    integrationNotes: [
      'Особенно полезен для `DsFileUpload`, когда браузер отдаёт fallback MIME и решение нужно принять по имени файла.',
      'Может быть fallback-слоем рядом с `allowedMimeTypesValidator({ allowFallbackByExtension: true })`.',
    ],
  },
  allowedMimeTypesValidator: {
    overview: [
      '`allowedMimeTypesValidator` проверяет MIME allow-list и возвращает issues с кодом `mimeType`, если тип файла не вписывается в допустимый набор.',
      'Это основной validator для сценариев, где backend или storage policy задают строгий MIME-контракт.',
    ],
    examples: createReadyExamples([
      {
        id: 'allowed-mime-types-validator-preview',
        title: 'Combine strict MIME rules with fallback strategy',
        description: 'Demo показывает разницу между строгой MIME-проверкой и режимом, где fallback-тип можно доразрешить по расширению.',
        previewKey: 'allowed-mime-types-validator-preview',
        code: [
          "import { allowedMimeTypesValidator } from '@feugene/granularity/fileValidation'",
          '',
          'const validator = allowedMimeTypesValidator(',
          "  ['image/png', 'application/pdf'],",
          '  { allowFallbackByExtension: false },',
          ')',
        ].join('\n'),
      },
    ]),
    apiSections: [
      {
        key: 'parameters',
        title: 'Parameters',
        origin: 'manual',
        items: [
          { name: 'allowed', type: 'string[]', description: 'Список допустимых MIME-типов.' },
          { name: 'options.allowFallbackByExtension', type: 'boolean | undefined', description: 'Если `false`, fallback MIME (`""`/`application/octet-stream`) тоже становится ошибкой.' },
        ],
      },
      {
        key: 'returns',
        title: 'Returns / Errors',
        origin: 'manual',
        items: [
          { name: 'validator', type: 'FileValidator', description: 'Возвращает issues с кодом `mimeType` для неподходящих или fallback MIME-типов.' },
        ],
      },
    ],
    usage: [
      'Используйте для строгих upload-политик, когда список MIME фиксирован и должен совпадать с backend expectations.',
      'Сочетайте с `allowedExtensionsValidator`, если часть клиентов отдаёт fallback MIME, но имена файлов можно доверять как secondary signal.',
    ],
    caveats: [
      'Некоторые браузеры и ОС возвращают fallback MIME, поэтому слишком строгий режим может отклонять валидные файлы до серверной проверки.',
      'Сравнение идёт по exact MIME-строкам; wildcard-паттерны здесь не поддерживаются — для этого лучше использовать `acceptValidator`.',
    ],
    integrationNotes: [
      'Полезен в `DsFileUpload` и custom dropzone flows, когда upload UI должен заранее объяснить mismatch между файлом и backend policy.',
      'В show-case сценариях удобно показывать рядом strict MIME и fallback-by-extension режим, чтобы команда понимала компромисс UX vs строгость.',
    ],
  },
  normalizeFiles: {
    overview: [
      '`normalizeFiles` приводит входной список файлов к контракту `multiple/single`, чтобы следующие шаги пайплайна работали с предсказуемым набором данных.',
      'Это низкоуровневый helper для случаев, когда нужно разделить выбор файла и дальнейшую валидацию/загрузку.',
    ],
    examples: createReadyExamples([
      {
        id: 'normalize-files-contract',
        title: 'Respect single-file mode',
        description: 'В single-mode helper оставляет только первый файл, даже если браузер/drag-drop отдали массив длиннее одного элемента.',
        code: [
          "import { normalizeFiles } from '@feugene/granularity/fileValidation'",
          '',
          'const picked = normalizeFiles(files, false)',
          '// => только первый файл',
        ].join('\n'),
      },
    ]),
    apiSections: [
      {
        key: 'parameters',
        title: 'Parameters',
        origin: 'manual',
        items: [
          { name: 'files', type: 'File[]', description: 'Исходный список файлов.' },
          { name: 'multiple', type: 'boolean', description: 'Флаг множественного выбора.' },
        ],
      },
      {
        key: 'returns',
        title: 'Returns',
        origin: 'manual',
        items: [
          { name: 'files', type: 'File[]', description: 'Нормализованный массив: весь список или только первый файл.' },
        ],
      },
    ],
    usage: [
      'Применяйте перед кастомной загрузкой, если у вас есть raw `File[]`, но режим UI ограничен одним файлом.',
    ],
    caveats: [
      'Helper не валидирует сами файлы — только нормализует их количество.',
    ],
    integrationNotes: [
      'Чаще всего используется внутри `runFileValidators`, но может быть полезен и в custom upload workflows.',
    ],
  },
  runFileValidators: {
    overview: [
      '`runFileValidators` запускает pipeline из валидаторов и возвращает и нормализованный список файлов, и собранные issues одним результатом.',
      'Функция подходит как для input-flow, так и для drop-flow, потому что принимает контекст `source/multiple/accept`.',
    ],
    examples: createReadyExamples([
      {
        id: 'run-file-validators-pipeline',
        title: 'Compose validator pipeline',
        description: 'Один вызов объединяет accept-правила, size validators и возвращает предсказуемый shape `{ files, issues }`.',
        previewKey: 'run-file-validators-pipeline',
        code: [
          'const result = await runFileValidators(files, [',
          '  maxFileSizeBytesValidator(512_000),',
          '  maxTotalSizeBytesValidator(1_500_000),',
          '], {',
          "  source: 'input',",
          '  multiple: true,',
          "  accept: '.pdf,image/*',",
          '})',
          '',
          'console.log(result.files, result.issues)',
        ].join('\n'),
        note: 'Даже если validators нет, функция всё равно возвращает нормализованный результат с `issues: []`.',
      },
    ]),
    apiSections: [
      {
        key: 'parameters',
        title: 'Parameters',
        origin: 'manual',
        items: [
          { name: 'files', type: 'File[]', description: 'Исходный набор файлов из input/drop flow.' },
          { name: 'validators', type: 'FileValidator[] | undefined', description: 'Массив sync/async валидаторов.' },
          { name: 'context', type: 'FileValidatorContext', description: 'Контекст с `source`, `multiple` и optional `accept`.' },
        ],
      },
      {
        key: 'returns',
        title: 'Returns / Errors',
        origin: 'manual',
        items: [
          { name: 'files', type: 'File[]', description: 'Нормализованный список файлов после учёта `multiple`.' },
          { name: 'issues', type: 'FileValidationIssue[]', description: 'Агрегированный результат всех валидаторов.' },
          { name: 'async contract', type: 'RunFileValidatorsResult | Promise<RunFileValidatorsResult>', description: 'Если хотя бы один валидатор async, весь вызов становится async.' },
        ],
      },
    ],
    usage: [
      'Используйте как основной orchestration helper для file-validation pipeline.',
      'Сначала анализируйте `issues`, а уже потом передавайте `files` в upload/preview flow.',
    ],
    caveats: [
      'Функция не выбрасывает `FileValidationError` сама по себе — она только возвращает `issues`.',
      'Порядок validators важен, если UI потом группирует сообщения в исходной последовательности.',
    ],
    integrationNotes: [
      'Отлично сочетается с `vDropzone`, `DsFileUpload` и custom input handlers.',
      'Возвращаемый shape `{ files, issues }` удобно напрямую пробрасывать в UI-слой загрузки.',
    ],
  },
  matchAccept: {
    overview: [
      '`matchAccept` — низкоуровневый helper для проверки accept-правил вида `.ext`, exact MIME и wildcard `type/*`.',
      'Полезен, когда нужно быстро проверить конкретный файл до запуска полного validator pipeline.',
    ],
    examples: createReadyExamples([
      {
        id: 'match-accept-helper',
        title: 'Check accept rules directly',
        description: 'Helper понимает и расширения, и MIME-паттерны, поэтому подходит для custom preflight checks.',
        code: [
          "import { matchAccept } from '@feugene/granularity/fileValidation'",
          '',
          'matchAccept(new File(["demo"], "report.pdf", { type: "application/pdf" }), ".pdf,image/*")',
        ].join('\n'),
      },
    ]),
    apiSections: [
      {
        key: 'parameters',
        title: 'Parameters',
        origin: 'manual',
        items: [
          { name: 'file', type: 'File', description: 'Проверяемый файл.' },
          { name: 'accept', type: 'string', description: 'Строка accept-правил из input/file upload контекста.' },
        ],
      },
      {
        key: 'returns',
        title: 'Returns',
        origin: 'manual',
        items: [
          { name: 'matches', type: 'boolean', description: '`true`, если файл удовлетворяет хотя бы одному правилу accept.' },
        ],
      },
    ],
    usage: [
      'Используйте для тонких preflight-проверок или when-you-need just a boolean без полного validator contract.',
    ],
    caveats: [
      'При mixed mime/extensions правилах важно помнить, что helper лишь проверяет совпадение, а не сообщает подробные причины отказа.',
    ],
    integrationNotes: [
      'Для пользовательских ошибок в UI обычно удобнее `acceptValidator`, а `matchAccept` оставлять низкоуровневой утилитой.',
    ],
  },
  maxFileSizeBytesValidator: {
    overview: [
      '`maxFileSizeBytesValidator` проверяет максимальный размер каждого файла по отдельности в байтах.',
      'Это самый точный per-file validator, когда лимит известен как backend/API constraint.',
    ],
    examples: createReadyExamples([
      {
        id: 'max-file-size-bytes-validator',
        title: 'Per-file byte limit',
        description: 'Каждый файл сравнивается с лимитом независимо от остальных.',
        code: [
          "import { maxFileSizeBytesValidator } from '@feugene/granularity/fileValidation'",
          '',
          'const validator = maxFileSizeBytesValidator(512_000)',
        ].join('\n'),
      },
    ]),
    apiSections: [
      {
        key: 'parameters',
        title: 'Parameters',
        origin: 'manual',
        items: [
          { name: 'maxBytes', type: 'number', description: 'Максимальный допустимый размер одного файла в байтах.' },
        ],
      },
      {
        key: 'returns',
        title: 'Returns / Errors',
        origin: 'manual',
        items: [
          { name: 'validator', type: 'FileValidator', description: 'Возвращает issues с кодом `maxFileSize` для слишком больших файлов.' },
        ],
      },
    ],
    usage: [
      'Используйте, когда лимит приходит из backend или документации уже в байтах.',
    ],
    caveats: [
      'Не контролирует суммарный размер нескольких файлов — для этого нужен `maxTotalSizeBytesValidator`.',
    ],
    integrationNotes: [
      'Хорошая базовая пара для `maxTotalSizeBytesValidator` в multi-upload сценариях.',
    ],
  },
  maxSizeMbValidator: {
    overview: [
      '`maxSizeMbValidator` — удобная обёртка над per-file size limit, когда лимит проще задавать в мегабайтах.',
      'По смыслу он близок к `maxFileSizeBytesValidator`, но лучше читается в UI/configuration слоях.',
    ],
    examples: createReadyExamples([
      {
        id: 'max-size-mb-validator',
        title: 'Readable megabyte limit',
        description: 'Тот же per-file лимит, но в более удобной конфигурационной форме.',
        code: [
          "import { maxSizeMbValidator } from '@feugene/granularity/fileValidation'",
          '',
          'const validator = maxSizeMbValidator(2)',
        ].join('\n'),
      },
    ]),
    apiSections: [
      {
        key: 'parameters',
        title: 'Parameters',
        origin: 'manual',
        items: [
          { name: 'maxMb', type: 'number', description: 'Максимальный размер одного файла в мегабайтах.' },
        ],
      },
      {
        key: 'returns',
        title: 'Returns / Errors',
        origin: 'manual',
        items: [
          { name: 'validator', type: 'FileValidator', description: 'Возвращает issues с кодом `maxSize` для превышения лимита.' },
        ],
      },
    ],
    usage: [
      'Подходит для продуктовых конфигов и docs, где лимит обычно обсуждается в мегабайтах.',
    ],
    caveats: [
      'По-прежнему работает per-file; aggregate-limit нужно задавать отдельно.',
    ],
    integrationNotes: [
      'Удобен в demos и UI-конфигах, где `2 MB` читается лучше, чем `2_097_152 bytes`.',
    ],
  },
  maxTotalSizeBytesValidator: {
    overview: [
      '`maxTotalSizeBytesValidator` проверяет суммарный размер всех файлов в одном batch, а не каждый файл по отдельности.',
      'Это ключевое отличие от `maxFileSizeBytesValidator` и `maxSizeMbValidator`, которые смотрят на отдельный файл.',
    ],
    examples: createReadyExamples([
      {
        id: 'max-total-size-validator',
        title: 'Aggregate upload budget',
        description: 'Даже если каждый файл отдельно проходит лимит, batch может быть отклонён из-за общего размера.',
        code: [
          "import { maxTotalSizeBytesValidator } from '@feugene/granularity/fileValidation'",
          '',
          'const validator = maxTotalSizeBytesValidator(1_500_000)',
        ].join('\n'),
      },
    ]),
    apiSections: [
      {
        key: 'parameters',
        title: 'Parameters',
        origin: 'manual',
        items: [
          { name: 'maxBytes', type: 'number', description: 'Максимальный совокупный размер batch в байтах.' },
        ],
      },
      {
        key: 'returns',
        title: 'Returns / Errors',
        origin: 'manual',
        items: [
          { name: 'validator', type: 'FileValidator', description: 'Возвращает issues с кодом `maxTotalSize`, если суммарный размер превышает лимит.' },
        ],
      },
    ],
    usage: [
      'Используйте для multi-file uploads, где backend ограничивает общий вес пакета.',
    ],
    caveats: [
      'Не подменяет per-file validators: batch может пройти общий лимит, но отдельный файл всё равно быть слишком большим.',
    ],
    integrationNotes: [
      'Лучшая практика — комбинировать с per-file validator и показывать пользователю оба класса ошибок.',
    ],
  },
}