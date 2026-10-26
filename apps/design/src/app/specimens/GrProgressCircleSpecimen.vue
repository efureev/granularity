<script setup lang="ts">
import { ref } from 'vue'

import IconRotateCcw from '~icons/lucide/rotate-ccw'
import IconX from '~icons/lucide/x'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const uploadCancelled = ref(false)

const THICKNESS: { name: string, thickness?: number, trackless?: boolean, label: string }[] = [
  { name: 'Загрузка обложки', thickness: 4, label: 'thickness · 4' },
  { name: 'Загрузка превью', label: 'по ступени' },
  { name: 'Загрузка галереи', thickness: 14, label: 'thickness · 14' },
  { name: 'Загрузка фото поверх снимка', trackless: true, label: 'trackless' },
]
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <div class="flex items-center gap-4">
      <GrProgressCircle :value="72" show-value aria-label="Сборка отчёта" />
      <div class="flex min-w-0 flex-col gap-0.5">
        <p class="text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)]">
          Собираем отчёт
        </p>
        <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          Осталось около минуты
        </p>
      </div>
    </div>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Значение и итог" note="Число — от sm; statusIcon меняет его на галочку при 100 и на крест при danger.">
      <div class="flex flex-wrap items-end gap-6">
        <div class="flex flex-col items-center gap-1.5">
          <GrProgressCircle :value="30" size="xs" aria-label="Сборка проекта" />
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">xs · 30</code>
        </div>
        <div class="flex flex-col items-center gap-1.5">
          <GrProgressCircle :value="45" size="sm" show-value aria-label="Загрузка фото" />
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">sm · 45</code>
        </div>
        <div class="flex flex-col items-center gap-1.5">
          <GrProgressCircle :value="72" show-value aria-label="Сборка отчёта" />
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">md · 72</code>
        </div>
        <div class="flex flex-col items-center gap-1.5">
          <GrProgressCircle :value="100" tone="success" status-icon aria-label="Отчёт собран" />
          <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">готово</span>
        </div>
        <div class="flex flex-col items-center gap-1.5">
          <GrProgressCircle :value="40" tone="danger" status-icon aria-label="Выгрузка прервана" />
          <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">сбой</span>
        </div>
      </div>
    </Specimen>

    <Specimen title="Шкала и без значения" note="dashboard — для доли; indeterminate — дуга бежит по кругу и значения не объявляет.">
      <div class="flex items-center gap-4">
        <GrProgressCircle :value="68" shape="dashboard" size="lg" show-value aria-label="Место в хранилище" />
        <div class="flex min-w-0 flex-col gap-0.5">
          <p class="text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)]">
            Место в хранилище
          </p>
          <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            34 из 50 ГБ занято
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <GrProgressCircle indeterminate size="xs" aria-label="Синхронизация почты" />
        <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
          Синхронизируем почту…
        </p>
      </div>
    </Specimen>

    <Specimen title="Действие в центре" note="Центр — сосед роли progressbar, а не её потомок: кнопка отмены внутри кольца остаётся кнопкой.">
      <div class="flex items-center gap-4">
        <GrProgressCircle :value="45" size="lg" :tone="uploadCancelled ? 'danger' : undefined" :aria-label="uploadCancelled ? 'Загрузка видео отменена' : 'Загрузка видео'">
          <!-- Одна кнопка с меняющимся назначением: удалённая из DOM кнопка уронила бы фокус на body. -->
          <GrButton
            size="xs"
            variant="ghost"
            tone="neutral"
            square
            :aria-label="uploadCancelled ? 'Загрузить видео снова' : 'Отменить загрузку видео'"
            @click="uploadCancelled = !uploadCancelled"
          >
            <GrIcon>
              <IconRotateCcw v-if="uploadCancelled" />
              <IconX v-else />
            </GrIcon>
          </GrButton>
        </GrProgressCircle>
        <div class="flex min-w-0 flex-col gap-0.5">
          <p class="text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)]">
            презентация.mp4
          </p>
          <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ uploadCancelled ? 'Загрузка отменена' : '86 из 190 МБ' }}
          </p>
        </div>
      </div>
    </Specimen>

    <Specimen title="Толщина и дорожка" note="thickness — в процентах диаметра; trackless убирает дорожку, когда кольцо лежит поверх картинки.">
      <div class="flex flex-wrap items-end gap-6">
        <div v-for="item in THICKNESS" :key="item.label" class="flex flex-col items-center gap-1.5">
          <GrProgressCircle :value="60" :thickness="item.thickness" :trackless="item.trackless" :aria-label="item.name" />
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ item.label }}</code>
        </div>
      </div>
    </Specimen>
  </div>
</template>
