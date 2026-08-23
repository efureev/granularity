/**
 * Иконки плеера — inline-SVG внутри пакета, а не классы `i-lucide-*`.
 *
 * Класс генерирует не пакет, а UnoCSS-сборка приложения: у потребителя без
 * своего `presetIcons` на месте кнопки осталась бы пустота. Тем же приёмом
 * рисует иконки `granularity-editor`.
 */
export const playIconPath = 'M8 5v14l11-7z'
export const pauseIconPath = 'M6 5h4v14H6zM14 5h4v14h-4z'
export const volumeOnIconPath = 'M11 5 6 9H3v6h3l5 4zM16.5 12a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4'
export const volumeOffIconPath = 'M11 5 6 9H3v6h3l5 4zM22 9l-5 6M17 9l5 6'
export const fullscreenIconPath = 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5'
