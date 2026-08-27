import {
    defineConfig,
    presetAttributify,
    presetIcons,
    presetMini,
    transformerDirectives,
    transformerVariantGroup,
} from 'unocss'

import {
    granularContent,
    presetGranularNode,
    type PresetGranularNodeOptions,
} from '@feugene/unocss-preset-granular/node'
import granularityProvider from '@feugene/granularity/granular-provider/node'

/**
 * Компоненты, для которых пресет генерирует CSS.
 *
 * Список обязан совпадать с тем, что стенд реально рендерит: `presetGranularNode`
 * собирает утилиты и safelist ровно по нему. Пока здесь была одна кнопка, у
 * `GrModal` не находилось правил для `shadow-[var(--gr-shadow-2)]` и
 * `overflow-hidden`, а у триггера `GrSelect` — для
 * `rounded-[var(--gr-radius-control)]`: окно рисовалось без панели, иконки
 * селекта вываливались под поле. Симптом ровно тот, что описан в
 * `.claude/docs/fix-workflow.md` как промах safelist — «размеры работают, цвета
 * прозрачные».
 */
const granularPresetComponents = [
    'GrButton',
    'GrDialog',
    'GrModal',
    'GrPromptDialog',
    'GrSelect',
] as const

const granularOptions: PresetGranularNodeOptions = {
    providers: [granularityProvider],
    components: [
        {provider: '@feugene/granularity', names: [...granularPresetComponents]},
    ],
    /**
     * Тема приложения подключается **импортом** в `main.ts`, а не отсюда.
     *
     * Проверено на этом стенде, чтобы не гадать:
     *
     *  - `themes.tokensFile` — замена `tokens.css` провайдера целиком. Прежняя
     *    версия конфига подставляла туда `light-app.css` из двух десятков
     *    переменных, и вся шкала радиусов исчезала: `GrModal` рисовался с
     *    прямыми углами, `rounded-*` сворачивался в ноль;
     *  - `themes.tokenOverrides` перебивает токены **тем** (цепочка в
     *    `themes-and-tokens.md`: provider.tokenDefinitions → component →
     *    define → tokenOverrides), а `--gr-primary` объявлен в базовом
     *    `tokens.css`, который эмитится последним. В `__uno.css` это видно
     *    буквально: override на строке 368, канон — на 416, оба в слое
     *    `granular`, побеждает второй.
     *
     * Для базовых токенов остаётся каскад: файл, подключённый после
     * `virtual:uno.css`, выигрывает по порядку. Так же устроена витрина.
     */
}

export default defineConfig({
    content: granularContent(granularOptions),
    presets: [
        presetMini(),
        presetGranularNode(granularOptions),
        presetAttributify(),
        presetIcons({
            scale: 1.05,
            extraProperties: {
                display: 'inline-block',
            },
        }),
    ],
    transformers: [
        transformerDirectives(),
        transformerVariantGroup(),
    ],
})
