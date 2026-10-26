<script setup lang="ts">
import { ref } from 'vue'
import type { GrStatisticSize } from '@feugene/granularity/components/GrStatistic'
import IconTimer from '~icons/lucide/timer'
import IconUsers from '~icons/lucide/users'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const sizes: readonly GrStatisticSize[] = ['xs', 'sm', 'md', 'lg']

const revenueSteps = [743_210, 1_284_500, 968_040] as const
const revenueStep = ref(0)
const statsLoading = ref(false)

function refreshRevenue(): void {
  revenueStep.value = (revenueStep.value + 1) % revenueSteps.length
}

const opened = ref(0)

// Ссылки образцов ведут на «#»: переход по нему бросил бы страницу к началу.
function keepOnPage(event: MouseEvent): void {
  if (event.target instanceof Element && event.target.closest('a[href="#"]'))
    event.preventDefault()
}

const mutedClass = 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]'
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrStatistic title="Выручка за октябрь" :value="4.2" :precision="1" suffix="млн ₽" locale="ru-RU">
      <template #trend>
        <GrDelta :value="12.5" :precision="1" suffix="%" locale="ru-RU" show-arrow />
        <span>к сентябрю</span>
      </template>
    </GrStatistic>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2" @click="keepOnPage">
    <Specimen title="С динамикой" note="Крупная цифра и GrDelta в строке динамики; рост оттока — плохая новость, и он красный." wide>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GrCard padding="md">
          <GrStatistic title="Выручка за октябрь" :value="4.2" :precision="1" suffix="млн ₽" locale="ru-RU">
            <template #trend>
              <GrDelta :value="12.5" :precision="1" suffix="%" locale="ru-RU" show-arrow />
              <span>к сентябрю</span>
            </template>
          </GrStatistic>
        </GrCard>
        <GrCard padding="md">
          <GrStatistic title="Клиентов" :value="318" locale="ru-RU">
            <template #trend>
              <GrDelta :value="24" locale="ru-RU" show-arrow />
              <span>новых за месяц</span>
            </template>
          </GrStatistic>
        </GrCard>
        <GrCard padding="md">
          <GrStatistic title="Средний чек" :value="13200" suffix="₽" locale="ru-RU">
            <template #trend>
              <GrDelta :value="-3.1" :precision="1" suffix="%" locale="ru-RU" show-arrow />
              <span>к сентябрю</span>
            </template>
          </GrStatistic>
        </GrCard>
        <GrCard padding="md">
          <GrStatistic title="Отток" :value="2.4" :precision="1" suffix="%" locale="ru-RU">
            <template #trend>
              <GrDelta :value="0.6" :precision="1" suffix="п. п." polarity="negative-good" locale="ru-RU" show-arrow />
              <span>за месяц</span>
            </template>
          </GrStatistic>
        </GrCard>
      </div>
    </Specimen>

    <Specimen title="Строка динамики" note="trend задаёт иконку и скрытую подпись, цвет — полярность: стрелка вверх зелёная, только где рост хорош.">
      <div class="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <GrStatistic title="Заказов" :value="482" trend="up" trend-text="+12,5 % к неделе" locale="ru-RU" />
        <GrStatistic title="Возвратов" :value="17" trend="down" trend-text="−4 к неделе" locale="ru-RU" />
        <GrStatistic title="Время ответа" :value="320" suffix="мс" trend="flat" trend-text="без изменений" locale="ru-RU" />
        <GrStatistic
          title="Отток"
          :value="2.4"
          :precision="1"
          suffix="%"
          trend="up"
          trend-text="+0,6 п. п."
          trend-polarity="negative-good"
          locale="ru-RU"
        />
      </div>
    </Specimen>

    <Specimen title="Тон по знаку" note="polarity красит значение по знаку: маржа в минусе и перерасход в плюсе — красные, у сальдо знак о качестве не говорит.">
      <div class="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <GrStatistic title="Маржа" :value="-1240" suffix="₽" polarity="positive-good" locale="ru-RU" />
        <GrStatistic title="Прибыль за неделю" :value="3200" suffix="₽" polarity="positive-good" locale="ru-RU" />
        <GrStatistic title="Перерасход бюджета" :value="18400" suffix="₽" polarity="negative-good" locale="ru-RU" />
        <GrStatistic title="Сальдо расчётов" :value="-560" suffix="₽" polarity="none" locale="ru-RU" />
      </div>
    </Specimen>

    <Specimen title="Ступени" note="size двигает кегли подписи, значения, приписок и динамики разом.">
      <div class="flex flex-wrap items-end gap-x-8 gap-y-5">
        <GrStatistic
          v-for="size in sizes"
          :key="size"
          :size="size"
          :title="`size ${size}`"
          :value="1284"
          trend="up"
          trend-text="+8 %"
          locale="ru-RU"
        />
      </div>
    </Specimen>

    <Specimen title="Иконка и не число" note="icon — слева от блока; «2 ч 15 мин» выводится как есть, без форматирования.">
      <div class="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <GrStatistic title="Активных клиентов" :value="1284" :icon="IconUsers" locale="ru-RU" />
        <GrStatistic title="Средний звонок" value="2 ч 15 мин" :icon="IconTimer" />
      </div>
    </Specimen>

    <Specimen title="Загрузка" note="Скелетон той же высоты вместо значения: плитка не прыгает, диктор слышит «загрузка».">
      <GrSwitch v-model="statsLoading">
        Данные загружаются
      </GrSwitch>
      <div class="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <GrStatistic title="Выручка за октябрь" :value="4_200_000" suffix="₽" :loading="statsLoading" locale="ru-RU" />
        <GrStatistic title="Клиентов" :value="318" :loading="statsLoading" locale="ru-RU" />
      </div>
    </Specimen>

    <Specimen title="Счётчик" note="animate доводит цифру от прежнего значения, а не от нуля; диктор слышит только итог.">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <GrStatistic
          title="Выручка за сутки"
          :value="revenueSteps[revenueStep]"
          suffix="₽"
          locale="ru-RU"
          animate
          :animate-duration="900"
        />
        <GrButton size="sm" variant="secondary" tone="neutral" @click="refreshRevenue">
          Обновить данные
        </GrButton>
      </div>
    </Specimen>

    <Specimen title="Переход к деталям" note="href даёт ссылку, clickable — кнопку: курсор, подсветка и кольцо фокуса без второй поверхности.">
      <div class="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <GrStatistic title="Заказы" :value="1284" href="#" locale="ru-RU" />
        <div class="flex flex-col gap-1">
          <GrStatistic title="Просроченные счета" :value="7" clickable locale="ru-RU" @click="opened++" />
          <span :class="mutedClass">{{ opened === 0 ? 'Нажмите на плитку' : `Открыто раз: ${opened}` }}</span>
        </div>
      </div>
    </Specimen>
  </div>
</template>
