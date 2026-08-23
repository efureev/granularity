import type { ComputedRef, Ref } from 'vue'
import { computed, useSlots } from 'vue'

import { addLen, useAddonMeasurement } from './useAddonMeasurement'

/**
 * Аддоны контрола: слоты `prefix`/`suffix` и геометрия вокруг них.
 *
 * Слот здесь — вершина айсберга. Контракт аддона состоит из шести пропов ширины,
 * замера фактического размера через `ResizeObserver` и пересчёта внутренних
 * отступов поля, чтобы текст не заезжал под аддон. Эта математика была написана
 * дважды — в `GrInput` и `GrNumberInput`, — и раскатать её ещё на четыре
 * контрола копипастой значило бы завести шесть копий одного расчёта.
 *
 * Правило, которое держит композабл: **аддон резервирует место, а не заменяет
 * отступ**. Поле с аддоном и без него выглядит одинаково отбитым от края —
 * ширина аддона прибавляется к базовому паддингу ступени, а не вытесняет его.
 *
 * Карта ширины по умолчанию остаётся у компонента (`defaultMinWidth`): у
 * `GrInput` она в `rem`, у `GrNumberInput` — в тех же значениях, но в пикселях,
 * потому что оттуда же считаются ширины степперов. Сводить их к одной строке
 * значило бы менять то, что уезжает в `style`, ради косметики.
 */
export interface GrControlAddonProps {
  /** Минимальная ширина префикса. По умолчанию — ширина аддона для ступени размера. */
  prefixMinWidth?: string
  /** Максимальная ширина префикса: содержимое шире — обрезается. */
  prefixMaxWidth?: string
  suffixMinWidth?: string
  suffixMaxWidth?: string
  /**
   * Жёсткая ширина префикса (из `prefixMaxWidth` → `prefixMinWidth` → дефолт).
   * Нужна, когда аддоны соседних полей обязаны совпасть по ширине: без этого
   * каждое поле меряет свой аддон и колонка «плывёт».
   */
  prefixFixed?: boolean
  suffixFixed?: boolean
}

export interface UseControlAddonsOptions {
  /** Ширина аддона по умолчанию для текущей ступени размера. */
  defaultMinWidth: () => string
  /** Базовый горизонтальный отступ поля из size-мапы. */
  paddingX: () => string
  /** Место, занятое собственными элементами контрола слева (степперы `GrNumberInput`). */
  leadingReserve?: () => string
  /** То же справа: кнопки очистки и показа пароля, спиннер, степперы. */
  trailingReserve?: () => string
  /** Прижать суффикс к правому краю — там, где аддон позиционируется абсолютно. */
  anchorSuffixRight?: boolean
}

export interface ControlAddons {
  hasPrefix: ComputedRef<boolean>
  hasSuffix: ComputedRef<boolean>
  /** Вешаются на DOM-элементы аддонов: по ним идёт замер. */
  prefixEl: Ref<HTMLElement | null>
  suffixEl: Ref<HTMLElement | null>
  /** Занятое аддоном место (`0px`, если слота нет) — контролу нужно для своих кнопок. */
  prefixLen: ComputedRef<string>
  suffixLen: ComputedRef<string>
  prefixStyle: ComputedRef<Record<string, string | undefined>>
  suffixStyle: ComputedRef<Record<string, string | undefined>>
  /** `paddingLeft`/`paddingRight` поля с учётом аддонов и собственных кнопок. */
  fieldPadding: ComputedRef<Record<string, string | undefined>>
}

export function useControlAddons(
  props: () => GrControlAddonProps,
  options: UseControlAddonsOptions,
): ControlAddons {
  const slots = useSlots()

  const hasPrefix = computed(() => Boolean(slots.prefix))
  const hasSuffix = computed(() => Boolean(slots.suffix))

  const prefixMinWidth = computed(() => props().prefixMinWidth ?? options.defaultMinWidth())
  const suffixMinWidth = computed(() => props().suffixMinWidth ?? options.defaultMinWidth())

  // Жёсткая ширина для fixed-режима: max → min → дефолт.
  const prefixFixedWidth = computed(() => props().prefixMaxWidth ?? props().prefixMinWidth ?? options.defaultMinWidth())
  const suffixFixedWidth = computed(() => props().suffixMaxWidth ?? props().suffixMinWidth ?? options.defaultMinWidth())

  const { prefixEl, suffixEl, measuredPrefixWidth, measuredSuffixWidth } = useAddonMeasurement(hasPrefix, hasSuffix)

  const prefixLen = computed(() => {
    if (!hasPrefix.value)
      return '0px'
    return props().prefixFixed ? prefixFixedWidth.value : measuredPrefixWidth.value ?? prefixMinWidth.value
  })

  const suffixLen = computed(() => {
    if (!hasSuffix.value)
      return '0px'
    return props().suffixFixed ? suffixFixedWidth.value : measuredSuffixWidth.value ?? suffixMinWidth.value
  })

  const prefixStyle = computed<Record<string, string | undefined>>(() => {
    if (props().prefixFixed) {
      return {
        width: prefixFixedWidth.value,
        minWidth: prefixFixedWidth.value,
        maxWidth: prefixFixedWidth.value,
      }
    }

    return {
      minWidth: prefixMinWidth.value,
      maxWidth: props().prefixMaxWidth,
    }
  })

  const suffixStyle = computed<Record<string, string | undefined>>(() => {
    const anchor = options.anchorSuffixRight ? { right: '0px' } : {}

    if (props().suffixFixed) {
      return {
        ...anchor,
        width: suffixFixedWidth.value,
        minWidth: suffixFixedWidth.value,
        maxWidth: suffixFixedWidth.value,
      }
    }

    return {
      ...anchor,
      minWidth: suffixMinWidth.value,
      maxWidth: props().suffixMaxWidth,
    }
  })

  const fieldPadding = computed<Record<string, string | undefined>>(() => {
    const leading = options.leadingReserve?.() ?? '0px'
    const trailing = options.trailingReserve?.() ?? '0px'

    const left = addLen(prefixLen.value, leading)
    const right = addLen(suffixLen.value, trailing)

    return {
      // Отступ добавляется поверх зарезервированного места: поле с аддоном и без
      // него отбито от края одинаково.
      paddingLeft: hasPrefix.value || leading !== '0px' ? addLen(left, options.paddingX()) : undefined,
      paddingRight: hasSuffix.value || trailing !== '0px' ? addLen(right, options.paddingX()) : undefined,
    }
  })

  return {
    hasPrefix,
    hasSuffix,
    prefixEl,
    suffixEl,
    prefixLen,
    suffixLen,
    prefixStyle,
    suffixStyle,
    fieldPadding,
  }
}
