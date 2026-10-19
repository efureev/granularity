<script setup lang="ts">
import IconCheck from '~icons/lucide/check'
import IconX from '~icons/lucide/x'

import DocSection from '../parts/DocSection.vue'

interface Rule {
  title: string
  lead: string
  good: { text: string, tone?: 'danger' | 'neutral', variant?: 'primary' | 'secondary' }[]
  bad: { text: string, tone?: 'danger' | 'neutral', variant?: 'primary' | 'secondary' }[]
}

const buttonRules: Rule[] = [
  {
    title: 'Кнопка — глагол и объект',
    lead: 'Подпись говорит, что случится после нажатия. «ОК» и «Да» заставляют перечитать вопрос.',
    good: [{ text: 'Сохранить отчёт' }, { text: 'Отмена', tone: 'neutral', variant: 'secondary' }],
    bad: [{ text: 'ОК' }, { text: 'Нет', tone: 'neutral', variant: 'secondary' }],
  },
  {
    title: 'Опасное называется полностью',
    lead: 'Необратимое действие — с последствием в подписи, а рядом безопасный выход.',
    good: [{ text: 'Удалить навсегда', tone: 'danger' }, { text: 'Оставить', tone: 'neutral', variant: 'secondary' }],
    bad: [{ text: 'Удалить', tone: 'danger' }, { text: 'Отмена', tone: 'danger', variant: 'secondary' }],
  },
]
</script>

<template>
  <div class="flex flex-col gap-14">
    <DocSection v-for="rule in buttonRules" :key="rule.title" :title="rule.title" :lead="rule.lead">
      <div class="grid gap-4 md:grid-cols-2">
        <div class="flex flex-col gap-4 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
          <p class="flex items-center gap-1.5 text-[length:var(--gr-text-xs)] font-600 leading-[var(--gr-leading-xs)] text-[var(--gr-success-text)]">
            <GrIcon size="xs">
<IconCheck />
</GrIcon> Так
          </p>
          <div class="flex flex-wrap gap-2">
            <GrButton v-for="button in rule.good" :key="button.text" :tone="button.tone" :variant="button.variant">
              {{ button.text }}
            </GrButton>
          </div>
        </div>
        <div class="flex flex-col gap-4 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
          <p class="flex items-center gap-1.5 text-[length:var(--gr-text-xs)] font-600 leading-[var(--gr-leading-xs)] text-[var(--gr-danger-text)]">
            <GrIcon size="xs">
<IconX />
</GrIcon> Не так
          </p>
          <div class="flex flex-wrap gap-2">
            <GrButton v-for="button in rule.bad" :key="button.text" :tone="button.tone" :variant="button.variant">
              {{ button.text }}
            </GrButton>
          </div>
        </div>
      </div>
    </DocSection>

    <DocSection title="Ошибка говорит, как исправить" lead="Что случилось и что сделать — без извинений и без кода ошибки в первой строке.">
      <div class="grid gap-4 md:grid-cols-2">
        <GrAlert tone="danger" title="Файл больше 20 МБ">
          Сожмите его или загрузите по частям — каждая часть до 20 МБ.
        </GrAlert>
        <GrAlert tone="danger" title="Ошибка 413">
          Извините, что-то пошло не так. Попробуйте ещё раз.
        </GrAlert>
      </div>
      <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        Слева — так, справа — не так.
      </p>
    </DocSection>

    <DocSection title="Регистр и знаки" lead="Заглавная — только в начале фразы. Без капса, без эмодзи и без точки в подписи кнопки или заголовке.">
      <ul class="grid gap-3 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-base)] md:grid-cols-3">
        <li class="rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
          <span class="block text-[var(--gr-success-text)]">Новый проект</span>
          <span class="block text-[var(--gr-danger-text)] line-through">Новый Проект</span>
        </li>
        <li class="rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
          <span class="block text-[var(--gr-success-text)]">Сохранить</span>
          <span class="block text-[var(--gr-danger-text)] line-through">СОХРАНИТЬ</span>
        </li>
        <li class="rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
          <span class="block text-[var(--gr-success-text)]">Отчёт отправлен</span>
          <span class="block text-[var(--gr-danger-text)] line-through">Отчёт отправлен!</span>
        </li>
      </ul>
    </DocSection>
  </div>
</template>
