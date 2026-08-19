<script setup lang="ts">
import { computed, ref } from 'vue'

/**
 * Порог, нарисованный серией из константы, врёт трижды: попадает в легенду
 * равноправным рядом, растягивает домен оси и уезжает в скрытую таблицу как
 * данные. Опора не делает ничего из этого.
 *
 * Пороги подобраны так, чтобы переключатель было **видно**: рабочий коридор
 * лежит внутри данных и виден всегда, а договорный потолок втрое выше любого
 * значения ряда — включив его в домен, ось растягивается, и сами данные
 * схлопываются в полосу у нуля. Ровно то, ради чего проп существует.
 */
const days = Array.from({ length: 30 }, (_, index) => new Date(2026, 6, index + 1))

const series = [
  {
    id: 'cost',
    label: 'Себестоимость кредита',
    data: days.map((x, index) => ({ x, y: 0.026 + Math.sin(index / 4) * 0.004 + index * 0.0004 })),
  },
]

const references = [
  // Внутри данных: виден в обоих положениях переключателя.
  { axis: 'y' as const, value: [0.03, 0.035] as const, label: 'Рабочий коридор' },
  // Втрое выше максимума ряда: он и есть предмет демонстрации.
  { axis: 'y' as const, value: 0.12, label: 'Потолок по договору', color: 'var(--gr-danger)' },
]

const includeInDomain = ref(false)

const hint = computed(() => (
  includeInDomain.value
    ? 'Ось растянулась до 0.12, чтобы вместить договорный потолок, — и весь ряд сжался в полосу у нижнего края. Различить на нём дневные колебания больше нельзя, зато видно, как далеко до потолка.'
    : 'Ось построена по данным: колебания себестоимости читаются, рабочий коридор виден. Договорный потолок при этом за краем холста — его линии нет, но в описании графика и в примечании таблицы он остался.'
))
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-baseline justify-between gap-4">
      <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
        Себестоимость кредита, $
      </span>

      <GrSwitch v-model="includeInDomain" size="sm">
        Вместить пороги в ось
      </GrSwitch>
    </div>

    <GrChartLine
      :series="series"
      :references="references"
      :include-references-in-domain="includeInDomain"
      :height="280"
      :value-format="{ precision: 3 }"
      aria-label="Себестоимость кредита с порогами"
    />

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      {{ hint }}
    </p>

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Переключатель — это проп <code>includeReferencesInDomain</code>, и по умолчанию он
      <strong>выключен</strong>. Причина видна на этом же графике: договорный потолок
      <code>0.12</code> втрое выше любого значения ряда, и вместить его в ось значит отдать порогу
      четыре пятых холста, а данным — оставшуюся пятую. Порог важен, но рассматривают всё-таки
      данные. Включать его в домен стоит там, где сам порог и есть предмет разговора: «сколько нам
      ещё до лимита».
    </p>

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Опора, ушедшая за край холста, <strong>не рисуется</strong> — прижать её к рамке значило бы
      показать порог там, где его нет. Но из описания графика и из примечания под скрытой таблицей
      она не пропадает: «порог не виден» и «порога нет» — разные утверждения, и читателю без зрения
      достаётся первое, а не второе.
    </p>
  </div>
</template>
