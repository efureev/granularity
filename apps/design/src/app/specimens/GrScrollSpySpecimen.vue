<script setup lang="ts">
import { useId } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

// Образец рендерится на странице несколько раз: адреса разделов — от экземпляра, а не литералами.
const uid = useId()

const returnText: Record<string, string> = {
  terms: 'Вернуть можно товар без следов носки, в упаковке и с ярлыками. Чек не обязателен — заказ найдётся по номеру телефона.',
  period: '14 дней с момента получения для любого товара и 30 дней для участников программы «Лён+». Срок считается по дате вручения.',
  how: 'Оформите заявку в личном кабинете: выберите товары и причину. Номер заявки придёт на почту.',
  courier: 'Курьер заберёт посылку бесплатно в удобный двухчасовой интервал — упаковку он привезёт с собой.',
  pickup: 'Отнесите товар в любой пункт выдачи: сотрудник проверит его при вас и выдаст квитанцию.',
  money: 'Деньги вернутся на карту, которой платили, за 3–5 рабочих дней после проверки. Бонусы — сразу.',
}
const returnSections = [
  { key: 'terms', label: 'Условия' },
  { key: 'period', label: 'Сроки' },
  { key: 'how', label: 'Как вернуть' },
  { key: 'courier', label: 'Курьером', level: 2 },
  { key: 'pickup', label: 'В пункте выдачи', level: 2 },
  { key: 'money', label: 'Деньги' },
].map(section => ({ ...section, id: `${uid}-return-${section.key}`, text: returnText[section.key] }))

const previewSections = returnSections.slice(0, 3).map(section => ({ ...section, id: `${uid}-preview-${section.key}` }))

const tariffSections = [
  { key: 'start', label: 'Старт', text: 'Один участник, три проекта и 5 ГБ под файлы. Подходит, чтобы попробовать без карты.' },
  { key: 'team', label: 'Команда', text: 'До 25 мест, общие папки и роли. Счёт для бухгалтерии приходит 1-го числа.' },
  { key: 'business', label: 'Бизнес', text: 'Единый вход, журнал действий и поддержка с ответом за час в рабочее время.' },
  { key: 'compare', label: 'Сравнение', text: 'Все тарифы включают шифрование, ежедневные копии и экспорт данных в один клик.' },
  { key: 'faq', label: 'Вопросы', text: 'Сменить тариф можно в любой момент: разница пересчитается по дням до конца месяца.' },
].map(section => ({ ...section, id: `${uid}-tariff-${section.key}` }))
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full items-start gap-3">
    <GrScrollSpy :sections="previewSections" :update-hash="false" aria-label="Оглавление правил возврата" class="w-28 shrink-0" />
    <div
      role="region"
      tabindex="0"
      aria-label="Правила возврата"
      class="h-[104px] min-w-0 flex-1 overflow-y-auto rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)] bg-[var(--gr-card)] px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
    >
      <section v-for="item in previewSections" :id="item.id" :key="item.id" class="flex flex-col gap-0.5 py-2">
        <h5 class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">
          {{ item.label }}
        </h5>
        <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          {{ item.text }}
        </p>
      </section>
    </div>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Оглавление по прокрутке" note="активен раздел, чей заголовок прошли последним; у подраздела подсвечен и родитель">
      <div class="flex items-start gap-4">
        <GrScrollSpy :sections="returnSections" :update-hash="false" aria-label="Оглавление правил возврата" class="w-36 shrink-0" />
        <div
          role="region"
          tabindex="0"
          aria-label="Правила возврата"
          class="h-[260px] min-w-0 flex-1 overflow-y-auto rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] px-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
        >
          <section v-for="item in returnSections" :id="item.id" :key="item.id" class="flex flex-col gap-1 py-3">
            <h5
              class="font-600"
              :class="item.level === 2
                ? 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]'
                : 'text-[length:var(--gr-text-base)] leading-[var(--gr-leading-base)]'"
            >
              {{ item.label }}
            </h5>
            <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-base)] text-[var(--gr-muted-fg)]">
              {{ item.text }}
            </p>
          </section>
        </div>
      </div>
    </Specimen>

    <Specimen title="Линия под липкой шапкой" note="GrScrollSpy · GrAffix: отступ линии равен высоте шапки — раздел под ней не считается прочитанным">
      <!-- `isolate`: у прилипшей шапки свой слой, и без контекста наложения она легла бы поверх липких вкладок страницы. -->
      <div class="isolate flex items-start gap-4">
        <GrScrollSpy :sections="tariffSections" :offset="48" :update-hash="false" aria-label="Оглавление тарифов" class="w-32 shrink-0" />
        <div
          role="region"
          tabindex="0"
          aria-label="Тарифы"
          class="h-[260px] min-w-0 flex-1 overflow-y-auto rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
        >
          <GrAffix :offset="0" style="--gr-affix-bg: var(--gr-card)">
            <div class="flex h-12 items-center justify-between gap-3 px-4">
              <span class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">Тарифы Студии</span>
              <GrBadge tone="primary" size="xs">
                −20% за год
              </GrBadge>
            </div>
          </GrAffix>
          <section v-for="item in tariffSections" :id="item.id" :key="item.id" class="flex flex-col gap-1 px-4 py-3">
            <h5 class="text-[length:var(--gr-text-base)] font-600 leading-[var(--gr-leading-base)]">
              {{ item.label }}
            </h5>
            <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-base)] text-[var(--gr-muted-fg)]">
              {{ item.text }}
            </p>
          </section>
        </div>
      </div>
    </Specimen>
  </div>
</template>
