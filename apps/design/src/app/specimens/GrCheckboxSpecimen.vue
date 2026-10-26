<script setup lang="ts">
import type { GrCheckboxGroupOption } from '@feugene/granularity'
import { computed, reactive, ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const SIZES = ['xs', 'sm', 'md', 'lg'] as const

const card = reactive({ remember: true, sections: false, news: false })
const cardPending = ref(true)

const checks = reactive({ off: false, on: true, mixed: false, invalid: false })
const mixedPending = ref(true)

const steps = reactive({ remember: true, digest: false })

const label = reactive({ pattern: false, preview: true })

const PARTS: GrCheckboxGroupOption[] = [
  { value: 'report', label: 'Отчёт' },
  { value: 'charts', label: 'Графики' },
  { value: 'comments', label: 'Комментарии' },
]
const parts = ref(['report', 'charts'])
const allParts = computed(() => parts.value.length === PARTS.length)
const someParts = computed(() => parts.value.length > 0 && !allParts.value)

function toggleAllParts(next: boolean): void {
  parts.value = next ? PARTS.map(part => part.value) : []
}

const FORMATS = [
  { value: 'pdf', label: 'PDF', description: 'Для печати и отправки' },
  { value: 'xlsx', label: 'Таблица', description: 'Для расчётов' },
  { value: 'md', label: 'Markdown', description: 'Для базы знаний' },
]
const exportFormat = ref('pdf')
const sendLink = ref(true)

const exportSummary = computed(() => {
  const count = parts.value.length
  if (!count)
    return 'Отметьте хотя бы один раздел'
  const noun = count === 1 ? 'раздел' : 'раздела'
  const format = FORMATS.find(item => item.value === exportFormat.value)?.label ?? ''
  return `Выгрузим ${count} ${noun} в ${format}${sendLink.value ? ' и пришлём ссылку на почту' : ''}`
})
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrCheckbox v-model="card.remember">
      Запомнить меня
    </GrCheckbox>
    <GrCheckbox v-model="card.sections" :indeterminate="cardPending" @update:model-value="cardPending = false">
      Все разделы
    </GrCheckbox>
    <GrCheckbox v-model="card.news">
      Присылать новости
    </GrCheckbox>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Состояния" note="Выбор читается без цвета: пусто, галочка или тире «частично»." wide>
      <div class="grid gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
        <GrCheckbox v-model="checks.off">
          Выключено
        </GrCheckbox>
        <GrCheckbox v-model="checks.on">
          Включено
        </GrCheckbox>
        <GrCheckbox v-model="checks.mixed" :indeterminate="mixedPending" @update:model-value="mixedPending = false">
          Частично
        </GrCheckbox>
        <GrCheckbox v-model="checks.invalid" invalid>
          С ошибкой
        </GrCheckbox>
        <GrCheckbox :model-value="false" disabled>
          Недоступно
        </GrCheckbox>
        <GrCheckbox :model-value="true" disabled>
          Недоступно, отмечено
        </GrCheckbox>
        <GrCheckbox :model-value="true" readonly>
          Только чтение
        </GrCheckbox>
      </div>
    </Specimen>

    <Specimen title="Ступени" note="Контрол встаёт по центру первой строки подписи — и короткой, и длинной.">
      <div class="flex flex-col gap-4">
        <div v-for="size in SIZES" :key="size" class="flex items-start gap-4">
          <span class="w-6 shrink-0 font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ size }}</span>
          <div class="flex min-w-0 flex-wrap items-start gap-x-6 gap-y-2">
            <GrCheckbox v-model="steps.remember" :size="size">
              Запомнить меня
            </GrCheckbox>
            <div class="w-56">
              <GrCheckbox v-model="steps.digest" :size="size">
                Присылать сводку по проектам, где вы участник
              </GrCheckbox>
            </div>
          </div>
        </div>
      </div>
    </Specimen>

    <Specimen title="Подпись" note="Подпись живёт снаружи роли: ссылка в ней остаётся ссылкой. label-position=&quot;start&quot; ставит её перед флажком.">
      <GrCheckbox v-model="label.pattern">
        Прочитал
        <GrLink href="https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/" external>
          паттерн чекбокса WAI-ARIA
        </GrLink>
      </GrCheckbox>
      <GrCheckbox v-model="label.preview" label-position="start">
        Показывать превью ссылок
      </GrCheckbox>
    </Specimen>

    <Specimen title="Все и частично" note="«Все разделы» — частично, пока выбраны не все; итог выгрузки пересчитывается сразу." wide>
      <div class="flex flex-col gap-5 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
        <div class="grid gap-6 sm:grid-cols-3">
          <div class="flex flex-col gap-2">
            <GrCheckbox :model-value="allParts" :indeterminate="someParts" @update:model-value="toggleAllParts">
              Все разделы
            </GrCheckbox>
            <div class="ps-6">
              <GrCheckboxGroup v-model="parts" :options="PARTS" aria-label="Разделы выгрузки" />
            </div>
          </div>
          <GrFormField label="Формат">
            <GrRadioGroup v-model="exportFormat">
              <GrRadio v-for="item in FORMATS" :key="item.value" :value="item.value">
                {{ item.label }}
                <template #description>
                  {{ item.description }}
                </template>
              </GrRadio>
            </GrRadioGroup>
          </GrFormField>
          <div class="flex flex-col gap-2">
            <p class="text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)] text-[var(--gr-fg)]">
              Отправка
            </p>
            <GrSwitch v-model="sendLink">
              Прислать ссылку на почту
            </GrSwitch>
          </div>
        </div>
        <p class="border-t border-[var(--gr-brd)] pt-4 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]" aria-live="polite">
          {{ exportSummary }}
        </p>
      </div>
    </Specimen>
  </div>
</template>
