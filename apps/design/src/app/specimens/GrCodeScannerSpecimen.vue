<script setup lang="ts">
import type { GrBadgeTone } from '@feugene/granularity'
import type { GrCameraStatus, GrCodeDetector, GrCodeResult, GrCodeScannerSize } from '@feugene/granularity-media'
import { createNativeDetector } from '@feugene/granularity-media'
import { computed, ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const FORMATS = ['qr_code', 'ean_13', 'code_128'] as const

/**
 * Детектор передаётся всегда. Без него Safari, Firefox и Chromium без Shape
 * Detection API показали бы «браузер не умеет читать коды» вместо кнопки, и
 * образец в разных браузерах выглядел бы по-разному.
 */
const detector: GrCodeDetector = createNativeDetector(FORMATS) ?? (() => Promise.resolve<GrCodeResult[]>([]))

const SIZES: readonly GrCodeScannerSize[] = ['xs', 'sm', 'md', 'lg']

const STATUS_BADGES: Record<GrCameraStatus, { label: string, tone: GrBadgeTone }> = {
  idle: { label: 'ожидает', tone: 'neutral' },
  starting: { label: 'ждёт разрешения', tone: 'info' },
  live: { label: 'сканирует', tone: 'success' },
  denied: { label: 'доступ запрещён', tone: 'danger' },
  missing: { label: 'камеры нет', tone: 'warning' },
  busy: { label: 'камера занята', tone: 'warning' },
  insecure: { label: 'нужен HTTPS', tone: 'danger' },
  error: { label: 'сбой', tone: 'danger' },
}
const statusBadge = (status: GrCameraStatus): { label: string, tone: GrBadgeTone } => STATUS_BADGES[status]

const lastCode = ref<GrCodeResult | null>(null)

function remember(codes: GrCodeResult[]): void {
  lastCode.value = codes[0] ?? null
}

/** Ключ справочника — строка: штрихкод с ведущим нулём в числе потерял бы его. */
const CATALOG = new Map([
  ['4600051000057', 'Кофе зерновой, 1 кг'],
  ['5901234123457', 'Бумага А4, 500 листов'],
  ['4008400402222', 'Батарейки AA, 4 шт'],
])

interface Position {
  code: string
  title: string
  count: number
}

const positions = ref<Position[]>([
  { code: '4600051000057', title: 'Кофе зерновой, 1 кг', count: 3 },
  { code: '5901234123457', title: 'Бумага А4, 500 листов', count: 1 },
])
const total = computed(() => positions.value.reduce((sum, item) => sum + item.count, 0))

function receive(codes: GrCodeResult[]): void {
  for (const code of codes) {
    const known = positions.value.find(item => item.code === code.value)
    if (known) {
      known.count += 1
      continue
    }
    positions.value = [{ code: code.value, title: CATALOG.get(code.value) ?? 'Неизвестная позиция', count: 1 }, ...positions.value]
  }
}
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто, разрешение не спрошено. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrCodeScanner :detector="detector" size="sm" aria-label="Сканер QR-кода" />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen
      title="До разрешения"
      note="autoStart выключен: камеру включает кнопка, а не открытие страницы. Прицел — рамка цвета --gr-code-scanner-reticle — появляется только на живом потоке."
    >
      <div class="w-full max-w-[400px]">
        <GrCodeScanner :detector="detector" aria-label="Сканер кодов" />
      </div>
    </Specimen>

    <Specimen title="Ступени" note="xs · sm · md · lg — кегль подписи и ступень кнопки; рамка 4:3, пока камера не отдала свой кадр.">
      <div class="grid gap-4 sm:grid-cols-2">
        <div v-for="size in SIZES" :key="size" class="flex flex-col gap-2">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ size }}
          </span>
          <GrCodeScanner :detector="detector" :size="size" :aria-label="`Сканер кодов, ступень ${size}`" />
        </div>
      </div>
    </Specimen>

    <Specimen title="Недоступен" note="disabled: камера не включается, кнопка выключена.">
      <div class="w-full max-w-[400px]">
        <GrCodeScanner :detector="detector" disabled aria-label="Сканер кодов, недоступен" />
      </div>
    </Specimen>

    <Specimen title="Своя панель" note="Слот #controls владеет действиями: в рамке остаётся только текст состояния, своя кнопка не дублирует его «Начать».">
      <div class="w-full max-w-[400px]">
      <GrCodeScanner :detector="detector" :formats="FORMATS" aria-label="Сканер для входа по QR" @detect="remember">
        <template #controls="{ status, start, stop }">
          <GrBadge size="sm" :tone="statusBadge(status).tone">
            {{ statusBadge(status).label }}
          </GrBadge>
          <GrButton v-if="status === 'live'" size="sm" variant="ghost" tone="neutral" @click="stop">
            Остановить
          </GrButton>
          <GrButton v-else size="sm" :disabled="status === 'starting'" @click="start">
            Войти по QR-коду
          </GrButton>
          <span class="min-w-0 truncate text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ lastCode ? `Код: ${lastCode.value}` : 'Код пока не прочитан' }}
          </span>
        </template>
      </GrCodeScanner>
      </div>
    </Specimen>

    <Specimen
      title="Приёмка товара"
      note="continuous: одинаковые коробки идут подряд, и повтор — законная вторая единица, а не дребезг кадров."
      wide
    >
      <div class="grid items-start gap-6 md:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
        <GrCodeScanner :detector="detector" :formats="FORMATS" continuous aria-label="Сканер приёмки" @detect="receive" />
        <GrCard title="Накладная № 318" :description="`Принято: ${total} шт`" :heading-level="5">
          <ul class="flex flex-col">
            <li
              v-for="(item, index) in positions"
              :key="item.code"
              class="flex items-center justify-between gap-3 px-4 py-2.5"
              :class="index > 0 ? 'border-t border-[var(--gr-brd)]' : ''"
            >
              <span class="flex min-w-0 flex-col">
                <span class="truncate text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">{{ item.title }}</span>
                <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ item.code }}</span>
              </span>
              <GrBadge size="sm" :tone="item.count > 1 ? 'success' : 'neutral'">
                {{ item.count }} шт
              </GrBadge>
            </li>
          </ul>
        </GrCard>
      </div>
    </Specimen>
  </div>
</template>
