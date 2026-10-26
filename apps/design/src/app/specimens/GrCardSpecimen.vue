<script setup lang="ts">
import { ref } from 'vue'
import type { GrCardPadding, GrCardVariant } from '@feugene/granularity/components/GrCard'
import IconPlus from '~icons/lucide/plus'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const variants: readonly { variant: GrCardVariant, title: string, description: string, body: string }[] = [
  {
    variant: 'outlined',
    title: 'Outlined',
    description: 'Лист и волосяная рамка',
    body: 'Основная карточка: список проектов, виджеты дашборда, блоки настроек.',
  },
  {
    variant: 'elevated',
    title: 'Elevated',
    description: 'Рамка и тень',
    body: 'Когда карточка лежит на листе, а не на бумаге: тень отделяет край там, где тона нет.',
  },
  {
    variant: 'ghost',
    title: 'Ghost',
    description: 'Только фон',
    body: 'Группа внутри другой карточки: заголовок и текст без второй рамки.',
  },
]

const paddings: readonly { padding: GrCardPadding, label: string }[] = [
  { padding: 'sm', label: 'sm · 12 px' },
  { padding: 'md', label: 'md · 16 px' },
  { padding: 'lg', label: 'lg · 24 px' },
]

const members = [
  { id: 'anna', title: 'Анна Соколова', description: 'Финансы · владелец' },
  { id: 'ilya', title: 'Илья Орлов', description: 'Продажи · редактор' },
  { id: 'maria', title: 'Мария Белова', description: 'Бухгалтерия · читатель' },
]

const created = ref(0)

// Ссылки образцов ведут на «#»: переход по нему бросил бы страницу к началу.
function keepOnPage(event: MouseEvent): void {
  if (event.target instanceof Element && event.target.closest('a[href="#"]'))
    event.preventDefault()
}
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrCard title="Отчёт за квартал" :heading-level="5" padding="sm">
      <template #actions>
        <GrBadge tone="success" size="sm">
          Готов
        </GrBadge>
      </template>
      <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
        Выручка выросла на треть.
      </p>
    </GrCard>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2" @click="keepOnPage">
    <Specimen title="Виды" note="Край держит рамка, тень или только фон: ghost — для карточки внутри карточки." wide>
      <div class="grid items-start gap-4 md:grid-cols-3">
        <GrCard
          v-for="card in variants"
          :key="card.variant"
          as="article"
          :variant="card.variant"
          :title="card.title"
          :description="card.description"
          :heading-level="5"
          padding="md"
        >
          <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
            {{ card.body }}
          </p>
        </GrCard>
      </div>
    </Specimen>

    <Specimen title="Шапка, тело, подвал" note="Заголовок — настоящий h5, метка — в шапке, действие — в подвале.">
      <GrCard
        as="article"
        title="Отчёт за квартал"
        description="Финансы · обновлён сегодня"
        :heading-level="5"
        padding="md"
      >
        <template #actions>
          <GrBadge tone="success" size="sm">
            Готов
          </GrBadge>
        </template>

        <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
          Выручка выросла на треть, расходы на привлечение — на 8 %.
        </p>

        <template #footer>
          <div class="flex items-center justify-between gap-3">
            <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
              12 страниц
            </span>
            <GrButton size="sm" variant="ghost" tone="neutral">
              Открыть отчёт
            </GrButton>
          </div>
        </template>
      </GrCard>
    </Specimen>

    <Specimen title="Край в край" note="Шапка из title отбивается сама, содержимое без отступа: список встаёт вплотную к рамке.">
      <GrCard title="Участники проекта" :heading-level="5">
        <GrList variant="ghost">
          <GrListItem v-for="member in members" :key="member.id" :title="member.title" :description="member.description" density="compact" />
        </GrList>
      </GrCard>
    </Specimen>

    <Specimen title="Ссылка" note="Нажимается вся карточка, имя ссылки — её заголовок.">
      <GrCard
        href="#"
        title="Гайд по тону"
        description="Редакция · 3 окт"
        :heading-level="5"
        padding="md"
      >
        <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
          Как писать кнопки, ошибки и пустые состояния.
        </p>
      </GrCard>
    </Specimen>

    <Specimen title="Кнопка" note="Корень — button, поэтому заголовка нет: внутри кнопки он невалиден.">
      <GrCard clickable padding="md" @click="created++">
        <span class="flex items-center gap-3">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--gr-radius-md)] bg-[var(--gr-muted)] text-[var(--gr-muted-fg)]">
            <GrIcon>
              <IconPlus />
            </GrIcon>
          </span>
          <span class="flex min-w-0 flex-col gap-0.5">
            <span class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">Новый проект</span>
            <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
              {{ created === 0 ? 'Пустой или из шаблона' : `Создано черновиков: ${created}` }}
            </span>
          </span>
        </span>
      </GrCard>
    </Specimen>

    <Specimen title="Подсветка без действия" note="hoverable: карточка отзывается на курсор, а нажимаются только кнопки внутри.">
      <GrCard
        hoverable
        title="Счёт СЧ-1046"
        description="Студия «Лён» · 48 000 ₽"
        :heading-level="5"
        padding="md"
      >
        <div class="flex flex-wrap gap-2">
          <GrButton size="sm" variant="secondary" tone="neutral">
            Скачать PDF
          </GrButton>
          <GrButton size="sm" variant="ghost" tone="neutral">
            Отправить
          </GrButton>
        </div>
      </GrCard>
    </Specimen>

    <Specimen title="Отступы" note="По умолчанию none: отступ задаёт раскладка, а не карточка.">
      <div class="grid items-start gap-3 sm:grid-cols-3">
        <GrCard v-for="item in paddings" :key="item.padding" :padding="item.padding">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ item.label }}
          </span>
        </GrCard>
      </div>
    </Specimen>
  </div>
</template>
