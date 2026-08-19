import { enableAutoUnmount } from '@vue/test-utils'
import { afterEach } from 'vitest'

import { resetGranularityDom } from '@feugene/granularity/testing'

/**
 * Уборка за монтированием — устройством, а не дисциплиной.
 *
 * Пакет монтирует в `document.body` (форме нужен настоящий документ: фокус,
 * прокрутка к невалидному полю), и до сих пор часть файлов размонтировала за
 * собой руками, а часть — нет. Узлы предыдущего теста оставались в документе, и
 * следующий находил по селектору чужую разметку.
 *
 * `enableAutoUnmount` ловит **любое** монтирование, включая инлайновые вызовы
 * `mount` мимо локальных хелперов, — поэтому он, а не обёртка над `mount`:
 * обёртка убирала бы только за собой.
 */
enableAutoUnmount(afterEach)

afterEach(resetGranularityDom)
