<script setup lang="ts">
import { computed, ref } from 'vue'

// `GrDatePicker` и `GrChip` подставляются авто-импортом.

/**
 * Набор дат — не диапазон.
 *
 * Демо намеренно ставит рядом список выбранного: на нём видно, что модель это
 * массив, что он всегда отсортирован и что снять дату можно двумя путями —
 * повторным кликом в сетке и крестиком в списке.
 */
const TODAY = new Date(2026, 7, 12)

const lessons = ref<Date[]>([new Date(2026, 7, 12), new Date(2026, 7, 14)])

const formatter = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short' })

const chips = computed(() => lessons.value.map(date => ({
  key: date.toISOString().slice(0, 10),
  label: formatter.format(date),
  date,
})))

function remove(key: string): void {
  lessons.value = lessons.value.filter(date => date.toISOString().slice(0, 10) !== key)
}
</script>

<template>
  <div class="grid gap-4 justify-items-start">
    <GrDatePicker
      v-model="lessons"
      multiple
      :today="TODAY"
      locale="ru-RU"
      placeholder="Выберите занятия"
      aria-label="Даты занятий"
      class="w-80"
    />

    <div v-if="chips.length > 0" class="flex flex-wrap items-center gap-2">
      <!-- Удаление у чипа своё: `closable` плюс `remove`, свой крестик был бы копией. -->
      <GrChip
        v-for="chip in chips"
        :key="chip.key"
        size="sm"
        closable
        :remove-label="`Убрать ${chip.label}`"
        @remove="remove(chip.key)"
      >
        {{ chip.label }}
      </GrChip>
    </div>

    <p v-else class="showcase-demo-text text-sm opacity-70">
      Пока ничего не выбрано.
    </p>

    <p class="showcase-demo-text text-sm opacity-70">
      Наберите несколько дат: панель <strong>не закрывается</strong> — набор набирают, а одиночную
      дату выбирают однажды. Клик по выбранной снимает её: набор это переключатель, а не накопитель,
      иначе снять ошибочно взятую дату было бы нечем.
    </p>

    <p class="showcase-demo-text text-sm opacity-70">
      Порядок в модели всегда по возрастанию, куда бы вы ни кликнули — модель обязана быть сравнима,
      иначе перестановка читалась бы как изменение. В поле видны первые три даты и остаток числом:
      без потолка подпись переполняется уже на пятой. Отличие от диапазона — в существе: там
      непрерывный отрезок с двумя краями, здесь множество, где соседство ничего не значит.
    </p>
  </div>
</template>
