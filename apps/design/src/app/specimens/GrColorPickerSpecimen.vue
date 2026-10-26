<script setup lang="ts">
import { computed, ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const SIZES = ['xs', 'sm', 'md', 'lg'] as const

// Цвета меток — данные палитры, а не оформление витрины: модель пикера — hex.
const LABEL_PRESETS = ['#c96442', '#141413', '#5e5d59', '#2d6cc8', '#5f7a45', '#b8433a', '#c7922f', '#7a5f93', '#e8e6dc', '#ffffff']

const cardColor = ref('#c96442')

const labelColor = ref('#c96442')
const overlayColor = ref('#2d6cc880')
const pickedColor = ref('#5f7a45')
const brandColor = ref('#5f7a45')
const stepColor = ref('#2d6cc8')
const boxColor = ref('#c7922f')
const pillColor = ref('#7a5f93')

const BRAND_GUIDE = ['#141413', '#c96442', '#2d6cc8']
const brandError = computed(() => (BRAND_GUIDE.includes(brandColor.value.toLowerCase()) ? undefined : 'Цвет вне брендбука — выберите из предустановок'))
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrFormField label="Цвет метки">
      <GrColorPicker v-model="cardColor" :presets="LABEL_PRESETS" />
    </GrFormField>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="В поле" note="Поле открывает лист: каналы, HEX и предустановки.">
      <GrFormField label="Цвет метки" hint="Предустановки — палитра меток проекта">
        <GrColorPicker v-model="labelColor" :presets="LABEL_PRESETS" />
      </GrFormField>
    </Specimen>

    <Specimen title="Квадрат и прозрачность" note="view=&quot;area&quot; — квадрат насыщенности и светлоты; alpha добавляет канал и восьмизначный hex.">
      <GrFormField label="Цвет подложки" hint="Квадрат оттенка и прозрачность">
        <GrColorPicker v-model="overlayColor" view="area" alpha />
      </GrFormField>
    </Specimen>

    <Specimen title="Пипетка" note="Кнопка рядом с HEX есть только там, где браузер даёт EyeDropper, — сегодня это Chromium.">
      <GrFormField label="Цвет с экрана">
        <GrColorPicker v-model="pickedColor" eyedropper />
      </GrFormField>
    </Specimen>

    <Specimen title="Состояния" note="Только чтение открывает лист, но цвет не меняет; недоступное поле не открывается вовсе.">
      <GrFormField label="Цвет темы" hint="Задаёт администратор пространства">
        <GrColorPicker model-value="#2d6cc8" readonly />
      </GrFormField>
      <GrFormField label="Цвет архива" disabled>
        <GrColorPicker model-value="#5e5d59" />
      </GrFormField>
      <GrFormField label="Цвет бренда" :error="brandError" required>
        <GrColorPicker v-model="brandColor" :presets="BRAND_GUIDE" />
      </GrFormField>
    </Specimen>

    <Specimen title="Ступени" note="Высота поля — по шкале контролов: 28 · 32 · 40 · 44.">
      <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3">
        <template v-for="size in SIZES" :key="size">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ size }}
          </span>
          <GrColorPicker v-model="stepColor" :size="size" :aria-label="`Цвет, ступень ${size}`" />
        </template>
      </div>
    </Specimen>

    <Specimen title="Форма рамки" note="box — скругление полей ввода, pill — пилюля; приложению форму задаёт тема.">
      <GrFormField label="Рамка box">
        <GrColorPicker v-model="boxColor" shape="box" />
      </GrFormField>
      <GrFormField label="Рамка pill">
        <GrColorPicker v-model="pillColor" shape="pill" />
      </GrFormField>
    </Specimen>
  </div>
</template>
