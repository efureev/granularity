<script setup lang="ts">
import GrDropdown from '../GrDropdown/GrDropdown.vue'
// Типы размещения и ширины — из владельца API, а не переобъявлением: расхождение
// обнаружилось бы только рантаймом.
import type { GrDropdownTrigger } from '../GrDropdown/GrDropdown.vue'
import type { GrDropdownWidth } from '../GrDropdown/grDropdownStyles'
import type { UseFloatingPlacement } from '../../composables/useFloating'

import GrDropdownMenuEntries from './GrDropdownMenuEntries.vue'
import GrDropdownMenuList from './GrDropdownMenuList.vue'
import type { GrDropdownMenuAction, GrDropdownMenuEntry } from './menuModel'

export interface GrDropdownMenuProps {
  /** Размещение панели относительно триггера; переворот при нехватке места остаётся. */
  placement?: UseFloatingPlacement
  /** Зазор между триггером и панелью, px. */
  offset?: number
  /** Ширина панели: число — пиксели, строка — CSS-длина, `auto` — по контенту. */
  width?: GrDropdownWidth
  /** Чем открывается панель. В любом режиме работают клик и клавиатура. */
  trigger?: GrDropdownTrigger
  /** Задержка открытия по наведению, мс. */
  openDelay?: number
  /** Задержка закрытия после ухода курсора, мс. */
  closeDelay?: number
  /** Меню не открывается ничем; триггер остаётся фокусируемым. */
  disabled?: boolean
  /** Куда телепортировать панель (`body` по умолчанию). */
  /** Точечное переопределение точки монтирования; по умолчанию — общий портал. */
  teleportTo?: string | HTMLElement
  /** Закрывать по клику внутри content. */
  closeOnContentClick?: boolean
  /** Дополнительные классы content-контейнера. */
  contentClass?: string
  /**
   * Декларативное меню: пункты, группы и разделители массивом. Слот по
   * умолчанию сильнее — он для меню, которое из модели не собирается.
   */
  items?: GrDropdownMenuEntry[]

  // list wrapper
  /** Разделители между пунктами. */
  dividers?: boolean
  /** Верхний бордер контейнера списка. */
  borderTop?: boolean
  /** Нижний бордер контейнера списка. */
  borderBottom?: boolean
  /** Дополнительные классы для wrapper'а списка. */
  listClass?: string
  /**
   * Контролируемое состояние панели (`v-model:open`) — прокидывается в
   * `GrDropdown`. Без пропа меню ведёт себя само (uncontrolled).
   */
  open?: boolean
}

export interface GrDropdownMenuEmits {
  /** Выбран пункт декларативного меню. */
  (e: 'select', item: GrDropdownMenuAction): void
  /** Панель открылась/закрылась (`v-model:open`). */
  (e: 'update:open', value: boolean): void
}

withDefaults(defineProps<GrDropdownMenuProps>(), {
  placement: 'bottom-end',
  offset: 8,
  width: '12rem',
  trigger: 'click',
  openDelay: 120,
  closeDelay: 160,
  disabled: false,
  teleportTo: undefined,
  closeOnContentClick: true,
  // Поле панели принадлежит панели. Гасить его отсюда своим `p-0` нельзя: оба
  // класса попадают в один атрибут с равной специфичностью, и победителя
  // выбирает порядок правил в сгенерированном CSS, а не разметка. Пункт вписан
  // в это поле собственным радиусом — см. `itemBaseClass`.
  contentClass: '',
  items: undefined,
  dividers: false,
  borderTop: false,
  borderBottom: false,
  listClass: '',
  open: undefined,
})

const emit = defineEmits<GrDropdownMenuEmits>()

defineSlots<{
  /** Пункты меню. Слот-пропы прокидываются от `GrDropdown` как есть. */
  default?: (props: { close: () => void }) => any
  /**
   * Триггер панели. `triggerProps` обязаны попасть на сам интерактивный
   * элемент, а не на обёртку вокруг него: `aria-expanded` и `aria-controls`
   * читаются с того узла, который получает фокус.
   */
  trigger?: (props: {
    open: boolean
    toggle: () => void
    close: () => void
    triggerProps: Record<string, unknown>
  }) => any
}>()

</script>

<template>
  <GrDropdown
    data-gr-dropdown-menu
    :placement="placement"
    :offset="offset"
    :width="width"
    :trigger="trigger"
    :open-delay="openDelay"
    :close-delay="closeDelay"
    :disabled="disabled"
    :teleport-to="teleportTo"
    :close-on-content-click="closeOnContentClick"
    :content-class="contentClass"
    :open="open"
    @update:open="emit('update:open', $event)"
  >
    <template #trigger="slotProps">
      <slot name="trigger" v-bind="slotProps" />
    </template>

    <template #content="slotProps">
      <GrDropdownMenuList
        :dividers="dividers"
        :border-top="borderTop"
        :border-bottom="borderBottom"
        :class="listClass"
      >
        <slot v-bind="slotProps">
          <GrDropdownMenuEntries :items="items" @select="emit('select', $event)" />
        </slot>
      </GrDropdownMenuList>
    </template>
  </GrDropdown>
</template>
