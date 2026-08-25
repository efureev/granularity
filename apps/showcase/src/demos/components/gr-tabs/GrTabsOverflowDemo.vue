<script setup lang="ts">
import { ref } from 'vue'

import { GrSegmented, GrTabs } from '@feugene/granularity'

/**
 * Ширина контейнера, а не окна: переполнение считается по доступному месту,
 * поэтому увидеть его можно не трогая размер браузера.
 *
 * Вариант переключается рядом намеренно. Полоса `pills` несёт свой непрозрачный
 * фон, `line` прозрачна и лежит на фоне страницы — затухание обязано читаться на
 * обоих, и именно поэтому оно сделано маской, а не градиентом-подложкой:
 * градиенту было бы неоткуда взять цвет подложки для `line`.
 */
const width = ref('260')
const widths = [
  { value: '260', label: '260px' },
  { value: '375', label: '375px' },
  { value: '520', label: '520px' },
]

const variant = ref<'pills' | 'line'>('pills')
const variants = [
  { value: 'pills', label: 'pills' },
  { value: 'line', label: 'line' },
]

const active = ref('overview')
const tabs = [
  { value: 'overview', label: 'Обзор' },
  { value: 'security', label: 'Безопасность' },
  { value: 'notifications', label: 'Уведомления' },
  { value: 'plan', label: 'Тариф' },
  { value: 'account', label: 'Аккаунт' },
  { value: 'sessions', label: 'Сеансы' },
  { value: 'api', label: 'Ключи API' },
]
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-4">
      <label class="grid gap-1 text-[length:var(--gr-control-text-sm)]">
        <span class="showcase-demo-text">Ширина контейнера</span>
        <GrSegmented v-model="width" :options="widths" size="sm" />
      </label>

      <label class="grid gap-1 text-[length:var(--gr-control-text-sm)]">
        <span class="showcase-demo-text">Вид ряда</span>
        <GrSegmented v-model="variant" :options="variants" size="sm" />
      </label>
    </div>

    <div
      data-demo-tabs-box
      class="rounded-[var(--gr-radius-md)] border border-dashed border-[var(--gr-brd)] p-3"
      :style="{ width: `${width}px`, maxWidth: '100%' }"
    >
      <GrTabs v-model="active" :tabs="tabs" :variant="variant" size="sm" />
    </div>

    <p class="showcase-demo-text text-sm">
      Ряд гаснет <b>у того края, за которым есть продолжение</b>: в начале — справа, в конце —
      слева, в середине — с обеих сторон. Прокрутите ряд и проследите, как затухание переезжает.
      Влезает целиком — не гаснет вовсе.

      <br><br>

      Полоса прокрутки у ряда скрыта намеренно: под вкладками она выглядит чужеродно, а на macOS
      система прячет её до начала прокрутки — то есть показала бы продолжение уже после того, как
      пользователь о нём догадался.

      <br><br>

      Вкладки за краем <b>достижимы и без мыши</b>: стрелки ведут по ряду, а активная вкладка сама
      подтягивается в видимую часть — в том числе когда её выбрали снаружи. Отступ прокрутки равен
      ширине затухания, поэтому кольцо фокуса не оказывается под ним. Ширина — хук
      <code>--gr-tabs-scroll-fade</code>.
    </p>
  </div>
</template>
