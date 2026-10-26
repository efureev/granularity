<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const SIZES = ['xs', 'sm', 'md', 'lg'] as const

const previewSeats = ref<number | null>(12)

const states = reactive({
  rest: null as number | null,
  filled: 3 as number | null,
  invalid: 120 as number | null,
  success: 18 as number | null,
  disabled: 50 as number | null,
  readonly: 24 as number | null,
})

const seats = ref<number | null>(12)
const weight = ref<number | null>(2.4)
const amount = ref<number | null>(12000)
const amountError = computed(() => (amount.value !== null && amount.value > 10000
  ? 'Не больше 10 000 ₽ за раз — разбейте перевод на два'
  : undefined))

const discount = ref<number | null>(15)

const quantity = ref<number | null>(1)
</script>

<template>
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrFormField label="Места в команде" hint="От 1 до 50">
      <GrNumberInput v-model="previewSeats" :min="1" :max="50" controls controls-direction="horizontal" />
    </GrFormField>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Состояния" note="Пусто — это null, а не ноль; в «только чтение» гаснут обе кнопки шага." wide>
      <div class="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">пусто</span>
          <GrFormField label="Гостей">
            <GrNumberInput v-model="states.rest" :min="0" placeholder="Сколько придёт" controls />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">заполнено</span>
          <GrFormField label="Гостей">
            <GrNumberInput v-model="states.filled" :min="0" controls />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">ошибка</span>
          <GrFormField label="Скидка" error="Не больше 100 % — иначе платим покупателю" required>
            <GrNumberInput v-model="states.invalid" :min="0">
              <template #suffix>
                %
              </template>
            </GrNumberInput>
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">успех</span>
          <GrFormField label="Возраст" hint="Можно продавать">
            <GrNumberInput v-model="states.success" :min="0" state="success" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">недоступно</span>
          <GrFormField label="Лимит мест" hint="Задан тарифом" disabled>
            <GrNumberInput v-model="states.disabled" controls />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">только чтение</span>
          <GrFormField label="Срок договора" readonly>
            <GrNumberInput v-model="states.readonly" controls>
              <template #suffix>
                мес.
              </template>
            </GrNumberInput>
          </GrFormField>
        </div>
      </div>
    </Specimen>

    <Specimen title="Шаг и границы" note="Стрелки и PageUp/PageDown шагают, кнопка гаснет на своей границе, границы применяются на выходе из поля.">
      <div class="grid gap-4 sm:grid-cols-2">
        <GrFormField label="Места в команде" hint="От 1 до 50">
          <GrNumberInput v-model="seats" :min="1" :max="50" controls increase-label="Больше мест" decrease-label="Меньше мест" />
        </GrFormField>
        <GrFormField label="Вес посылки" hint="Шаг — 100 г">
          <GrNumberInput
            v-model="weight"
            :min="0"
            :step="0.1"
            :precision="1"
            decimal-separator=","
            controls
            controls-direction="horizontal"
            increase-label="Тяжелее"
            decrease-label="Легче"
          >
            <template #suffix>
              кг
            </template>
          </GrNumberInput>
        </GrFormField>
      </div>
    </Specimen>

    <Specimen title="Сумма и разряды" note="Разряды разделяются, пока поле не в фокусе; ошибка держит кнопку выключенной.">
      <GrFormField label="Сумма перевода" :error="amountError" :hint="amountError ? undefined : 'Без комиссии до 10 000 ₽'">
        <div class="flex gap-2">
          <div class="min-w-0 flex-1">
            <GrNumberInput v-model="amount" :min="0" locale="ru-RU" use-grouping>
              <template #suffix>
                ₽
              </template>
            </GrNumberInput>
          </div>
          <GrButton :disabled="Boolean(amountError)">
            Перевести
          </GrButton>
        </div>
      </GrFormField>
    </Specimen>

    <Specimen title="Очистка" note="Крестик стирает значение в null — форма отличит «не задано» от нуля.">
      <GrFormField label="Скидка постоянным клиентам">
        <GrNumberInput v-model="discount" :min="0" :max="100" clearable clear-label="Убрать скидку">
          <template #suffix>
            %
          </template>
        </GrNumberInput>
      </GrFormField>
      <p class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        v-model: {{ discount === null ? 'null' : discount }}
      </p>
    </Specimen>

    <Specimen title="Ступени" note="Кнопки шага растут вместе с полем.">
      <div v-for="size in SIZES" :key="size" class="flex items-center gap-3">
        <span class="w-6 shrink-0 font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ size }}</span>
        <div class="w-full max-w-[14rem]">
          <GrNumberInput v-model="quantity" :size="size" :min="1" controls controls-direction="horizontal" :aria-label="`Количество, ступень ${size}`" />
        </div>
      </div>
    </Specimen>
  </div>
</template>
