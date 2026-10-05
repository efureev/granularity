import { splitClassTokens } from '../shared/classTokens'
import { autocompleteOptionEnabledClass } from './grAutocompleteStyles'

// В рантайме собирается один класс — наведение на опцию панели:
// `grAutocompleteStyles.ts` клеит его шаблоном `hover:${autocompleteOptionHighlight}`,
// и целиком он не лежит ни в одной строке кода. Всё остальное — литералы шаблона,
// `grAutocompleteStyles.ts` и общих модулей `shared/`: granum извлекает их сам из
// чанков компонента, включая общие.
export const grAutocompleteSafelist: string[] = splitClassTokens(autocompleteOptionEnabledClass)
