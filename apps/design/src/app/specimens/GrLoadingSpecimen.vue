<script setup lang="ts">
import { nextTick, onUnmounted, reactive, ref, useTemplateRef } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

/**
 * Загрузка — состояние на время: включается действием и снимается сама.
 * Постоянно открытый оверлей поверх блока проваливает axe `color-contrast` во всех темах.
 */
const busy = reactive({ workspace: false, recount: false, quick: false, slow: false })
const timers = new Set<ReturnType<typeof setTimeout>>()

function hold(key: keyof typeof busy, ms = 2000): void {
  if (busy[key])
    return
  busy[key] = true
  const timer = setTimeout(() => {
    busy[key] = false
    timers.delete(timer)
  }, ms)
  timers.add(timer)
}

const exporting = ref(false)
const exported = ref(0)
let ticker: ReturnType<typeof setInterval> | undefined
const exportBlock = useTemplateRef<HTMLElement>('exportBlock')
const exportTrigger = useTemplateRef<{ focus: () => void }>('exportTrigger')

function stopExport(): void {
  clearInterval(ticker)
  ticker = undefined
  // «Отменить» уходит вместе с панелью: фокус возвращается на запуск, а не падает на body.
  const focusInside = exportBlock.value?.contains(document.activeElement) ?? false
  exporting.value = false
  if (focusInside)
    void nextTick(() => exportTrigger.value?.focus())
}

function startExport(): void {
  if (exporting.value)
    return
  exported.value = 0
  exporting.value = true
  ticker = setInterval(() => {
    exported.value = Math.min(100, exported.value + 5)
    if (exported.value === 100)
      stopExport()
  }, 100)
}

onUnmounted(() => {
  timers.forEach(clearTimeout)
  clearInterval(ticker)
})
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <div class="flex flex-wrap items-center justify-between gap-3 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
      <div class="flex min-w-[10rem] flex-1 flex-col gap-0.5">
        <p class="text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)]">
          Продажи по регионам
        </p>
        <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          Пересчитываем за октябрь…
        </p>
      </div>
      <GrButton variant="secondary" tone="neutral" size="sm" loading loading-text="Пересчитываем за октябрь">
        Пересчитать
      </GrButton>
    </div>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Поверх блока" note="Старые данные видны под дымкой, но ясно, что они меняются. Снимется сам через две секунды.">
      <div class="relative flex min-h-[200px] flex-col gap-2.5 overflow-hidden rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
        <p class="text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)]">
          Продажи по регионам
        </p>
        <dl class="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
          <dt class="text-[var(--gr-muted-fg)]">
            Москва
          </dt>
          <dd>1,2 млн ₽</dd>
          <dt class="text-[var(--gr-muted-fg)]">
            Казань
          </dt>
          <dd>640 тыс. ₽</dd>
          <dt class="text-[var(--gr-muted-fg)]">
            Пермь
          </dt>
          <dd>410 тыс. ₽</dd>
        </dl>
        <GrLoading v-if="busy.recount" text="Пересчитываем за октябрь" />
      </div>
      <GrButton variant="secondary" tone="neutral" size="sm" class="self-start" :loading="busy.recount" loading-text="Пересчитываем за октябрь" @click="hold('recount')">
        Пересчитать за октябрь
      </GrButton>
    </Specimen>

    <Specimen title="Во весь экран" note="fullscreen — загрузка уровня приложения: выше модальных окон, ниже тостов.">
      <div class="flex flex-wrap items-center gap-3">
        <GrButton variant="secondary" tone="neutral" :loading="busy.workspace" loading-text="Открываем рабочее пространство" @click="hold('workspace')">
          Открыть рабочее пространство
        </GrButton>
        <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          Накроет экран на две секунды и снимется сам.
        </span>
      </div>
      <GrLoading v-if="busy.workspace" fullscreen text="Открываем рабочее пространство" />
    </Specimen>

    <Specimen title="Своя панель" note="Слот заменяет содержимое панели: прогресс долгой операции и кнопка отмены.">
      <div ref="exportBlock" class="relative flex min-h-[160px] flex-col gap-2.5 overflow-hidden rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
        <p class="text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)]">
          Счета за III квартал
        </p>
        <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
          312 счетов · 4 контрагента · 18,4 млн ₽
        </p>
        <GrLoading v-if="exporting">
          <div class="flex w-48 flex-col gap-2">
            <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
              Выгружаем счета
            </p>
            <GrProgressBar :value="exported" show-value aria-label="Выгрузка счетов" />
            <GrButton size="xs" variant="outline" tone="neutral" class="self-start" @click="stopExport">
              Отменить
            </GrButton>
          </div>
        </GrLoading>
      </div>
      <GrButton ref="exportTrigger" variant="secondary" tone="neutral" size="sm" class="self-start" :loading="exporting" loading-text="Выгружаем счета" @click="startExport">
        Выгрузить в Excel
      </GrButton>
    </Specimen>

    <Specimen title="Задержка" note="delay 300 мс: ответ быстрее задержки не показывает оверлей вовсе — мигание раздражает сильнее, чем его отсутствие.">
      <div class="relative flex min-h-[120px] flex-col justify-center gap-1 overflow-hidden rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
        <p class="text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)]">
          Курс валют
        </p>
        <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
          1 € = 94,12 ₽ · обновлено в 14:30
        </p>
        <GrLoading v-if="busy.quick || busy.slow" :delay="300" text="Обновляем курс" />
      </div>
      <div class="flex flex-wrap gap-2">
        <GrButton variant="secondary" tone="neutral" size="sm" :loading="busy.quick" loading-text="Обновляем курс" @click="hold('quick', 200)">
          Ответ за 0,2 с
        </GrButton>
        <GrButton variant="secondary" tone="neutral" size="sm" :loading="busy.slow" loading-text="Обновляем курс" @click="hold('slow')">
          Ответ за 2 с
        </GrButton>
      </div>
    </Specimen>
  </div>
</template>
