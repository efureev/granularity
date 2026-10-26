<script setup lang="ts">
import type { GrEmptyStateSize } from '@feugene/granularity/components/GrEmptyState'
import IconFileText from '~icons/lucide/file-text'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const sizes: readonly GrEmptyStateSize[] = ['xs', 'sm', 'md']
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrEmptyState
      title="Здесь появятся отчёты"
      description="Соберите первый из шаблона."
      size="xs"
      :heading-level="5"
    />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Первый запуск и пустой поиск" note="Ещё ничего нет — крупно и с действием; не нашлось — компактно, там, где ждали данные, и выход из фильтра." wide>
      <div class="grid items-start gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <GrEmptyState
          title="Здесь появятся отчёты"
          description="Соберите первый отчёт из шаблона или загрузите таблицу — мы разложим её по разделам."
          size="lg"
          :heading-level="5"
        >
          <template #icon>
            <GrIcon size="lg">
              <IconFileText />
            </GrIcon>
          </template>
          <GrButton>
            Создать отчёт
          </GrButton>
          <GrButton variant="ghost" tone="neutral">
            Загрузить таблицу
          </GrButton>
        </GrEmptyState>

        <GrEmptyState
          kind="search"
          title="Ничего не нашлось"
          description="Нет документов с «квартал 5» — проверьте номер квартала."
          size="sm"
          :heading-level="5"
        >
          <GrButton size="sm" variant="secondary" tone="neutral">
            Сбросить поиск
          </GrButton>
        </GrEmptyState>
      </div>
    </Specimen>

    <Specimen title="Ступени" note="size двигает поле, коробку иконки и кегль: xs и sm — для ячейки таблицы и панели списка." wide>
      <div class="grid items-start gap-4 md:grid-cols-3">
        <GrEmptyState
          v-for="size in sizes"
          :key="size"
          :size="size"
          title="Пока нет выплат"
          :description="`Ступень ${size}`"
          :heading-level="5"
        />
      </div>
    </Specimen>

    <Specimen title="Внутри карточки" note="variant=ghost снимает рамку и фон: вокруг уже есть поверхность.">
      <GrCard title="Приглашения" :heading-level="5">
        <GrEmptyState
          variant="ghost"
          size="sm"
          title="Никого не пригласили"
          description="Пригласите коллег по почте — они получат доступ к проекту."
          :heading-level="6"
        >
          <GrButton size="sm" variant="secondary" tone="neutral">
            Пригласить
          </GrButton>
        </GrEmptyState>
      </GrCard>
    </Specimen>

    <Specimen title="Тексты по умолчанию" note="Без title заголовок берётся из словаря: «Пока пусто» и «Ничего не найдено». Описание не подставляется никогда.">
      <div class="grid items-start gap-4 sm:grid-cols-2">
        <GrEmptyState size="sm" :heading-level="5" />
        <GrEmptyState kind="search" size="sm" :heading-level="5" />
      </div>
    </Specimen>
  </div>
</template>
