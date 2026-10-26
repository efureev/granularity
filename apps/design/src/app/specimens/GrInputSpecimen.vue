<script setup lang="ts">
import { reactive, ref } from 'vue'

import IconSearch from '~icons/lucide/search'
import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const SIZES = ['xs', 'sm', 'md', 'lg'] as const

const previewMail = ref('anna@studio.ru')

const states = reactive({
  rest: '',
  filled: 'Анна',
  invalid: 'anna@studio',
  success: 'anna@studio.ru',
  warning: 'anna.ershova@gmail.com',
  loading: 'anna-ershova',
  disabled: 'Команда',
  readonly: 'Д-2024/118',
})

const project = ref('')
const headline = ref('Весенняя коллекция: что нового в мастерской')
const slug = ref('vesna-2025')
const password = ref('')
const query = ref('отчёт за март')
const site = ref('')
const billingMail = ref('buh')
const phone = ref('')
</script>

<template>
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrFormField label="Рабочая почта" hint="На неё придёт приглашение">
      <GrInput v-model="previewMail" type="email" autocomplete="email" clearable />
    </GrFormField>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Состояния" note="Наведение темнит рамку, фокус обводит её; успех и предупреждение добавляют значок, ошибка объясняет строкой под полем." wide>
      <div class="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">покой</span>
          <GrFormField label="Имя">
            <GrInput v-model="states.rest" placeholder="Анна" autocomplete="given-name" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">заполнено</span>
          <GrFormField label="Имя">
            <GrInput v-model="states.filled" autocomplete="given-name" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">ошибка</span>
          <GrFormField label="Почта" error="Нет домена после «@» — например, studio.ru" required>
            <GrInput v-model="states.invalid" type="email" autocomplete="email" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">успех</span>
          <GrFormField label="Почта" hint="Адрес в порядке">
            <GrInput v-model="states.success" type="email" state="success" autocomplete="email" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">предупреждение</span>
          <GrFormField label="Почта" hint="Личный адрес — счета лучше слать на рабочий">
            <GrInput v-model="states.warning" type="email" state="warning" autocomplete="email" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">фоновая проверка</span>
          <GrFormField label="Логин" hint="Проверяем, свободен ли — печатать можно">
            <GrInput v-model="states.loading" autocomplete="username" loading />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">недоступно</span>
          <GrFormField label="Тариф" hint="Меняет владелец пространства" disabled>
            <GrInput v-model="states.disabled" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">только чтение</span>
          <GrFormField label="Номер договора" readonly>
            <GrInput v-model="states.readonly" />
          </GrFormField>
        </div>
      </div>
    </Specimen>

    <Specimen title="Ступени" note="Поле и кнопка одной ступени стоят вровень.">
      <div v-for="size in SIZES" :key="size" class="flex items-center gap-3">
        <span class="w-6 shrink-0 font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ size }}</span>
        <div class="min-w-0 flex-1">
          <GrInput v-model="project" :size="size" placeholder="Название проекта" :aria-label="`Название проекта, ступень ${size}`" />
        </div>
        <GrButton :size="size">
          Создать
        </GrButton>
      </div>
    </Specimen>

    <Specimen title="Счётчик и проверка" note="У лимита счётчик предупреждает, проверка идёт без блокировки ввода.">
      <GrFormField label="Заголовок" hint="Виден в ленте и в письме">
        <GrInput v-model="headline" :maxlength="48" show-count />
      </GrFormField>
      <GrFormField label="Адрес страницы" hint="Проверяем, свободен ли адрес">
        <GrInput v-model="slug" loading describe-addons>
          <template #prefix>
            studio.ru/
          </template>
        </GrInput>
      </GrFormField>
    </Specimen>

    <Specimen title="Пароль и поиск" note="Глаз показывает пароль, крестик появляется, когда есть что стирать; оба доступны с клавиатуры.">
      <GrFormField label="Пароль" hint="Не короче 10 знаков" required>
        <GrInput
          v-model="password"
          type="password"
          autocomplete="new-password"
          password-toggle
          password-show-label="Показать пароль"
          password-hide-label="Скрыть пароль"
        />
      </GrFormField>
      <GrInput
        v-model="query"
        type="search"
        shape="pill"
        addon="inline"
        clearable
        clear-label="Очистить поиск"
        placeholder="Найти документ"
        aria-label="Поиск по документам"
      >
        <template #prefix>
          <GrIcon size="sm">
            <IconSearch />
          </GrIcon>
        </template>
      </GrInput>
    </Specimen>

    <Specimen title="С аддонами" note="Сегмент — отсек под часть значения, которую не печатают; inline — знак внутри рамки.">
      <GrFormField label="Сайт">
        <GrInput v-model="site" placeholder="studio.ru" inputmode="url" describe-addons>
          <template #prefix>
            https://
          </template>
        </GrInput>
      </GrFormField>
      <GrFormField label="Почта для счетов">
        <GrInput v-model="billingMail" describe-addons>
          <template #suffix>
            @studio.ru
          </template>
        </GrInput>
      </GrFormField>
      <GrFormField label="Телефон">
        <GrInput v-model="phone" type="tel" autocomplete="tel-national" placeholder="900 123-45-67" addon="inline" describe-addons>
          <template #prefix>
            +7
          </template>
        </GrInput>
      </GrFormField>
    </Specimen>
  </div>
</template>
