import { splitClassTokens } from '../shared/classTokens'
import { selectOptionEnabledClass } from './grSelectStyles'

// В рантайме собирается один класс — наведение на опцию панели: `grSelectStyles.ts`
// клеит его шаблоном `hover:${selectOptionHighlight}`, и целиком он не лежит ни в
// одной строке кода. Всё остальное — литералы шаблона, `grSelectStyles.ts` и общих
// модулей `shared/`: granum извлекает их сам из чанков компонента, включая общие.
export const grSelectSafelist: string[] = splitClassTokens(selectOptionEnabledClass)
