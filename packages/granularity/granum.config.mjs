import { windEngine } from '@feugene/granum-engine-wind'
import { GR_BASE_THEME_ID, grThemeCatalog } from '@feugene/granularity-tokens'

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
 *
 * Темы — весь каталог со всеми режимами: проверки тем (`component-mode-missing`,
 * `theme-mode-missing`, полнота `theme-incomplete`) идут по темам и режимам
 * сборки, а без `themes` granum собрал бы одну основную тему в её режиме по умолчанию.
 */
export default {
  providers: ['@feugene/granularity'],
  engine: windEngine(),
  components: 'all',
  themes: grThemeCatalog.map(theme => ({
    theme: theme.id,
    default: theme.id === GR_BASE_THEME_ID,
    modes: theme.modes.map(mode => mode.name),
  })),
}
