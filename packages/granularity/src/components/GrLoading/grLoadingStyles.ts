import { splitClassTokens } from '../shared/classTokens'

/**
 * Полноэкранный оверлей сидит на собственном слое шкалы: он блокирует всё
 * приложение целиком, поэтому обязан лечь выше модалки (`--gr-z-modal`), но
 * ниже тоста — уведомление о фоновой ошибке загрузка прятать не должна.
 * Инлайновый режим к шкале отношения не имеет: `z-10` — порядок внутри
 * собственного контейнера.
 */
export const rootModeClass = {
    fullscreen: 'fixed inset-0 z-[var(--gr-z-loading)]',
    inline: 'absolute inset-0 z-10',
} as const
export const rootBackgroundClass = 'bg-[var(--gr-overlay-bg)]'
export const rootBackdropBlurClass = 'backdrop-blur-sm'

export function grLoadingRootClass(options: {
    fullscreen: boolean,
    hasBackground: boolean,
    customClass?: string
}): string {
    return [
        options.fullscreen ? rootModeClass.fullscreen : rootModeClass.inline,
        !options.hasBackground ? rootBackgroundClass : '',
        rootBackdropBlurClass,
        options.customClass,
    ]
        .filter(Boolean)
        .join(' ')
}

export const grLoadingClassTokens = [
    ...Object.values(rootModeClass).flatMap(splitClassTokens),
    ...splitClassTokens(rootBackgroundClass),
    ...splitClassTokens(rootBackdropBlurClass),
]
