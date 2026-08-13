import type { Ref } from 'vue'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { GrDashboardResponsiveLayout } from '../layout'
import { GR_DASHBOARD_LAYOUT_VERSION, parseLayout, serializeLayout } from '../layout'

/**
 * Куда пакет кладёт раскладку.
 *
 * Интерфейс, а не жёсткий `localStorage`: раскладка — часть профиля
 * пользователя, и на сервере ей место ровно так же часто, как в браузере.
 * Асинхронный транспорт заворачивается снаружи: `load` вызывается один раз
 * после монтирования, и приложение вправе отдать уже прочитанное значение.
 */
export interface GrDashboardLayoutStorage {
  load: (key: string) => string | null
  save: (key: string, value: string) => void
  remove: (key: string) => void
}

export interface UseDashboardLayoutOptions {
  /** Раскладка по умолчанию. Она же — результат `reset()`. */
  initial: GrDashboardResponsiveLayout
  storage?: GrDashboardLayoutStorage
  /** Ключ записи. Без него сохранение выключено. */
  key?: string
  version?: number
  /** Приведение чужой версии к текущей. Не задано — чужая версия отбрасывается. */
  migrate?: (raw: unknown, from: number | null) => GrDashboardResponsiveLayout | null
  /** Пауза перед записью, мс. */
  debounce?: number
}

export interface UseDashboardLayoutReturn {
  layout: Ref<GrDashboardResponsiveLayout>
  /** Попытка восстановления состоялась: до неё видна `initial`. */
  isRestored: Ref<boolean>
  reset: () => void
  /** Записать немедленно, не дожидаясь паузы. */
  flush: () => void
}

/**
 * Готовый адаптер поверх `localStorage`.
 *
 * Каждый вызов обёрнут в `try`: приватный режим Safari бросает на `setItem`
 * при исчерпании квоты, а уронить дашборд из-за несохранённой раскладки —
 * несоразмерно.
 */
export function localStorageLayoutStorage(): GrDashboardLayoutStorage {
  return {
    load: (key) => {
      try {
        return localStorage.getItem(key)
      }
      catch {
        return null
      }
    },
    save: (key, value) => {
      try {
        localStorage.setItem(key, value)
      }
      catch {}
    },
    remove: (key) => {
      try {
        localStorage.removeItem(key)
      }
      catch {}
    },
  }
}

/**
 * Раскладка, которая переживает перезагрузку.
 *
 * Хранилище **не читается в `setup`**: сервер и первый клиентский рендер
 * отдают `initial`, восстановление приходит в `onMounted`. Поэтому расхождения
 * гидрации нет по построению, а не по внимательности (`docs/ssr.md`, правило 6).
 */
export function useDashboardLayout(options: UseDashboardLayoutOptions): UseDashboardLayoutReturn {
  const layout = ref<GrDashboardResponsiveLayout>(options.initial)
  const isRestored = ref(false)

  const version = options.version ?? GR_DASHBOARD_LAYOUT_VERSION
  const delay = options.debounce ?? 300

  let timer: ReturnType<typeof setTimeout> | null = null
  let pending: GrDashboardResponsiveLayout | null = null

  function write(value: GrDashboardResponsiveLayout): void {
    if (!options.storage || !options.key) return

    options.storage.save(options.key, serializeLayout(value, version))
  }

  function flush(): void {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }

    if (!pending) return

    write(pending)
    pending = null
  }

  function schedule(value: GrDashboardResponsiveLayout): void {
    // Запись с паузой: жест меняет раскладку на каждой смене ячейки, и без неё
    // один перенос давал бы десяток обращений к хранилищу.
    pending = value
    if (timer !== null) clearTimeout(timer)

    timer = setTimeout(() => {
      timer = null
      const value = pending
      pending = null
      if (value) write(value)
    }, delay)
  }

  onMounted(() => {
    if (options.storage && options.key) {
      const restored = parseLayout(options.storage.load(options.key), { version, migrate: options.migrate })
      if (restored) layout.value = restored
    }

    isRestored.value = true
  })

  watch(layout, (value) => {
    // До восстановления не пишем: иначе первая же реакция затёрла бы
    // сохранённое значение раскладкой по умолчанию.
    if (!isRestored.value) return

    schedule(value)
  }, { deep: false })

  onBeforeUnmount(flush)

  function reset(): void {
    layout.value = options.initial
    if (options.storage && options.key) options.storage.remove(options.key)

    pending = null
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  return { layout, isRestored, reset, flush }
}
