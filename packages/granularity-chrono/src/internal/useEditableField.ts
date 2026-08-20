import type { ComputedRef } from 'vue'
import { computed, ref, watch } from 'vue'

/**
 * Текстовый ввод в поле пикера.
 *
 * Пока пользователь печатает, модель не трогается: поле держит **черновик**, а
 * значение уходит наружу только тогда, когда текст разобрался — по `Enter` или
 * по уходу фокуса. Иначе каждая промежуточная строка («1», «12.») отдавала бы
 * наружу `null` и стирала выбранное.
 *
 * Неразобранный текст на уходе фокуса откатывается к значению модели. Держать
 * в поле мусор после коммита — значит показывать значение, которого нет; тот
 * же приём и по той же причине применён в `GrColorPicker` ядра.
 */
export interface UseEditableFieldOptions<TCommit> {
  editable: () => boolean
  /** Разобранный текст уходит наружу на уходе фокуса. */
  applyOnBlur: () => boolean
  /** Ввод не принимается: `disabled` или `readonly`. */
  locked: () => boolean
  /** Текст значения модели — то, что показывается, когда черновика нет. */
  display: () => string
  /** Достроить набранное до вида локали. По умолчанию — как есть. */
  mask?: (raw: string) => string
  /** Разбор текста; `null` — не разобралось. */
  parse: (text: string) => TCommit | null
  commit: (value: TCommit) => void
}

export interface UseEditableFieldReturn {
  /** Что показывать в поле: черновик, если он есть, иначе значение модели. */
  text: ComputedRef<string>
  /**
   * Набранное, ещё не ставшее значением. `null` — черновика нет.
   *
   * Панель разбирает его сама и подсвечивает то, что уже набрано: пока текст
   * неполон, модель трогать нельзя, а показывать набор надо.
   */
  draft: ComputedRef<string | null>
  onInput: (event: Event) => void
  onBlur: () => void
  /** `true`, если клавиша обработана и открывать панель не нужно. */
  handleKeydown: (event: KeyboardEvent) => boolean
}

export function useEditableField<TCommit>(
  options: UseEditableFieldOptions<TCommit>,
): UseEditableFieldReturn {
  /** `null` — черновика нет, поле показывает модель. */
  const draft = ref<string | null>(null)

  const text = computed(() => draft.value ?? options.display())

  // Значение сменилось снаружи (выбором в панели, очисткой, правкой модели) —
  // черновик больше не актуален: иначе поле осталось бы на старом тексте.
  watch(options.display, () => {
    draft.value = null
  })

  function apply(): void {
    if (draft.value === null) return

    const parsed = options.parse(draft.value)
    if (parsed !== null) options.commit(parsed)

    // И при удаче, и при промахе черновик снимается: показывать надо модель.
    draft.value = null
  }

  function onInput(event: Event): void {
    if (!options.editable() || options.locked()) return

    const raw = (event.target as HTMLInputElement).value
    draft.value = options.mask ? options.mask(raw) : raw
  }

  function onBlur(): void {
    if (!options.editable()) return
    if (!options.applyOnBlur()) {
      draft.value = null
      return
    }

    apply()
  }

  function handleKeydown(event: KeyboardEvent): boolean {
    if (!options.editable()) return false

    if (event.key === 'Enter') {
      // Иначе форма отправится с текстом, который ещё не стал значением.
      event.preventDefault()
      apply()
      return true
    }

    if (event.key === 'Escape' && draft.value !== null) {
      draft.value = null
      return true
    }

    // Пробел в редактируемом поле — символ, а не открытие панели.
    return event.key === ' '
  }

  return { text, draft: computed(() => draft.value), onInput, onBlur, handleKeydown }
}
