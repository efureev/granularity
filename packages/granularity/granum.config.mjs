import { windEngine } from '@feugene/granum-engine-wind'

/**
 * Конфиг для `granum doctor` и прочих команд CLI на самом пакете.
 *
 * Провайдер берётся по имени пакета: CLI найдёт `dist/granum.manifest.json`
 * через `exports`, то есть проверит то, что отгружается, а не исходники.
 * `components: 'all'` обязательно: источником проверки служат только выбранные
 * компоненты, и с любой другой селекцией доктор проверит лишь её замыкание.
 *
 * Движок тот же, которым пакет собран: доктор на другом словаре показал бы
 * расхождение диалектов вместо состояния пакета.
 */
export default {
  providers: ['@feugene/granularity'],
  engine: windEngine(),
  components: 'all',
}
