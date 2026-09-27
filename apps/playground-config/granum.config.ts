import { defineGranumConfig } from '@feugene/granum/vite'
import { windEngine } from '@feugene/granum-engine-wind'

/**
 * Ровно те компоненты, которые импортирует приложение: гранулярность
 * проверяется заодно — дефолты `GrConfigProvider` не должны тянуть в CSS ничего
 * лишнего.
 */
export const playgroundConfigComponents = ['GrButton', 'GrInput', 'GrBadge', 'GrConfigProvider'] as const

/**
 * Конфиг приложения для granum.
 *
 * Провайдер подключается по имени пакета: плагин найдёт
 * `dist/granum.manifest.json` через `exports` и возьмёт оттуда классы
 * компонентов, потребляемые токены, файлы темы и CSS. Сканировать
 * `node_modules` ему не нужно.
 *
 * `engine` обязателен и принимает инстанс: движок утилит выбирает приложение.
 * Словарь совпадает с объявленным у пакета, поэтому классы берутся из манифеста
 * без пересчёта.
 */
export default defineGranumConfig({
  engine: windEngine(),
  providers: ['@feugene/granularity'],
  components: [
    {
      provider: '@feugene/granularity',
      names: [...playgroundConfigComponents],
    },
  ],
  appSources: { dirs: ['src'] },
})
