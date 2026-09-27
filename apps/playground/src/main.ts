import {installGranularityDevtools} from '@feugene/granularity-devtools'
import {createApp} from 'vue'

import App from './App.vue'

// Вариант 1: foundation-only слой пакета.
// import '@granularity-foundation'
// import './styles/light-app.css'

// Вариант 2: полный пакетный CSS.
// import '@granularity-styles'
// import './styles/light-app.css'

// Вариант 3: granular-подключение только кнопки.
// В built `@granularity-button-css` уже включены foundation-слой пакета, utility-стили кнопки
// и встроенные темы `light`/`dark`.
// import '@granularity-button-css'
// import './styles/light-app.css'

// Вариант 4: подключение через granum.
// Токены, база, встроенные темы `light`/`dark`, CSS выбранных компонентов и
// утилиты разметки приезжают одним виртуальным модулем, пятью каскадными
// слоями; селекция задана в `apps/playground/granum.config.ts`.
import '@unocss/reset/tailwind-compat.css'
import 'virtual:granum.css'
// Тема стенда — нелейерный CSS, поэтому по правилам каскада она выигрывает у
// любого слоя granum независимо от порядка импортов. Раньше порядок решал всё:
// базовые токены пакета эмитились последними внутри одного слоя и перебивали
// тему, подключённую раньше.
import './styles/light-app.css'

const app = createApp(App)

// Гард на стороне вызывающего снимает из прод-бандла и сам вызов: рантайм-гард
// внутри пакета оставил бы мёртвую функцию, потому что её всё равно зовут.
if (import.meta.env.DEV) {
    app.use(installGranularityDevtools())
}

app.mount('#app')