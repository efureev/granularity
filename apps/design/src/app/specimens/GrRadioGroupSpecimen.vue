<script setup lang="ts">
import type { GrRadioGroupOption } from '@feugene/granularity'
import { computed, reactive, ref, useId } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const SIZES = ['xs', 'sm', 'md', 'lg'] as const
type Size = typeof SIZES[number]

// Карточка рендерится до восьми раз на странице: имя группы — своё у каждого экземпляра.
const cardName = useId()
const CARD_OPTIONS: GrRadioGroupOption[] = [
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' },
  { value: 'system', label: 'Авто' },
]
const cardTheme = ref('system')

const THEME_OPTIONS: GrRadioGroupOption[] = [
  { value: 'light', label: 'Светлая' },
  { value: 'system', label: 'Как в системе', description: 'Следует за настройкой устройства' },
  { value: 'dark', label: 'Тёмная' },
]
const interfaceTheme = ref('system')

const PLAN_OPTIONS: GrRadioGroupOption[] = [
  { value: 'personal', label: 'Личный' },
  { value: 'team', label: 'Команда' },
  { value: 'company', label: 'Компания', disabled: true },
]
const plan = ref('team')

const DIGEST_OPTIONS: GrRadioGroupOption[] = [
  { value: 'daily', label: 'Каждый день' },
  { value: 'weekly', label: 'По понедельникам' },
  { value: 'never', label: 'Не присылать' },
]
const digest = ref('weekly')

const ROLE_OPTIONS: GrRadioGroupOption[] = [
  { value: 'reader', label: 'Читатель' },
  { value: 'editor', label: 'Редактор' },
  { value: 'owner', label: 'Владелец' },
]
const REGION_OPTIONS: GrRadioGroupOption[] = [
  { value: 'msk', label: 'Москва' },
  { value: 'spb', label: 'Санкт-Петербург' },
]
const DELIVERY_OPTIONS: GrRadioGroupOption[] = [
  { value: 'courier', label: 'Курьером' },
  { value: 'pickup', label: 'Самовывоз' },
  { value: 'post', label: 'Почтой' },
]
const delivery = ref('')
const deliveryError = computed(() => (delivery.value ? undefined : 'Выберите способ доставки'))

const FORMATS = [
  { value: 'pdf', label: 'PDF', description: 'Для печати и отправки' },
  { value: 'xlsx', label: 'Таблица', description: 'Для расчётов' },
  { value: 'md', label: 'Markdown', description: 'Для базы знаний' },
]
const exportFormat = ref('pdf')

const PERIOD_OPTIONS: GrRadioGroupOption[] = [
  { value: 'day', label: 'День' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
]
const periodBySize = reactive<Record<Size, string>>({ xs: 'week', sm: 'week', md: 'week', lg: 'week' })
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrFormField label="Тема интерфейса">
      <GrRadioGroup v-model="cardTheme" :options="CARD_OPTIONS" :name="cardName" orientation="horizontal" />
    </GrFormField>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="В поле" note="Один из нескольких; описание — серой строкой внутри той же цели.">
      <GrFormField label="Тема интерфейса">
        <GrRadioGroup v-model="interfaceTheme" :options="THEME_OPTIONS" />
      </GrFormField>
    </Specimen>

    <Specimen title="Кнопками и в строку" note="variant=&quot;button&quot; — ряд склеенных кнопок с ролью radio; стрелки водят выбор и пропускают недоступный.">
      <GrFormField label="Тариф" hint="«Компания» — по запросу">
        <GrRadioGroup v-model="plan" :options="PLAN_OPTIONS" variant="button" />
      </GrFormField>
      <GrFormField label="Сводка">
        <GrRadioGroup v-model="digest" :options="DIGEST_OPTIONS" orientation="horizontal" />
      </GrFormField>
    </Specimen>

    <Specimen title="Состояния" note="readonly оставляет выбор видимым, disabled гасит всю группу, ошибка — строкой под ней.">
      <GrFormField label="Роль" hint="Меняет владелец проекта">
        <GrRadioGroup :model-value="'editor'" :options="ROLE_OPTIONS" orientation="horizontal" readonly />
      </GrFormField>
      <GrFormField label="Регион хранения" hint="Выбирается при создании пространства" disabled>
        <GrRadioGroup :model-value="'msk'" :options="REGION_OPTIONS" orientation="horizontal" />
      </GrFormField>
      <GrFormField label="Способ доставки" :error="deliveryError" required>
        <GrRadioGroup v-model="delivery" :options="DELIVERY_OPTIONS" orientation="horizontal" />
      </GrFormField>
    </Specimen>

    <Specimen title="Слотом" note="Варианты со своей разметкой — те же клавиши и тот же контекст, что у options.">
      <GrFormField label="Формат выгрузки">
        <GrRadioGroup v-model="exportFormat">
          <GrRadio v-for="item in FORMATS" :key="item.value" :value="item.value">
            {{ item.label }}
            <template #description>
              {{ item.description }}
            </template>
          </GrRadio>
        </GrRadioGroup>
      </GrFormField>
    </Specimen>

    <Specimen title="Ступени" note="Кнопочная группа идёт по шкале GrButton: 28 · 32 · 40 · 44." wide>
      <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3">
        <template v-for="size in SIZES" :key="size">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ size }}
          </span>
          <div class="flex min-w-0 flex-wrap items-center gap-x-8 gap-y-2">
            <GrRadioGroup v-model="periodBySize[size]" :options="PERIOD_OPTIONS" :size="size" variant="button" :aria-label="`Период, ступень ${size}`" />
            <GrRadioGroup v-model="periodBySize[size]" :options="PERIOD_OPTIONS" :size="size" orientation="horizontal" :aria-label="`Период списком, ступень ${size}`" />
          </div>
        </template>
      </div>
    </Specimen>
  </div>
</template>
