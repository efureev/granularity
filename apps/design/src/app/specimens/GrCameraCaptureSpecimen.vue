<script setup lang="ts">
import type { GrBadgeTone } from '@feugene/granularity'
import type { GrCameraCaptureSize, GrCameraStatus } from '@feugene/granularity-media'
import { onBeforeUnmount, ref } from 'vue'

import IconCamera from '~icons/lucide/camera'
import IconPower from '~icons/lucide/power'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const SIZES: readonly GrCameraCaptureSize[] = ['xs', 'sm', 'md', 'lg']

const STATUS_BADGES: Record<GrCameraStatus, { label: string, tone: GrBadgeTone }> = {
  idle: { label: 'выключена', tone: 'neutral' },
  starting: { label: 'ждёт разрешения', tone: 'info' },
  live: { label: 'снимает', tone: 'success' },
  denied: { label: 'доступ запрещён', tone: 'danger' },
  missing: { label: 'камеры нет', tone: 'warning' },
  busy: { label: 'занята', tone: 'warning' },
  insecure: { label: 'нужен HTTPS', tone: 'danger' },
  error: { label: 'сбой', tone: 'danger' },
}
const statusBadge = (status: GrCameraStatus): { label: string, tone: GrBadgeTone } => STATUS_BADGES[status]

const shots = ref(0)

const avatar = ref<string | null>(null)

function onAvatar(blob: Blob): void {
  if (avatar.value)
    URL.revokeObjectURL(avatar.value)
  avatar.value = URL.createObjectURL(blob)
}

onBeforeUnmount(() => {
  if (avatar.value)
    URL.revokeObjectURL(avatar.value)
})
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто, разрешение не спрошено. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrCameraCapture size="sm" aria-label="Камера для снимка" />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen
      title="До разрешения"
      note="Камера включается только кнопкой: запрос, всплывший сам, отклоняют не глядя, а второй раз браузер не спросит. Тексты отказа, отсутствия камеры и HTTP показывает только настоящий запрос — здесь их нет."
    >
      <div class="w-full max-w-[400px]">
        <GrCameraCapture aria-label="Камера" />
      </div>
    </Specimen>

    <Specimen title="Ступени" note="xs · sm · md · lg — кегль подписи и ступень кнопок; рамка 4:3, пока камера не отдала свой кадр.">
      <div class="grid gap-4 sm:grid-cols-2">
        <div v-for="size in SIZES" :key="size" class="flex flex-col gap-2">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ size }}
          </span>
          <GrCameraCapture :size="size" :aria-label="`Камера, ступень ${size}`" />
        </div>
      </div>
    </Specimen>

    <Specimen title="Недоступна" note="disabled: включить камеру и снять кадр нельзя — обе кнопки выключены.">
      <div class="w-full max-w-[400px]">
        <GrCameraCapture disabled aria-label="Камера, недоступна" />
      </div>
    </Specimen>

    <Specimen title="Своя панель" note="Слот #controls получает status, start, stop и capture; кнопка включения в самой рамке остаётся.">
      <div class="w-full max-w-[400px]">
      <GrCameraCapture facing="environment" aria-label="Тыловая камера" @capture="shots++">
        <template #controls="{ status, start, stop, capture }">
          <GrBadge size="sm" :tone="statusBadge(status).tone">
            {{ statusBadge(status).label }}
          </GrBadge>
          <GrButton v-if="status === 'live'" size="sm" @click="capture">
            <template #prefix>
              <IconCamera />
            </template>
            Снять документ
          </GrButton>
          <GrButton v-if="status === 'live'" size="sm" variant="ghost" tone="neutral" @click="stop">
            <template #prefix>
              <IconPower />
            </template>
            Выключить
          </GrButton>
          <GrButton v-else size="sm" variant="secondary" tone="neutral" :disabled="status === 'starting'" @click="start">
            Включить тыловую камеру
          </GrButton>
          <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            Снимков: {{ shots }}
          </span>
        </template>
      </GrCameraCapture>
      </div>
    </Specimen>

    <Specimen
      title="Фото профиля"
      note="Снимок уходит Blob'ом и сразу встаёт в аватар. Превью фронтальной камеры зеркальное, снимок — нет; квадрат из кадра вырезает GrImageCrop следующим шагом."
      wide
    >
      <GrCard title="Фото профиля" description="Анна Соколова · финансы" :heading-level="5" padding="md">
        <div class="grid items-start gap-6 md:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
          <GrCameraCapture
            :output="{ width: 512, type: 'image/jpeg', quality: 0.9 }"
            aria-label="Камера для фото профиля"
            @capture="onAvatar"
          />
          <div class="flex flex-col items-start gap-3">
            <GrAvatar name="Анна Соколова" :src="avatar ?? undefined" :size="72" />
            <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
              {{ avatar ? 'Снимок поставлен в профиль.' : 'Пока в профиле инициалы — включите камеру и сделайте снимок.' }}
            </p>
          </div>
        </div>
      </GrCard>
    </Specimen>
  </div>
</template>
