<script setup lang="ts">
import { type ComponentPublicInstance, computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

import type { GrButtonLoadingIndicator, GrButtonSize } from '@feugene/granularity/components/GrButton'
import IconChevronDown from '~icons/lucide/chevron-down'
import IconDownload from '~icons/lucide/download'
import IconPlus from '~icons/lucide/plus'
import IconTrash from '~icons/lucide/trash-2'

import { componentDefaultsOf } from '../componentTokens'
import { componentDoc } from '../docs'
import DocSection from '../parts/DocSection.vue'
import MarkdownBlock from '../parts/MarkdownBlock.vue'
import { useViewedTheme } from '../viewedTheme'
import { COMPONENT_LOADING_INDICATOR, loadingIndicators, sizes, tones, variants } from './model'

const doc = componentDoc('GrButton')
const whenToUse = doc?.sections.get('Когда брать')
const whenOther = doc?.sections.get('Когда взять другое')

const theme = useViewedTheme()

const indicator = computed(() => (componentDefaultsOf(theme.value.data, 'GrButton').loadingIndicator as GrButtonLoadingIndicator | undefined) ?? COMPONENT_LOADING_INDICATOR)
const loading = computed(() => loadingIndicators.find(item => item.id === indicator.value)!)

const busy = reactive({ saving: false, deleting: false })

function run(key: keyof typeof busy): void {
  busy[key] = true
  setTimeout(() => {
    busy[key] = false
  }, 1800)
}

interface StepMetrics {
  height: string
  font: string
  icon: string
  radius: string
}

/**
 * Ступени снимаются с настоящей кнопки, а не пишутся таблицей: кегль, угол и
 * иконка — у темы, и под «Чертежом» таблица «Сланца» врала бы.
 */
const stepButtons = new Map<GrButtonSize, HTMLElement>()
const metrics = ref<Partial<Record<GrButtonSize, StepMetrics>>>({})

function bindStep(size: GrButtonSize) {
  return (instance: Element | ComponentPublicInstance | null): void => {
    const element = instance && '$el' in instance ? instance.$el as HTMLElement : instance as HTMLElement | null
    if (element)
      stepButtons.set(size, element)
    else
      stepButtons.delete(size)
  }
}

const px = (value: number): string => `${Math.round(value * 10) / 10}px`

function measure(): void {
  const elements = [...stepButtons.values()]
  // Вкладка скрыта: снимать нечего. Наблюдатель размера снимет, когда её откроют.
  if (elements.length === 0 || elements.some(element => element.getBoundingClientRect().height === 0))
    return
  const next: Partial<Record<GrButtonSize, StepMetrics>> = {}
  for (const [size, element] of stepButtons) {
    const style = getComputedStyle(element)
    const icon = element.querySelector('svg')?.getBoundingClientRect().width
    next[size] = {
      height: px(element.getBoundingClientRect().height),
      font: style.fontSize,
      icon: icon === undefined ? '—' : px(icon),
      radius: style.borderTopLeftRadius,
    }
  }
  metrics.value = next
}

/** Лист темы уже применён, когда сменился адрес; кадр — чтобы стили легли. */
function remeasure(): void {
  void nextTick(() => requestAnimationFrame(measure))
}

/**
 * Размер меняют кегль темы и открытие вкладки — их ловит наблюдатель. Угол
 * размера не меняет, поэтому смена темы снимает значения ещё и сама.
 */
let resizes: ResizeObserver | undefined
onMounted(() => {
  resizes = new ResizeObserver(remeasure)
  for (const element of stepButtons.values())
    resizes.observe(element)
  remeasure()
})
onBeforeUnmount(() => resizes?.disconnect())
watch(() => theme.value.id, remeasure)
</script>

<template>
  <div class="flex flex-col gap-12">
    <div class="grid gap-8 xl:grid-cols-2">
      <DocSection v-if="whenToUse" title="Когда брать">
        <MarkdownBlock :source="whenToUse" />
      </DocSection>
      <DocSection v-if="whenOther" title="Когда взять другое">
        <MarkdownBlock :source="whenOther" />
      </DocSection>
    </div>

    <DocSection title="Вес и тон" lead="Вес (variant) — насколько действие главное, тон (tone) — что оно значит. Наведите и нажмите: кнопки настоящие.">
      <div class="overflow-x-auto rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)]" tabindex="0" role="region" aria-label="Веса и тоны">
        <table class="w-full min-w-[1040px] border-collapse">
          <thead>
            <tr class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
              <th scope="col" class="w-[120px] px-4 py-3 text-start font-500">
                тон \ вес
              </th>
              <th v-for="variant in variants" :key="variant.id" scope="col" class="px-3 py-3 text-start align-bottom font-500">
                <code class="block font-[var(--gr-font-mono)] text-[var(--gr-fg)]">{{ variant.id }}</code>
                {{ variant.look }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tone in tones" :key="tone.id" class="border-t border-[var(--gr-brd)]">
              <th scope="row" class="px-4 py-3 text-start font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] font-500 leading-[var(--gr-leading-xs)]">
                {{ tone.id }}
              </th>
              <td v-for="variant in variants" :key="variant.id" class="px-3 py-3">
                <GrButton :variant="variant.id" :tone="tone.id">
                  {{ tone.verb }}
                </GrButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul class="grid gap-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] md:grid-cols-2 xl:grid-cols-3">
        <li v-for="variant in variants" :key="variant.id">
          <code class="font-[var(--gr-font-mono)]">{{ variant.id }}</code> — {{ variant.when }}
        </li>
        <li><code class="font-[var(--gr-font-mono)]">danger</code> — только необратимое: красной «Отмены» не бывает</li>
      </ul>
    </DocSection>

    <DocSection title="Ступени" lead="Высоты общие со шкалой контролов: кнопка и поле одной ступени стоят вровень. Кегль, угол и иконку задаёт тема — значения сняты с кнопки на этой странице.">
      <div class="overflow-x-auto rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)]" tabindex="0" role="region" aria-label="Ступени кнопки">
        <table class="w-full min-w-[720px] border-collapse text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">
          <thead>
            <tr class="text-[var(--gr-muted-fg)]">
              <th scope="col" class="px-4 py-3 text-start font-500">
                ступень
              </th>
              <th scope="col" class="px-4 py-3 text-start font-500">
                пример
              </th>
              <th scope="col" class="px-4 py-3 text-start font-500">
                высота
              </th>
              <th scope="col" class="px-4 py-3 text-start font-500">
                кегль
              </th>
              <th scope="col" class="px-4 py-3 text-start font-500">
                иконка
              </th>
              <th scope="col" class="px-4 py-3 text-start font-500">
                угол
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="size in sizes" :key="size" class="border-t border-[var(--gr-brd)] font-[var(--gr-font-mono)] [font-variant-numeric:tabular-nums]">
              <th scope="row" class="px-4 py-3 text-start font-500">
                {{ size }}
              </th>
              <td class="px-4 py-3 font-[var(--gr-font-ui)]">
                <span class="flex items-center gap-2">
                  <GrButton :ref="bindStep(size)" :size="size">
                    <template #prefix>
                      <GrIcon><IconPlus /></GrIcon>
                    </template>
                    Добавить
                  </GrButton>
                  <GrButton :size="size" variant="secondary" tone="neutral" square aria-label="Скачать">
                    <GrIcon><IconDownload /></GrIcon>
                  </GrButton>
                </span>
              </td>
              <td class="px-4 py-3">
                {{ metrics[size]?.height ?? '—' }}
              </td>
              <td class="px-4 py-3">
                {{ metrics[size]?.font ?? '—' }}
              </td>
              <td class="px-4 py-3">
                {{ metrics[size]?.icon ?? '—' }}
              </td>
              <td class="px-4 py-3">
                {{ metrics[size]?.radius ?? '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DocSection>

    <DocSection title="Состояния" lead="Наведение, нажатие и фокус — у каждой кнопки на этой странице. Здесь — то, что задаёт потребитель.">
      <div class="grid gap-4 md:grid-cols-3">
        <div class="flex flex-col gap-3 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
          <h3 class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">
            Загрузка — {{ loading.title }}
          </h3>
          <div class="flex flex-wrap gap-2">
            <GrButton :loading="busy.saving" loading-text="Сохраняем отчёт" @click="run('saving')">
              Сохранить отчёт
            </GrButton>
            <GrButton variant="secondary" tone="danger" :loading="busy.deleting" @click="run('deleting')">
              <template #prefix>
                <GrIcon><IconTrash /></GrIcon>
              </template>
              Удалить
            </GrButton>
          </div>
          <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ loading.note }} Нажмите — загрузка на 1.8 с; фокус остаётся, курсор — progress.
          </p>
        </div>
        <div class="flex flex-col gap-3 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
          <h3 class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">
            Недоступная
          </h3>
          <div class="flex flex-wrap gap-2">
            <GrButton disabled>
              Отправить
            </GrButton>
            <GrButton variant="outline" disabled>
              Отправить
            </GrButton>
          </div>
          <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            Свои роли вместо прозрачности; штриховку или пунктир, читаемые без цвета, добавляет тема.
          </p>
        </div>
        <div class="flex flex-col gap-3 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
          <h3 class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">
            Недоступная в таб-порядке
          </h3>
          <GrTooltip text="Заполните обязательные поля" class="self-start">
            <GrButton aria-disabled="true">
              Отправить
            </GrButton>
          </GrTooltip>
          <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            aria-disabled: вид тот же, но кнопка ловит фокус — причину можно показать подсказкой.
          </p>
        </div>
      </div>
    </DocSection>

    <DocSection title="Содержимое" lead="Слоты, ссылка наружу, длинная подпись и группа — всё на настоящих компонентах.">
      <div class="grid gap-4 lg:grid-cols-2">
        <div class="flex flex-col gap-4 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
          <div class="flex flex-wrap items-center gap-2">
            <GrButton variant="secondary" tone="neutral">
              <template #prefix>
                <GrIcon><IconPlus /></GrIcon>
              </template>
              Добавить
              <template #suffix>
                <GrKbd keys="mod+N" size="xs" />
              </template>
            </GrButton>
            <GrButton variant="outline" tone="neutral" aria-haspopup="menu">
              Экспорт
              <template #suffix>
                <GrIcon><IconChevronDown /></GrIcon>
              </template>
            </GrButton>
            <GrButton href="https://granularity.tech" external variant="ghost">
              Документация
            </GrButton>
          </div>
          <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            Со стороны аддона отступ на 2px меньше. Ссылка наружу объявляет новую вкладку значком и скрытым текстом.
          </p>
        </div>
        <div class="flex flex-col gap-4 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
          <div class="flex flex-wrap items-center gap-3">
            <div class="w-[180px]">
              <GrButton block variant="secondary" tone="neutral">
                Сформировать сводный отчёт за квартал
              </GrButton>
            </div>
            <GrButtonGroup aria-label="Период" size="sm" variant="outline" tone="neutral">
              <GrButton>День</GrButton>
              <GrButton>Неделя</GrButton>
              <GrButton>Месяц</GrButton>
            </GrButtonGroup>
            <GrButtonGroup aria-label="Сохранение">
              <GrButton>Сохранить</GrButton>
              <GrButton square aria-label="Другие варианты сохранения">
                <GrIcon><IconChevronDown /></GrIcon>
              </GrButton>
            </GrButtonGroup>
          </div>
          <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            Длинная подпись режется многоточием, полный текст — в подсказке. Как склеены звенья группы — шов, рамки внахлёст или лоток, — решает тема.
          </p>
        </div>
      </div>
    </DocSection>

    <DocSection title="Так и не так">
      <div class="grid gap-4 md:grid-cols-2">
        <div class="flex flex-col gap-3 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
          <p class="text-[length:var(--gr-text-xs)] font-600 leading-[var(--gr-leading-xs)] text-[var(--gr-success-text)]">
            Так — одна primary на область
          </p>
          <div class="flex flex-wrap gap-2">
            <GrButton>Опубликовать</GrButton>
            <GrButton variant="secondary" tone="neutral">
              Предпросмотр
            </GrButton>
            <GrButton variant="ghost" tone="neutral">
              Отмена
            </GrButton>
          </div>
        </div>
        <div class="flex flex-col gap-3 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
          <p class="text-[length:var(--gr-text-xs)] font-600 leading-[var(--gr-leading-xs)] text-[var(--gr-danger-text)]">
            Не так — три главных подряд
          </p>
          <div class="flex flex-wrap gap-2">
            <GrButton>Опубликовать</GrButton>
            <GrButton>Предпросмотр</GrButton>
            <GrButton>Отмена</GrButton>
          </div>
        </div>
      </div>
      <ul class="grid gap-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-base)] md:grid-cols-2">
        <li>Так: loading на время запроса. Не так: disabled — фокус падает в тело документа.</li>
        <li>Так: переход — ссылкой (href). Не так: кнопка с router.push — ломает «открыть в новой вкладке».</li>
        <li>Так: у квадратной кнопки есть aria-label. Не так: кнопка из одной иконки без имени.</li>
        <li>Так: loadingText называет, что грузится. Не так: общее «Загрузка…», когда на экране три кнопки.</li>
      </ul>
    </DocSection>
  </div>
</template>
