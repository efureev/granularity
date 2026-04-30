import type {App, Component, Directive, Plugin} from 'vue'

/**
 * Лёгкий контейнер, который может быть зарегистрирован в Vue:
 * - SFC-компонент (Vue сам компилирует `__name` из имени файла) — достаточно просто передать сам компонент,
 * - SFC-компонент с опциональным `install` (по аналогии с Element Plus / Naive UI),
 * - объект с собственным `install`,
 * - либо объект `{ name, component }`, если имя нужно задать явно.
 */
export type GranularityInstallableComponent =
    | (Component & { name?: string; __name?: string; install?: (app: App) => void })
    | { install: (app: App) => void }
    | { name: string; component: Component }

/**
 * Директива — либо пара `{ name, directive }`, либо объект с `install`.
 */
export type GranularityInstallableDirective =
    | { name: string; directive: Directive }
    | { install: (app: App) => void }

export interface CreateGranularityOptions {
    /**
     * Список компонентов для глобальной регистрации.
     * Пакет сам по себе ничего не импортирует — пользователь передаёт сюда только те компоненты,
     * которые ему действительно нужны. За счёт этого tree-shaking остаётся полным.
     */
    components?: GranularityInstallableComponent[]
    /**
     * Список директив. Передавайте ровно те, что нужны, по аналогии с компонентами.
     */
    directives?: GranularityInstallableDirective[]
    /**
     * Произвольные `provide`-значения. Ключи могут быть `symbol` или строкой.
     * Пакет не навязывает конкретные ключи (например, i18n) — выбор за пользователем.
     */
    provides?: Array<{ key: string | symbol; value: unknown }>
    /**
     * Произвольные `app.config.globalProperties` — по умолчанию ничего не ставим.
     */
    globalProperties?: Record<string, unknown>
}

/**
 * Вспомогательная обёртка: превращает произвольный компонент в `GranularityInstallableComponent`
 * с явным именем регистрации.
 *
 * ```ts
 * import { GrButton } from '@feugene/granularity/components/GrButton'
 * import { defineInstallable } from '@feugene/granularity/vue'
 *
 * const installable = defineInstallable(GrButton, 'GrButton')
 * ```
 */
export function defineInstallable<T extends Component>(component: T, name: string): GranularityInstallableComponent {
    return {
        install(app: App) {
            app.component(name, component)
        },
    }
}

function installComponent(app: App, c: GranularityInstallableComponent): void {
    if (typeof (c as any).install === 'function') {
        ;(c as any).install(app)
        return
    }

    // Форма `{ name, component }` — явное указание имени для произвольного компонента.
    // Допускаем как object-компоненты (SFC / options), так и functional-компоненты.
    if (
        typeof (c as any).name === 'string'
        && (c as any).component
        && (typeof (c as any).component === 'object' || typeof (c as any).component === 'function')
    ) {
        const {name, component} = c as { name: string; component: Component }
        app.component(name, component)
        return
    }

    // SFC: Vue 3 компилирует имя компонента из имени файла в поле `__name`
    // (например, `GrButton.vue` → `__name: 'GrButton'`). Также поддерживаем явное `name`.
    const resolvedName
        = (c as Component & { name?: string }).name
            ?? (c as { __name?: string }).__name
    if (resolvedName) {
        app.component(resolvedName, c as Component)
        return
    }

    // Сознательно без throw — просто сообщаем в dev-режиме.
    // eslint-disable-next-line no-console
    console.warn('[granularity] component passed to createGranularity has no `install`, `name`, or `__name` — skipped.')
}

function installDirective(app: App, d: GranularityInstallableDirective): void {
    if ('install' in d && typeof d.install === 'function') {
        d.install(app)
        return
    }

    if ('name' in d && 'directive' in d) {
        app.directive(d.name, d.directive)
        return
    }

    // Сознательно без throw — согласовано с `installComponent`.
    // eslint-disable-next-line no-console
    console.warn('[granularity] directive passed to createGranularity has no `install` or `{ name, directive }` — skipped.')
}

/**
 * Применяет опции к переданному приложению. Экспортируется отдельно от фабрики —
 * удобно, когда плагин не нужен (например, в тестах).
 */
export function installGranularity(app: App, options: CreateGranularityOptions = {}): void {
    for (const c of options.components ?? [])
        installComponent(app, c)

    for (const d of options.directives ?? [])
        installDirective(app, d)

    for (const {key, value} of options.provides ?? [])
        app.provide(key as any, value)

    if (options.globalProperties) {
        for (const [key, value] of Object.entries(options.globalProperties))
            app.config.globalProperties[key] = value
    }
}

/**
 * Создаёт Vue-плагин `{ install }`, который при `app.use(...)` зарегистрирует переданные
 * компоненты, директивы и provide-значения. Сам модуль НЕ импортирует ни компонентов,
 * ни директив из пакета — всё приходит снаружи. Это сохраняет гранулярность:
 * бандлер увидит только те символы, которые вы реально передали.
 *
 * ```ts
 * import { createApp } from 'vue'
 * import { createGranularity } from '@feugene/granularity/vue'
 * import { GrButton } from '@feugene/granularity/components/GrButton'
 * import { GrInput }  from '@feugene/granularity/components/GrInput'
 * import { vHotkey }  from '@feugene/granularity/directives/hotkey'
 *
 * createApp(App)
 *   .use(createGranularity({
 *     // Достаточно передать сами компоненты — имя будет взято из `__name` (Vue SFC)
 *     // или из `name`; можно также указать явно через `{ name, component }`.
 *     components: [GrButton, GrInput],
 *     directives: [{ name: 'hotkey', directive: vHotkey }],
 *   }))
 *   .mount('#app')
 * ```
 */
export function createGranularity(options: CreateGranularityOptions = {}): Plugin {
    return {
        install(app: App) {
            installGranularity(app, options)
        },
    }
}
