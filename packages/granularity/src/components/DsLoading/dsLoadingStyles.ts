export const rootModeClass = {
    fullscreen: 'fixed inset-0 z-50',
    inline: 'absolute inset-0 z-10',
} as const
export const rootBackgroundClass = 'bg-black/25'
export const rootBackdropBlurClass = 'backdrop-blur-sm'

export function dsLoadingRootClass(options: {
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
