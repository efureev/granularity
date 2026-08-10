import type { ShowcaseComponentExampleDoc } from '../types'

export const grResponseErrorBannerExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'response-error-banner-minimal',
    title: 'Минимум обвязки',
    description: 'Поймали ошибку запроса — отдали её баннеру. Разбирать ответ, выбирать тон и писать текст не нужно: HTTP 409 сам станет предупреждением с сообщением сервера и кнопкой повтора того же тона.',
    status: 'ready',
    previewKey: 'gr-response-error-banner-minimal',
  },
  {
    id: 'response-error-banner-presets',
    title: 'Универсальный баннер — пресеты ошибок',
    description: 'Классификация и отображение разных типов ошибок (network, abort, Laravel/JSON:API validation, RFC 7807, client/server, file validation, plain string) через `useResponseError()`. Фейковые классы ошибок в демо — стенд, а не часть обвязки: сниппет скрыт, минимальный вариант выше.',
    status: 'ready',
    previewKey: 'gr-response-error-banner-presets',
    hideCode: true,
  },
  {
    id: 'response-error-banner-kind-filter',
    title: 'Фильтрация по `kind` — баннер реагирует только на нужные ошибки',
    description: 'Whitelist через `autoHideKinds`: разрешаем `network` и `validation` (включая Laravel 422 с `errors`). Остальные ошибки (`client`, `server`, `aborted`) тихо проглатываются — `setRaw()` возвращает `null` и баннер не рендерится. Чекбоксы в демо позволяют менять whitelist на лету.',
    status: 'ready',
    previewKey: 'gr-response-error-banner-kind-filter',
    hideCode: true,
  },
  {
    id: 'response-error-banner-upload',
    title: 'GrUploadErrorBanner — пресет для загрузки файлов',
    description: 'Тонкая обёртка над `GrResponseErrorBanner` с текстами под «загрузка», `canRetry=true` и опциональным prop `files`, попадающим в payload события `retry`.',
    status: 'ready',
    previewKey: 'gr-response-error-banner-upload',
  },
  {
    id: 'response-error-banner-form',
    title: 'GrFormErrorBanner — пресет для формы',
    description: 'Обёртка для формы: `showFieldLabels=true`, `canRetry=false`, validation tone = warning, `fieldLabels` для человекочитаемых подписей полей в списке ошибок.',
    status: 'ready',
    previewKey: 'gr-response-error-banner-form',
  },
  {
    id: 'response-error-banner-fallback',
    title: 'Server message vs. classifier fallback',
    description: 'Сообщение подменяется переводом только тогда, когда его подставил сам классификатор (`isFallbackMessage`). Ответ сервера остаётся на экране, даже если его текст дословно совпал с дефолтным — прежнее опознание фолбэка сравнением строк выбрасывало такой ответ молча.',
    status: 'ready',
    previewKey: 'gr-response-error-banner-fallback',
  },
]
