import { defineGranumConfig } from '@feugene/granum/vite'
import { windEngine } from '@feugene/granum-engine-wind'

/** Ровно один компонент: его граф granum развернёт сам по манифесту пакета. */
export const playground5GranularityComponents = ['GrButton'] as const

/**
 * Конфиг приложения для granum.
 *
 * Провайдер подключается по имени пакета: плагин найдёт
 * `dist/granum.manifest.json` через `exports` и возьмёт оттуда классы
 * компонента, потребляемые токены, файлы темы и CSS. Сканировать
 * `node_modules` ему не нужно — этого канала в granum нет.
 *
 * `appSources` обязателен: классы разметки самого приложения granum берёт
 * отсюда, а без них утилиты `App.vue` не попали бы в CSS.
 *
 * `engine` тоже обязателен и принимает инстанс: движок утилит выбирает
 * приложение, granum своей реализации не имеет. Словарь обязан совпадать с тем,
 * который объявил пакет, иначе классы компонентов придётся пересчитывать, а
 * часть из них останется без правил.
 */
export default defineGranumConfig({
  engine: windEngine(),
  providers: ['@feugene/granularity'],
  components: [
    {
      provider: '@feugene/granularity',
      names: [...playground5GranularityComponents],
    },
  ],
  appSources: { dirs: ['src'] },
})
