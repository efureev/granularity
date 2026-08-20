<script setup lang="ts">
import { computed, ref } from 'vue'
import IconClock from '~icons/lucide/clock-arrow-up'

// `GrTimePicker`, `GrButton` и `GrSwitch` подставляются авто-импортом.
import { ceilToStep, toPlainTime, useChronoNow } from '@feugene/granularity-chrono'

/**
 * Подвал панели раздаёт выбор внутрь.
 *
 * Демо намеренно даёт переключить `max` на «сейчас плюс две минуты»: на нём
 * видно, что граница считается **после** округления к шагу, и кнопка гаснет,
 * а не молча ничего не делает.
 */
const MINUTE_STEP = 15

const value = ref<Date | null>(null)
const tight = ref(false)

/**
 * Общие часы пакета, а не свой `setInterval`: подпись на кнопке обязана
 * оставаться правдой, но будить вкладку ради этого раз в секунду незачем —
 * такт здесь минутный.
 */
const now = useChronoNow(60_000)

/** Ровно то, что положит кнопка: «сейчас», поставленное на сетку шага. */
const target = computed(() => ceilToStep(toPlainTime(now.value), MINUTE_STEP * 60))

const targetLabel = computed(() => (
  `${String(target.value.h).padStart(2, '0')}:${String(target.value.min).padStart(2, '0')}`
))

/**
 * При включённом переключателе граница стоит на две минуты позже текущего
 * момента — то есть заведомо раньше следующей отметки пятнадцатиминутной сетки.
 */
const max = computed(() => (tight.value ? new Date(now.value.getTime() + 2 * 60_000) : undefined))

const maxLabel = computed(() => (max.value
  ? `${String(max.value.getHours()).padStart(2, '0')}:${String(max.value.getMinutes()).padStart(2, '0')}`
  : null))
</script>

<template>
  <div class="grid gap-4 justify-items-start">
    <GrSwitch v-model="tight" size="sm">
      Ограничить <code>max</code> двумя минутами вперёд
    </GrSwitch>

    <GrTimePicker
      v-model="value"
      :minute-step="MINUTE_STEP"
      :max="max"
      aria-label="Start time"
    >
      <template #footer="{ select, canSelect }">
        <div class="flex w-full items-center justify-between gap-3">
          <!--
            Причина отказа рядом с кнопкой, а не вместо неё: выключенный
            контрол без объяснения читается как поломка.
          -->
          <span class="text-xs leading-tight text-[var(--gr-muted-fg)]">
            <template v-if="canSelect(now)">
              ближайшая отметка
              <strong class="font-600 text-[var(--gr-fg)]">{{ targetLabel }}</strong>
            </template>
            <template v-else>
              {{ targetLabel }} позже, чем {{ maxLabel }}
            </template>
          </span>

          <GrButton
            size="sm"
            variant="outline"
            :disabled="!canSelect(now)"
            @click="select(now)"
          >
            <template #prefix>
              <IconClock />
            </template>
            Сейчас
          </GrButton>
        </div>
      </template>
    </GrTimePicker>

    <p class="showcase-demo-text text-sm opacity-70">
      Шаг — 15 минут, и «сейчас» встаёт на <strong>следующую</strong> отметку: 14:37 даёт 14:45, а не
      14:30. Округление вверх, потому что время в пикере почти всегда значит «начиная с этого
      момента» — запись, бронь, напоминание, — и округлённое вниз уже прошло. Подпись слева называет
      будущее значение до нажатия: у кнопки, которая молча меняет время на непредсказуемое, нет
      способа сказать «не то».
    </p>

    <p class="showcase-demo-text text-sm opacity-70">
      Включите ограничение: граница окажется раньше следующей отметки, и кнопка погаснет, а подпись
      объяснит почему. Порядок здесь и есть предмет: сначала время встаёт на сетку, и только потом
      проверяются границы — проверка до округления пропустила бы кнопку, которая ничего не делает.
    </p>
  </div>
</template>
