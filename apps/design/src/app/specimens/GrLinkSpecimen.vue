<script setup lang="ts">
import Specimen from './Specimen.vue'
import { keepOnPage } from './support'

defineProps<{ preview?: boolean }>()

const linkTones = [
  { tone: 'primary', label: 'Открыть отчёт' },
  { tone: 'neutral', label: 'Все проекты' },
  { tone: 'success', label: 'Чек оплаты' },
  { tone: 'warning', label: 'Проверить лимит' },
  { tone: 'danger', label: 'Удалить черновик' },
  { tone: 'info', label: 'Как это работает' },
  { tone: 'slate', label: 'Архив' },
  { tone: 'azure', label: 'Партнёрам' },
] as const

const linkSizes = ['xs', 'sm', 'md', 'lg'] as const
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3" @click="keepOnPage">
    <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-base)]">
      Нажимая «Продолжить», вы принимаете
      <GrLink href="#" underline="always">
        условия сервиса
      </GrLink>
      и соглашаетесь получать письма о заказе.
    </p>
    <div class="flex flex-wrap items-center gap-x-5 gap-y-1">
      <GrLink href="#">
        Открыть отчёт
      </GrLink>
      <GrLink href="#" external>
        Документация API
      </GrLink>
    </div>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2" @click="keepOnPage">
    <Specimen title="Тоны" note="цвет — из роли текста тона, а не насыщенной: на фоне страницы держит контраст">
      <div class="flex flex-wrap gap-x-5 gap-y-2">
        <GrLink v-for="item in linkTones" :key="item.tone" href="#" :tone="item.tone">
          {{ item.label }}
        </GrLink>
      </div>
    </Specimen>

    <Specimen title="Приглушённые" note="окрашиваются при наведении — для подвала и второстепенных переходов">
      <div class="flex flex-wrap gap-x-5 gap-y-2">
        <GrLink href="#" variant="muted">
          Политика конфиденциальности
        </GrLink>
        <GrLink href="#" variant="muted">
          Условия использования
        </GrLink>
        <GrLink href="#" variant="muted" tone="danger">
          Удалить аккаунт
        </GrLink>
      </div>
    </Specimen>

    <Specimen title="В тексте" note="подчёркивание всегда — ссылка узнаётся внутри абзаца не только цветом">
      <p class="max-w-[60ch] text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-base)]">
        Нажимая «Продолжить», вы принимаете
        <GrLink href="#" underline="always" size="sm">
          условия сервиса
        </GrLink>
        и соглашаетесь получать письма о статусе заказа. Отписаться можно в
        <GrLink href="#" underline="always" size="sm" tone="neutral">
          настройках уведомлений
        </GrLink>.
      </p>
    </Specimen>

    <Specimen title="Новая вкладка и недоступная" note="значок и подпись «откроется в новой вкладке» — по факту target, а не по пропу">
      <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
        <GrLink href="#" external>
          Документация API
        </GrLink>
        <GrLink href="#" target="_blank">
          Статус сервиса
        </GrLink>
        <GrLink href="#" external :external-icon="false">
          Без значка
        </GrLink>
        <GrLink disabled>
          Архив недоступен
        </GrLink>
      </div>
    </Specimen>

    <Specimen title="Ступени" note="кегль ссылки — по шкале пакета; в тексте берите кегль абзаца">
      <div class="flex flex-wrap items-baseline gap-x-5 gap-y-2">
        <GrLink v-for="step in linkSizes" :key="step" href="#" :size="step">
          Ступень {{ step }}
        </GrLink>
      </div>
    </Specimen>

    <Specimen title="Подчёркивание" note="по наведению, всегда и никогда — для меню, где ссылку выдаёт место">
      <div class="flex flex-wrap gap-x-5 gap-y-2">
        <GrLink href="#" underline="auto">
          По наведению
        </GrLink>
        <GrLink href="#" underline="always">
          Всегда
        </GrLink>
        <GrLink href="#" underline="none">
          Никогда
        </GrLink>
      </div>
    </Specimen>
  </div>
</template>
