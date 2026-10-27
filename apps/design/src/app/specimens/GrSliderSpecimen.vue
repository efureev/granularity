<script setup lang="ts">
import type { GrSliderModelValue } from '@feugene/granularity'
import { computed, reactive, ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const SIZES = ['xs', 'sm', 'md', 'lg'] as const

const rub = (value: number): string => `${value.toLocaleString('ru-RU')} ₽`
const percent = (value: number): string => `${value} %`
const decibel = (value: number): string => `${value.toLocaleString('ru-RU', { signDisplay: 'exceptZero' })} дБ`

const cardPrice = ref<[number, number]>([2500, 6500])
const cardPriceText = computed(() => `${rub(cardPrice.value[0])} — ${rub(cardPrice.value[1])}`)

const volume = ref(60)
const price = ref<[number, number]>([2500, 6500])
const priceText = computed(() => `${rub(price.value[0])} — ${rub(price.value[1])}`)

const fontSize = ref(16)
const FONT_MARKS = [12, 15, 18, 21, 24]

const discount = ref(60)
const discountError = computed(() => (discount.value > 50 ? 'Скидку больше 50 % согласует руководитель' : undefined))

const stepValue = ref(40)

const BANDS = [
  { id: 'low', label: 'Низкие' },
  { id: 'mid', label: 'Средние' },
  { id: 'high', label: 'Высокие' },
] as const
const bands = reactive({ low: 4, mid: 0, high: -3 })

const live = reactive({ value: 30, sent: 0 })
const lazy = reactive({ value: 30, sent: 0 })

function commit(target: { value: number, sent: number }, value: GrSliderModelValue): void {
  if (typeof value !== 'number')
    return
  target.value = value
  target.sent++
}
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrFormField>
      <template #label>
        Цена
        <span aria-hidden="true" class="ms-2 text-[var(--gr-muted-fg)]">{{ cardPriceText }}</span>
      </template>
      <GrSlider v-model="cardPrice" range :min="0" :max="10000" :step="500" :format-tooltip="rub" show-tooltip />
    </GrFormField>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Значение" note="Пройденное — заливкой, значение — рядом с подписью и над ручкой.">
        <GrFormField>
        <template #label>
          Громкость уведомлений
          <span aria-hidden="true" class="ms-2 text-[var(--gr-muted-fg)]">{{ percent(volume) }}</span>
        </template>
        <GrSlider v-model="volume" :format-tooltip="percent" show-tooltip />
      </GrFormField>
    </Specimen>

    <Specimen title="Диапазон" note="Бегунки не проходят друг сквозь друга; диктор называет их «минимум» и «максимум».">
      <GrFormField>
        <template #label>
          Цена
          <span aria-hidden="true" class="ms-2 text-[var(--gr-muted-fg)]">{{ priceText }}</span>
        </template>
        <GrSlider v-model="price" range :min="0" :max="10000" :step="500" :format-tooltip="rub" show-tooltip />
      </GrFormField>
    </Specimen>

    <Specimen title="Метки" note="Деления подписаны под шкалой; формат уходит и в подсказку, и диктору.">
      <GrFormField label="Размер шрифта">
        <GrSlider v-model="fontSize" :min="12" :max="24" :marks="FONT_MARKS" :format-tooltip="(value: number) => `${value} px`" />
      </GrFormField>
      <p class="leading-[var(--gr-leading-tight)] text-[var(--gr-fg)]" :style="{ fontSize: `${fontSize}px` }">
        Тёплая бумага и графит.
      </p>
    </Specimen>

    <Specimen title="Состояния" note="Недоступный гаснет, как все поля; только чтение показывает значение; ошибка красит заливку и ручку.">
      <GrFormField label="Яркость экрана" hint="Управляется системой" disabled>
        <GrSlider :model-value="40" />
      </GrFormField>
      <GrFormField label="Громкость звонка" hint="Задаёт администратор">
        <GrSlider :model-value="70" :format-tooltip="percent" readonly />
      </GrFormField>
      <GrFormField :error="discountError">
        <template #label>
          Скидка
          <span aria-hidden="true" class="ms-2 text-[var(--gr-muted-fg)]">{{ percent(discount) }}</span>
        </template>
        <GrSlider v-model="discount" :step="5" :format-tooltip="percent" show-tooltip />
      </GrFormField>
    </Specimen>

    <Specimen title="Ступени" note="xs · sm · md · lg — толщина дорожки и размер бегунка.">
      <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-5">
        <template v-for="size in SIZES" :key="size">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ size }}
          </span>
          <GrSlider v-model="stepValue" :size="size" :aria-label="`Прозрачность, ступень ${size}`" :format-tooltip="percent" />
        </template>
      </div>
    </Specimen>

    <Specimen title="Вертикаль" note="Минимум внизу; длину задаёт --gr-slider-length, подсказка уходит вбок.">
      <div class="flex items-end gap-10 [--gr-slider-length:var(--gr-space-32)]">
        <div v-for="band in BANDS" :key="band.id" class="flex flex-col items-center gap-3">
          <GrSlider
            v-model="bands[band.id]"
            orientation="vertical"
            :min="-12"
            :max="12"
            :aria-label="`${band.label} частоты`"
            :format-tooltip="decibel"
            show-tooltip
          />
          <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ band.label }}
          </span>
        </div>
      </div>
    </Specimen>

    <Specimen title="По отпусканию" note="lazy шлёт одно изменение на конце жеста, а не на каждый шаг; клавиатура коммитит сразу." wide>
      <div class="grid gap-6 sm:grid-cols-2">
        <div class="flex flex-col gap-2">
          <GrSlider :model-value="live.value" aria-label="Прозрачность фона, на каждый шаг" :format-tooltip="percent" @update:model-value="(value: GrSliderModelValue) => commit(live, value)" />
          <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            Без lazy · изменений ушло: {{ live.sent }}
          </p>
        </div>
        <div class="flex flex-col gap-2">
          <GrSlider :model-value="lazy.value" aria-label="Прозрачность фона, по отпусканию" :format-tooltip="percent" lazy @update:model-value="(value: GrSliderModelValue) => commit(lazy, value)" />
          <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            С lazy · изменений ушло: {{ lazy.sent }}
          </p>
        </div>
      </div>
    </Specimen>
  </div>
</template>
