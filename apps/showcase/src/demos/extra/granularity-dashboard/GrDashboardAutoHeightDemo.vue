<script setup lang="ts">
import { computed, ref } from 'vue'
import type { GrDashboardItemLayout, GrDashboardResponsiveLayout } from '@feugene/granularity-dashboard'

/**
 * Авто-высота: содержимое решает, сколько строк занять.
 *
 * Демо намеренно ставит рядом виджет с `auto-height` и обычный, с той же
 * высотой в раскладке: на них видно, что подстраивается именно первый, а второй
 * честно обрезает своё содержимое полосой прокрутки.
 */
const mode = ref<'view' | 'edit'>('view')

const layout = ref<GrDashboardResponsiveLayout>({
  lg: [
    { id: 'log', x: 0, y: 0, w: 6, h: 2 },
    { id: 'fixed', x: 6, y: 0, w: 6, h: 2 },
    { id: 'total', x: 0, y: 2, w: 12, h: 1 },
  ],
})

const breakpoints = { lg: 680, md: 520, sm: 400, xs: 0 }
const cols = { lg: 12, md: 8, sm: 4, xs: 2 }

const EVENTS = [
  'Сборка 2418 прошла',
  'Выкатили 0.4.0 на стенд',
  'Алерт: очередь писем выросла втрое',
  'Очередь разобрана',
  'Ночной бэкап завершён',
  'Индексация каталога переехала на реплику',
  'Сертификат обновлён автоматически',
]

const count = ref(2)
const events = computed(() => EVENTS.slice(0, count.value))

/** Последнее подстроившееся: показываем, что событие приходит отдельным. */
const lastAuto = ref<string | null>(null)

function onAutoResize(id: string, from: GrDashboardItemLayout, to: GrDashboardItemLayout): void {
  lastAuto.value = `${id}: было ${from.h}, стало ${to.h}`
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <GrButton size="sm" variant="outline" :disabled="count >= EVENTS.length" @click="count += 1">
        Добавить событие
      </GrButton>
      <GrButton size="sm" variant="outline" :disabled="count <= 1" @click="count -= 1">
        Убрать событие
      </GrButton>
      <GrDashboardToolbar v-model:mode="mode" />
    </div>

    <GrDashboard
      v-model:layout="layout"
      :mode="mode"
      :breakpoints="breakpoints"
      :cols="cols"
      :row-height="72"
      @item-auto-resize="onAutoResize"
    >
      <GrDashboardItem item-id="log" title="Лента событий" auto-height :min-h="1">
        <ul class="flex flex-col gap-1 text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
          <li v-for="event in events" :key="event">{{ event }}</li>
        </ul>
      </GrDashboardItem>

      <GrDashboardItem item-id="fixed" title="То же, но без авто-высоты">
        <ul class="flex flex-col gap-1 text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
          <li v-for="event in events" :key="event">{{ event }}</li>
        </ul>
      </GrDashboardItem>

      <GrDashboardItem item-id="total" title="Всего" auto-height>
        <p class="text-[var(--gr-muted-fg)]">
          {{ events.length }} из {{ EVENTS.length }}<span v-if="lastAuto"> · последняя подстройка — {{ lastAuto }}</span>
        </p>
      </GrDashboardItem>
    </GrDashboard>

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Добавляйте и убирайте события: левый виджет <strong>растёт и ужимается обратно</strong>, расталкивая
      соседей, правый с той же лентой остаётся в своих двух строках и прячет остальное под прокрутку.
      Виджет «Всего» под ними поднимается и опускается уплотнением — авто-высота идёт через ту же
      арифметику раскладки, что и растягивание уголком.
    </p>

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Работает и в просмотре, и в редактировании: содержимое меняется в рантайме, а не только когда
      включили ручки. Изменение уезжает в <code>update:layout</code>, как любое другое, но сетка
      дополнительно эмитит <code>itemAutoResize</code> — его видно в подписи справа. Без него
      приложение, которое считает раскладку грязной по правкам, спрашивало бы «сохранить изменения?»
      после обычной загрузки данных. Высота округляется <strong>вверх</strong> до целой строки:
      пустота в пару пикселей внизу безобидна, обрезанная строка — нет. У такого виджета уголок
      меняет только ширину.
    </p>
  </div>
</template>
