// Весь CSS granum одним модулем: токены, база, режимы темы, CSS компонентов и
// утилиты — пятью каскадными слоями в фиксированном порядке. Блоки тем превью —
// отдельным листом (`css.previews: 'separate'`): его платит только страница с
// превью, и он кладёт их в тот же слой `themes`.
import 'virtual:granum.css'
import 'virtual:granum/previews.css'

export {}
