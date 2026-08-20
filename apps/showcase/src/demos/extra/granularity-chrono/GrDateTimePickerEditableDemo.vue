<script setup lang="ts">
import { ref } from 'vue'

// `GrDateTimePicker` подставляется авто-импортом.

/**
 * Момент, который быстрее набрать, чем найти кликами.
 *
 * Локаль здесь не для украшения: она задаёт и порядок частей, и разделители,
 * и то, чем разбор считает набранное. Два поля рядом показывают это без слов.
 */
const TODAY = new Date(2026, 7, 12)

const ru = ref<Date | null>(new Date(2026, 7, 12, 9, 30))
const us = ref<Date | null>(new Date(2026, 7, 12, 9, 30))
</script>

<template>
  <div class="grid gap-4 justify-items-start">
    <div class="grid gap-3 sm:grid-cols-2 w-full">
      <GrDateTimePicker
        v-model="ru"
        editable
        :today="TODAY"
        locale="ru-RU"
        aria-label="Начало, русская локаль"
      />

      <GrDateTimePicker
        v-model="us"
        editable
        :today="TODAY"
        locale="en-US"
        aria-label="Start, US locale"
      />
    </div>

    <p class="showcase-demo-text text-sm opacity-70">
      Наберите дату руками: слева ждут <strong>ДД.ММ.ГГГГ</strong>, справа — <strong>MM/DD/YYYY</strong>.
      Порядок частей не зашит в компонент, его знает локаль; разделители разбору безразличны —
      точка, слэш и пробел равноценны, потому что считаются группы цифр, а не символы между ними.
    </p>

    <p class="showcase-demo-text text-sm opacity-70">
      Панель идёт за набором: дата набрана целиком — она подсвечена, и сетка перешла на её месяц;
      набран час — подсвечен час, дописаны минуты — минуты. Модель при этом не меняется, её меняет
      <strong>Enter</strong> или уход фокуса. Набирать вслепую, глядя на панель с прежним значением,
      — ровно та ошибка, которую поле и должно было убрать.
    </p>

    <p class="showcase-demo-text text-sm opacity-70">
      Наберите одну дату без времени — время останется прежним: не набранное не меняется. Наберите
      мусор и уйдите фокусом — поле вернётся к значению. Поле показывает значение цифрами именно
      потому, что их можно править на месте: с «12 авг. 2026 г.» правка числа оставила бы разбору
      две группы цифр вместо трёх и молча откатилась бы.
    </p>
  </div>
</template>
