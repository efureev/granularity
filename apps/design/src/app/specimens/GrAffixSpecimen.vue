<script setup lang="ts">
import { reactive } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const claimFields = [
  { label: 'Товар', value: 'Льняная рубашка, размер M' },
  { label: 'Заказ', value: '№ 4821 от 20 октября' },
  { label: 'Причина', value: 'Не подошёл размер' },
  { label: 'Способ', value: 'Курьером, 22 октября с 10 до 12' },
  { label: 'Адрес', value: 'Москва, Лесная ул., 7, кв. 12' },
  { label: 'Возврат денег', value: 'На карту •• 4417' },
  { label: 'Комментарий', value: 'Позвоните за полчаса до приезда' },
]

const profile = reactive({
  name: 'Анна Соколова',
  role: 'Арт-директор',
  email: 'anna@studio.ru',
  phone: '+7 916 204-18-40',
  city: 'Москва',
  team: 'Команда «Лён»',
})
const profileFields = [
  { key: 'name', label: 'Имя' },
  { key: 'role', label: 'Должность' },
  { key: 'email', label: 'Почта' },
  { key: 'phone', label: 'Телефон' },
  { key: 'city', label: 'Город' },
  { key: 'team', label: 'Команда' },
] as const
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <!-- `isolate`: у прилипшей панели свой слой, и без контекста наложения она легла бы поверх липких вкладок страницы. -->
  <div v-if="preview" class="isolate flex w-full flex-col gap-3">
    <!-- Аффикс — прямой ребёнок скроллера: обрезающий предок между ними снял бы прилипание. -->
    <div
      role="region"
      tabindex="0"
      aria-label="Заявка на возврат"
      class="h-[104px] overflow-y-auto rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
    >
      <GrAffix style="--gr-affix-bg: var(--gr-card)">
        <div class="flex items-center justify-between gap-3 px-3 py-2.5">
          <span class="truncate text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">Заявка № 4821</span>
          <GrButton size="sm">
            Отправить
          </GrButton>
        </div>
      </GrAffix>
      <dl class="flex flex-col gap-2 px-3 pb-3">
        <div v-for="field in claimFields" :key="field.label" class="flex justify-between gap-3">
          <dt class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ field.label }}
          </dt>
          <dd class="truncate text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">
            {{ field.value }}
          </dd>
        </div>
      </dl>
    </div>
  </div>
  <div v-else class="isolate grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Прилипает к верху блока" note="фон и тень — только в прилипшем виде; слот знает, прилипла ли панель">
      <!-- Аффикс — прямой ребёнок скроллера: обрезающий предок между ними снял бы прилипание. -->
      <div
        role="region"
        tabindex="0"
        aria-label="Заявка на возврат"
        class="h-[260px] overflow-y-auto rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
      >
        <p class="px-4 pb-1 pt-4 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-base)] text-[var(--gr-muted-fg)]">
          Проверьте заявку перед отправкой — после неё изменить способ возврата нельзя.
        </p>
        <GrAffix style="--gr-affix-bg: var(--gr-card)">
          <template #default="{ stuck }">
            <div class="flex items-center justify-between gap-3 px-4 py-3">
              <div class="flex min-w-0 flex-col">
                <span class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">Заявка № 4821</span>
                <span class="truncate text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
                  {{ stuck ? 'Панель прилипла — кнопки всегда под рукой' : 'Прокрутите: панель останется наверху' }}
                </span>
              </div>
              <div class="flex shrink-0 gap-2">
                <GrButton variant="ghost" tone="neutral" size="sm">
                  Отмена
                </GrButton>
                <GrButton size="sm">
                  Отправить
                </GrButton>
              </div>
            </div>
          </template>
        </GrAffix>
        <dl class="flex flex-col gap-3 px-4 pb-4 pt-2">
          <div v-for="field in claimFields" :key="field.label" class="flex flex-col gap-0.5">
            <dt class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
              {{ field.label }}
            </dt>
            <dd class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
              {{ field.value }}
            </dd>
          </div>
        </dl>
      </div>
    </Specimen>

    <Specimen title="Действия у нижнего края" note="«Сохранить» не уезжает за экран, пока форма не кончилась; после неё панель отпускается">
      <div
        role="region"
        tabindex="0"
        aria-label="Профиль участника"
        class="h-[260px] overflow-y-auto rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
      >
        <div class="flex flex-col gap-4 px-4 pb-2 pt-4">
          <GrFormField v-for="field in profileFields" :key="field.key" :label="field.label">
            <GrInput v-model="profile[field.key]" size="sm" />
          </GrFormField>
        </div>
        <GrAffix placement="bottom" style="--gr-affix-bg: var(--gr-card)">
          <div class="flex justify-end gap-2 px-4 py-3">
            <GrButton variant="ghost" tone="neutral" size="sm">
              Отмена
            </GrButton>
            <GrButton size="sm">
              Сохранить
            </GrButton>
          </div>
        </GrAffix>
        <p class="border-t border-[var(--gr-brd)] px-4 py-4 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          Профиль видят участники команды. Почту и телефон — только администраторы.
        </p>
      </div>
    </Specimen>
  </div>
</template>
