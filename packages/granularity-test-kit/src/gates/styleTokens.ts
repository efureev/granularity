import { describe, expect, it } from 'vitest'

import { offenders, readSources, stripComments, type SourceFile } from '../sources'

/** Утилиты кегля из шкалы `presetMini`: `text-sm` и соседи по лестнице. */
export const UNO_TEXT_SCALE = /(?<![\w-])text-(?:xs|sm|base|lg|xl|[2-9]xl)(?![\w-])/g

/**
 * Утилиты радиуса из шкалы `presetMini`, включая направленные (`rounded-l-md`).
 *
 * Lookbehind и lookahead отсекают то, что утилитой не является: проп
 * `rounded?: string` и его биндинг `:rounded="…"`, чтение того же пропа
 * `props.rounded`, значение `borderRadius: rounded` в объекте стиля, а также
 * уже переведённую форму `rounded-[var(--gr-radius-*)]`.
 */
export const UNO_RADIUS_SCALE = /(?<![\w:.-])(?<!:\s)rounded(?:-(?:[tblrse]|tl|tr|bl|br|ss|se|es|ee))?(?:-(?:none|sm|md|lg|xl|[2-9]xl|full))?(?![\w:?=[-])/g

export const PX_LITERAL_SCALE = /(?:text|rounded)-\[\d+(?:\.\d+)?px\]/g
export const UNO_DURATION_SCALE = /(?<![\w-])duration-\d+(?![\w-])/g
export const UNO_EASE_SCALE = /(?<![\w-])ease-(?:in-out|in|out|linear)(?![\w-])/g
export const MS_LITERAL = /(?<![\w.-])\d+ms(?![\w-])/g
/** Кегль, уже переведённый на токен: у него обязан быть парный межстрочный. */
export const TOKEN_TEXT_SCALE = /text-\[length:var\(--gr-(?:control-)?text-[\w-]+\)\]/

export interface StyleTokensGateOptions {
  /** Корень исходников; по умолчанию — `<cwd>/src`. */
  srcDir?: string
  /** Сгенерированные директории верхнего уровня — у ядра `styles` и `tokens`. */
  excludeTopDirs?: readonly string[]
  /**
   * Проверять, что токены движения и типографики действительно употребляются.
   * Пакету без собственной анимации это правило не подходит.
   */
  requireTokenUsage?: boolean
  /**
   * Требовать парный `leading-[…]` рядом с каждым кеглем-токеном.
   *
   * Флагом, а не безусловно: пакет переходит на парность целиком, одной
   * правкой, и до перехода гейт красил бы его в красный за чужой долг.
   */
  requirePairedLeading?: boolean
  /**
   * Файлы, где межстрочный задан осознанно и парная ступень навредила бы:
   * `leading-none` у клавиши `GrKbd` центрирует глиф в плашке, а вторая
   * декларация того же веса подралась бы с ним за порядок в стилях.
   *
   * Список, а не эвристика «в файле есть `leading-none`»: исключение обязано
   * быть видно в ревью, иначе им закроют случайный недосмотр.
   */
  pairedLeadingExceptions?: readonly string[]
}

/**
 * Гейт против «шкала есть, а в компонентах литералы».
 *
 * Кегли, радиусы, длительности и кривые объявлены токенами — и ровно поэтому
 * выглядят настраиваемыми. Пиксельный литерал или утилита `duration-150` этого
 * обещания не держат: тема их не видит. Проверка от исходников, а не от `dist`:
 * класс живёт в разметке, а CSS собирает потребитель своим конфигом.
 *
 * Отсутствие такого гейта у предшественника (`granularity-datepicker`) стоило
 * пакету жизни с `text-[14px]` и ссылкой на несуществующий токен.
 */
export function defineStyleTokensGate(options: StyleTokensGateOptions = {}): void {
  const sources: SourceFile[] = readSources({ dir: options.srcDir, excludeTopDirs: options.excludeTopDirs })
    .map(({ path, source }) => ({ path, source: stripComments(source) }))

  describe('стили берут значения из токенов', () => {
    it('кегли и радиусы — не пиксельные литералы', () => {
      expect(
        offenders(PX_LITERAL_SCALE, sources),
        'используй `text-[length:var(--gr-*-text-*)]` / `rounded-[var(--gr-radius-*)]`; нет ступени — заведи токен',
      ).toEqual([])
    })

    it('длительности анимаций — из `--gr-duration-*`', () => {
      expect(
        offenders(UNO_DURATION_SCALE, sources),
        'используй `duration-[var(--gr-duration-fast|base|slow)]`',
      ).toEqual([])
    })

    it('кривые ускорения — из `--gr-ease-*`', () => {
      expect(
        offenders(UNO_EASE_SCALE, sources),
        'используй `ease-[var(--gr-ease-out)]` / `ease-[var(--gr-ease-in)]`: кривые задаёт дизайн-система, а не пресет',
      ).toEqual([])
    })

    it('время в собственном CSS компонента — тоже токеном', () => {
      expect(
        offenders(MS_LITERAL, sources),
        'literal в `transition`/`animation` — на `var(--gr-duration-*)`',
      ).toEqual([])
    })

    /**
     * Утилита совпадает с токеном по значению — и ровно поэтому опаснее
     * литерала: выглядит она правильно, а тема её не видит. `text-sm` останется
     * 14px, даже если `--gr-text-sm` переопределён, и увидит это только тот,
     * кто соберёт приложение со своей типографикой.
     */
    it('кегли — не утилиты uno-шкалы', () => {
      expect(
        offenders(UNO_TEXT_SCALE, sources),
        'используй `text-[length:var(--gr-text-*|--gr-control-text-*)]` + парный `leading-[var(--gr-leading-*)]`',
      ).toEqual([])
    })

    it('радиусы — не утилиты uno-шкалы', () => {
      expect(
        offenders(UNO_RADIUS_SCALE, sources),
        'используй `rounded-[var(--gr-radius-*)]`; шаги uno сдвинуты — `rounded-md` это 6px, то есть `--gr-radius-control`',
      ).toEqual([])
    })

    /**
     * Кегль без межстрочного — половина решения: `line-height` тогда
     * наследуется от `body` приложения, причём абсолютным значением. Подпись
     * кеглем 10px получала интервал 24px, то есть 2.4, и выглядела разреженной
     * ровно настолько, насколько это решил чужой сброс стилей.
     *
     * Проверка построчная: класс-литерал живёт в одной строке, и соседняя
     * строка того же объекта — уже другая ступень со своей парой.
     */
    it.runIf(options.requirePairedLeading ?? false)('кегль идёт в паре с межстрочным', () => {
      const unpaired: string[] = []
      const exceptions = options.pairedLeadingExceptions ?? []

      for (const { path, source } of sources) {
        if (exceptions.some(allowed => path.endsWith(allowed))) continue

        source.split('\n').forEach((line, index) => {
          if (!TOKEN_TEXT_SCALE.test(line)) return
          // `leading-none` — осознанный выбор (клавиша, счётчик шага): две
          // одинаковые по весу декларации подрались бы за порядок в стилях.
          if (/leading-/.test(line)) return

          unpaired.push(`${path}:${index + 1}: ${line.trim().slice(0, 80)}`)
        })
      }

      expect(
        unpaired,
        'добавь `leading-[var(--gr-leading-*)]` или `leading-[var(--gr-control-leading-*)]` рядом с кеглем',
      ).toEqual([])
    })

    /**
     * Обратная сторона: токены движения уже были сгенерированы и не
     * использованы ни разу. Гейт держит связь живой — иначе следующая правка
     * тихо вернёт литералы, а шкала снова станет декоративной.
     */
    it.runIf(options.requireTokenUsage ?? true)('токены движения и типографики действительно используются', () => {
      const uses = (pattern: RegExp) => sources.filter(({ source }) => pattern.test(source)).length

      expect(uses(/var\(--gr-duration-/), '--gr-duration-* не используется ни одним компонентом').toBeGreaterThan(0)
      expect(uses(/var\(--gr-ease-/), '--gr-ease-* не используется ни одним компонентом').toBeGreaterThan(0)
      expect(uses(/var\(--gr-leading-/), '--gr-leading-* не используется ни одним компонентом').toBeGreaterThan(0)
    })
  })
}
