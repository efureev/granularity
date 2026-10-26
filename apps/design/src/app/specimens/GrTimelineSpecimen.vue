<script setup lang="ts">
import IconCheck from '~icons/lucide/check'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

type AuditEvent = {
  id: string
  day: string
  time: string
  datetime: string
  title: string
  description: string
  tone?: 'success' | 'warning' | 'danger' | 'info'
}

const noEvents: AuditEvent[] = []
const audit: AuditEvent[] = [
  { id: 'a1', day: 'Сегодня', time: '14:02', datetime: '2026-10-26T14:02', title: 'Роль изменена', description: 'Иван Петров — теперь администратор', tone: 'warning' },
  { id: 'a2', day: 'Сегодня', time: '11:40', datetime: '2026-10-26T11:40', title: 'Вход с нового устройства', description: 'Анна Соколова · Москва, Safari' },
  { id: 'a3', day: 'Вчера', time: '18:15', datetime: '2026-10-25T18:15', title: 'Счёт оплачен', description: 'СЧ-1046 · 48 000 ₽', tone: 'success' },
  { id: 'a4', day: 'Вчера', time: '09:03', datetime: '2026-10-25T09:03', title: 'Ключ API отозван', description: 'Интеграция «Лён Учёт»', tone: 'danger' },
]
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrTimeline layout="time" density="compact">
      <GrTimelineItem time="10:14" datetime="2026-10-20T10:14" title="Заказ создан" />
      <GrTimelineItem time="10:16" datetime="2026-10-20T10:16" tone="success" title="Оплачен картой" />
      <GrTimelineItem pending title="Доставка" />
    </GrTimeline>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="История заказа" note="тон — у события, о котором он; ещё не случившееся — полой точкой и пунктиром">
      <GrTimeline>
        <GrTimelineItem
          title="Заказ создан"
          description="Анна Соколова · 3 позиции"
          time="20 окт, 10:14"
          datetime="2026-10-20T10:14"
        />
        <GrTimelineItem
          tone="success"
          title="Оплачен картой"
          description="48 000 ₽ · чек отправлен на почту"
          time="20 окт, 10:16"
          datetime="2026-10-20T10:16"
        />
        <GrTimelineItem
          tone="danger"
          title="Курьер не дозвонился"
          description="Доставку перенесли на завтра"
          time="21 окт, 15:40"
          datetime="2026-10-21T15:40"
        />
        <GrTimelineItem
          pending
          title="Доставка"
          description="Ожидается 22 окт, с 10 до 14"
        />
      </GrTimeline>
    </Specimen>

    <Specimen title="Колонка времени" note="время читается столбцом; маркер — слотом, у прошедшего — галочка">
      <GrTimeline layout="time">
        <GrTimelineItem time="10:00" datetime="10:00" title="Итоги квартала" description="Анна · 15 минут">
          <template #marker>
            <GrIcon size="xs">
              <IconCheck />
            </GrIcon>
          </template>
        </GrTimelineItem>
        <GrTimelineItem time="10:15" datetime="10:15" tone="primary" title="Новый тариф" description="Иван · идёт сейчас" />
        <GrTimelineItem time="10:45" datetime="10:45" pending title="Вопросы" description="Все участники" />
      </GrTimeline>
    </Specimen>

    <Specimen title="Группы по дням" note="лента режет набор на дни, не пересортировывая; заголовок дня — не пункт списка">
      <GrTimeline :items="audit" item-key="id" group-by="day" :group-heading-level="5" layout="time" density="compact">
        <template #group="{ group, items }">
          {{ group }} · {{ items.length }}
        </template>
        <template #item="{ item }">
          <GrTimelineItem :time="item.time" :datetime="item.datetime" :tone="item.tone" :title="item.title" :description="item.description" />
        </template>
      </GrTimeline>
    </Specimen>

    <Specimen title="По обе стороны оси" note="презентационная лента истории; в узкой колонке схлопывается в одну сторону">
      <GrTimeline layout="alternate">
        <GrTimelineItem time="2019" title="Основание" description="Три человека и одна комната на Лесной" variant="outlined" />
        <GrTimelineItem time="2021" tone="primary" title="Первый крупный клиент" description="Ребрендинг сети пекарен «Колос»" />
        <GrTimelineItem time="2023" tone="info" title="Своё приложение" description="Студия выпускает инструмент для смет" />
        <GrTimelineItem time="2026" tone="success" title="Сорок человек" description="Офисы в Москве и Казани" />
      </GrTimeline>
    </Specimen>

    <Specimen title="Горизонтальная лента" note="события — колонками; лента прокручивается вбок и достижима с клавиатуры" wide>
      <GrTimeline orientation="horizontal">
        <GrTimelineItem time="20 окт" datetime="2026-10-20" tone="success" title="Принят" description="Склад на Лесной" />
        <GrTimelineItem time="21 окт" datetime="2026-10-21" tone="success" title="Собран" description="3 позиции, 1 коробка" />
        <GrTimelineItem time="21 окт" datetime="2026-10-21" tone="primary" title="В пути" description="Курьер Сергей" />
        <GrTimelineItem pending title="Доставлен" description="Ожидается 22 окт" />
      </GrTimeline>
    </Specimen>

    <Specimen title="Загрузка и пустая лента" note="заглушки держат высоту; «пусто» лента определяет сама — по данным или по слоту">
      <div class="grid gap-6 sm:grid-cols-2">
        <GrTimeline loading :loading-rows="3" />
        <GrTimeline :items="noEvents" item-key="id" empty-text="Событий пока нет — они появятся после первого заказа">
          <template #item="{ item }">
            <GrTimelineItem :title="item.title" />
          </template>
        </GrTimeline>
      </div>
    </Specimen>
  </div>
</template>
