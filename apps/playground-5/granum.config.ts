import { defineGranumConfig } from '@feugene/granum/vite'

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
 */
export default defineGranumConfig({
  providers: ['@feugene/granularity'],
  components: [
    {
      provider: '@feugene/granularity',
      names: [...playground5GranularityComponents],
    },
  ],
  appSources: { dirs: ['src'] },
})
