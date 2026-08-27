import { describe, expect, it } from 'vitest'

import { readSources, stripComments } from '../sources'

/**
 * Гейт на dev-гард: проверка окружения в пакете одна и записывается одним символом.
 *
 * `__GR_DEV__` разворачивается в `process.env.NODE_ENV !== 'production'` на
 * сборке пакета (`define` в `vite.config.ts`), в тестах равен `true`. Гейт
 * следит за двумя вещами.
 *
 * **Первая — чтобы вместо гарда не появилось написанное руками условие.**
 * Появлялось оно трижды и в трёх диалектах: голое `process.env.NODE_ENV`
 * (в воркере и edge-рантайме это `ReferenceError` в момент setup — компонент
 * падает там, где собирался напечатать подсказку); `import.meta.env?.DEV`
 * (не падает, но вне Vite тихо `undefined`, и предупреждение исчезает вместе с
 * дефектом, ради которого писалось); гард со страховкой, но написанный руками —
 * работает, однако форм у него две, и перепутанная отправляет предупреждение в
 * прод вместо того, чтобы его погасить.
 *
 * **Вторая — чтобы предупреждение вообще было закрыто.** Прежняя, ядровая
 * версия гейта ловила только первое, и четыре `console.warn` в двух пакетах
 * кричали в проде у потребителя годами: они не нарушали ни одного правила,
 * потому что ни одного условия вокруг них не было вовсе.
 *
 * Правило про консоль: **гард обязан встретиться в файле не ниже самого
 * предупреждения**. Не «где-нибудь в файле» — такую версию не роняет забытый
 * гард у соседнего `console.warn`, и первая же проверка мутацией это показала.
 * Не построчная близость — блочный `if (__GR_DEV__) {` закрывает четыре
 * предупреждения подряд, и требовать гард на каждой строке значило бы ломать
 * рабочий код.
 *
 * Исключения возможны: в ядре есть место, где `console.warn` живёт в модульной
 * функции, а гард стоит на стороне единственного вызова, то есть ниже по файлу
 * (`GrConfigProvider/context.ts`). Такое закрывается `allowUnguarded` — с
 * причиной, а не молча.
 */
export interface EnvGuardGateOptions {
  /** Корень исходников. По умолчанию `src` пакета. */
  srcDir?: string
  /** Имя символа-гарда. */
  guard?: string
  /**
   * Значение гарда в тестах — передаётся **самим пакетом**: `{ guardValue: __GR_DEV__ }`.
   *
   * Подстановка `define` текстовая и работает только там, где файл проходит
   * через трансформ потребителя. Фабрика приезжает собранной из `node_modules`,
   * и написанное здесь имя никто не заменит — значение обязано прийти снаружи.
   * Не передано — проверка пропускается: пакету без гарда её делать не на чем.
   */
  guardValue?: unknown
  /** Нижняя граница числа файлов: страховка от сломавшегося обхода. */
  minFiles?: number
  /**
   * Нижняя граница числа гардов в пакете.
   *
   * Имеет смысл там, где гарды точно есть: ядро их держит больше пятнадцати, и
   * обнуление этого счётчика означало бы, что предупреждения куда-то делись
   * целиком. Пакету без предупреждений порог не нужен — по умолчанию его нет.
   */
  minGuards?: number
  /**
   * Файлы, которым разрешено писать в консоль без гарда над предупреждением.
   * Ключ — путь от `src`, значение — причина. Причина обязательна: исключение
   * без объяснения через год неотличимо от забытого гарда.
   */
  allowUnguarded?: Record<string, string>
}

const HAND_WRITTEN_CHECK = /process\.env\.NODE_ENV|import\.meta\.env/
const CONSOLE_CALL = /\bconsole\.\w+\s*\(/

/** Файл, уже очищенный от комментариев: разбор идёт по коду, не по прозе. */
export interface GuardedFile {
  path: string
  code: string
}

/** Проверки окружения, написанные руками мимо гарда. */
export function handWrittenChecks(files: readonly GuardedFile[]): string[] {
  return files.flatMap(({ path, code }) => code
    .split('\n')
    .map((line, index) => ({ line, number: index + 1 }))
    .filter(({ line }) => HAND_WRITTEN_CHECK.test(line))
    .map(({ number }) => `${path}:${number}`))
}

/**
 * Предупреждения, над которыми гарда нет.
 *
 * Гард засчитывается на той же строке (инлайн `&& __GR_DEV__`) и на любой выше:
 * блочный `if (__GR_DEV__) {` закрывает несколько предупреждений сразу, и
 * требовать гард на каждой строке значило бы ломать рабочий код.
 */
export function unguardedWarnings(
  files: readonly GuardedFile[],
  options: { guard: string, allowed?: Record<string, string> },
): string[] {
  const allowed = options.allowed ?? {}

  return files
    .filter(({ path }) => allowed[path] === undefined)
    .flatMap(({ path, code }) => {
      const lines = code.split('\n')
      const firstGuard = lines.findIndex(line => line.includes(options.guard))

      return lines
        .map((line, index) => ({ line, index }))
        .filter(({ line }) => CONSOLE_CALL.test(line))
        .filter(({ index }) => firstGuard === -1 || index < firstGuard)
        .map(({ index }) => `${path}:${index + 1}`)
    })
}

export function defineEnvGuardGate(options: EnvGuardGateOptions = {}): void {
  const guard = options.guard ?? '__GR_DEV__'
  const allowed = options.allowUnguarded ?? {}
  const files = readSources({ dir: options.srcDir, extensions: /\.(?:ts|vue)$/ })
    .map(file => ({ ...file, code: stripComments(file.source) }))

  describe('dev-гард', () => {
    it('в исходниках нет ни одной проверки окружения мимо гарда', () => {
      const offenders = handWrittenChecks(files)

      expect(
        offenders,
        `${offenders.join('\n')}\n\nпиши \`${guard}\` (или \`!${guard}\` перед ранним return) — форма разворачивается на сборке`,
      ).toEqual([])
    })

    it('над каждым предупреждением стоит гард', () => {
      const offenders = unguardedWarnings(files, { guard, allowed })

      expect(
        offenders,
        `${offenders.join('\n')}\n\nпредупреждение без \`${guard}\` кричит и в проде у потребителя`,
      ).toEqual([])
    })

    it('гейт видит код, а не пустоту', () => {
      // Оба утверждения выше пройдут и на пустом наборе — например, если обход
      // сломается на новой раскладке `src`.
      expect(files.length, 'обход `src` ничего не нашёл').toBeGreaterThan(options.minFiles ?? 0)

      if (options.minGuards === undefined)
        return

      const guards = files.filter(({ code }) => code.includes(guard)).length

      expect(guards, `гардов осталось ${guards} — предупреждения куда-то делись`).toBeGreaterThan(options.minGuards)
    })

    it('подстановка гарда работает в тестах', () => {
      // Отвалившийся `define` на сборке этим не поймать — он зеленел бы на
      // `true`, пока потребитель получал бы `__GR_DEV__ is not defined`. Парный
      // гейт по собранному пакету — бинарь `gr-check-dist-dev-guard`.
      if (options.guardValue === undefined)
        return

      expect(options.guardValue, `\`${guard}\` в тестах обязан быть \`true\``).toBe(true)
    })
  })
}
