<script setup lang="ts">
import { computed, reactive } from 'vue'

import { grComponentTokens } from '@feugene/granularity/tokens'
import IconChevronDown from '~icons/lucide/chevron-down'
import IconDownload from '~icons/lucide/download'
import IconPlus from '~icons/lucide/plus'
import IconTrash from '~icons/lucide/trash-2'

import { componentDoc } from '../docs'
import DocSection from '../parts/DocSection.vue'
import MarkdownBlock from '../parts/MarkdownBlock.vue'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'ghost-border'
type Tone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'slate' | 'azure'
type Size = 'xs' | 'sm' | 'md' | 'lg'

const doc = componentDoc('button')
const whenToUse = doc?.sections.get('Когда брать')
const whenOther = doc?.sections.get('Когда взять другое')

const variants: { id: Variant, look: string, when: string }[] = [
  { id: 'primary', look: 'заливка тона, блик и тень', when: 'главное действие области — одно' },
  { id: 'secondary', look: 'подложка тона, рамка 38 % тона', when: 'сопутствующее; с neutral — обычная кнопка формы' },
  { id: 'outline', look: 'рамка 70 % тона', when: 'равноправные альтернативы' },
  { id: 'ghost', look: 'только подпись, прозрачная рамка', when: 'строки таблиц, плотные панели' },
  { id: 'ghost-border', look: 'рамка проявляется под указателем', when: 'тулбары' },
]

const tones: { id: Tone, verb: string }[] = [
  { id: 'primary', verb: 'Сохранить' },
  { id: 'neutral', verb: 'Продолжить' },
  { id: 'success', verb: 'Принять' },
  { id: 'warning', verb: 'Продолжить' },
  { id: 'danger', verb: 'Удалить' },
  { id: 'info', verb: 'Подробнее' },
  { id: 'slate', verb: 'В архив' },
  { id: 'azure', verb: 'Открыть' },
]

const steps: { size: Size, height: string, font: string, icon: string, gap: string }[] = [
  { size: 'xs', height: '28px', font: '12px', icon: '14px', gap: '4px' },
  { size: 'sm', height: '32px', font: '14px', icon: '16px', gap: '6px' },
  { size: 'md', height: '40px', font: '14px', icon: '16px', gap: '8px' },
  { size: 'lg', height: '44px', font: '16px', icon: '20px', gap: '8px' },
]

const busy = reactive({ saving: false, deleting: false })

function run(key: keyof typeof busy): void {
  busy[key] = true
  setTimeout(() => {
    busy[key] = false
  }, 1800)
}

const buttonTokens = grComponentTokens.filter(token => token.owner === 'GrButton')
const hooks = buttonTokens.filter(token => token.kind === 'hook')

const TONE_NAMES = /\b(primary|success|warning|danger|info|slate|azure)\b/g

function toTone(text: string): string {
  return text.replace(TONE_NAMES, '{tone}')
}

/** Токены темы сворачиваются по тону: восемь одинаковых строк читать незачем. */
const themePatterns = computed(() => {
  const patterns = new Map<string, { pattern: string, default: string, description: string, count: number }>()
  for (const token of buttonTokens.filter(item => item.kind !== 'hook')) {
    const pattern = token.name.replace(/--gr-button-(primary|success|warning|danger|info|slate|azure)-/, '--gr-button-{tone}-')
    const entry = patterns.get(pattern)
    if (entry)
      entry.count += 1
    else
      patterns.set(pattern, { pattern, default: toTone(token.default), description: toTone(token.description), count: 1 })
  }
  return [...patterns.values()]
})
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

    <DocSection title="Ступени" lead="Высоты общие со шкалой контролов: кнопка и поле одной ступени стоят вровень. На тач-экране кнопка ниже 44px добирает зону касания невидимо.">
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
                зазор
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="step in steps" :key="step.size" class="border-t border-[var(--gr-brd)] font-[var(--gr-font-mono)] [font-variant-numeric:tabular-nums]">
              <th scope="row" class="px-4 py-3 text-start font-500">
                {{ step.size }}
              </th>
              <td class="px-4 py-3 font-[var(--gr-font-ui)]">
                <span class="flex items-center gap-2">
                  <GrButton :size="step.size">
                    <template #prefix>
                      <GrIcon><IconPlus /></GrIcon>
                    </template>
                    Добавить
                  </GrButton>
                  <GrButton :size="step.size" variant="secondary" tone="neutral" square aria-label="Скачать">
                    <GrIcon><IconDownload /></GrIcon>
                  </GrButton>
                </span>
              </td>
              <td class="px-4 py-3">
                {{ step.height }}
              </td>
              <td class="px-4 py-3">
                {{ step.font }}
              </td>
              <td class="px-4 py-3">
                {{ step.icon }}
              </td>
              <td class="px-4 py-3">
                {{ step.gap }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DocSection>

    <DocSection title="Состояния" lead="Наведение, нажатие и фокус — у каждой кнопки на этой странице. Здесь — то, что задаёт потребитель.">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div class="flex flex-col gap-3 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
          <h3 class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">
            Загрузка без префикса
          </h3>
          <GrButton class="self-start" :loading="busy.saving" loading-text="Сохраняем отчёт" @click="run('saving')">
            Сохранить отчёт
          </GrButton>
          <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            Спиннер ложится поверх подписи — ширина та же, соседи не едут. Фокус остаётся, курсор — progress.
          </p>
        </div>
        <div class="flex flex-col gap-3 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
          <h3 class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">
            Загрузка с префиксом
          </h3>
          <GrButton class="self-start" variant="secondary" tone="danger" :loading="busy.deleting" @click="run('deleting')">
            <template #prefix>
              <GrIcon><IconTrash /></GrIcon>
            </template>
            Удалить
          </GrButton>
          <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            Спиннер встаёт на место иконки: две иконки рядом читались бы ошибкой вёрстки.
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
            Свои роли вместо прозрачности; объём уходит вместе с вариантом.
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
            Длинная подпись режется многоточием, полный текст — в подсказке. Между звеньями с заливкой — светлый шов.
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

    <DocSection title="Токены кнопки" lead="Хуки не присвоены нигде и работают дефолтом — их задают в своём CSS. Токены темы объявлены по тону; ниже они свёрнуты по шаблону.">
      <div class="grid gap-4 xl:grid-cols-2">
        <div class="overflow-x-auto rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)]" tabindex="0" role="region" aria-label="Хуки кнопки">
          <table class="w-full border-collapse text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">
            <caption class="px-4 pt-3 text-start text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">
              Хуки · {{ hooks.length }}
            </caption>
            <tbody>
              <tr v-for="token in hooks" :key="token.name" class="border-b border-[var(--gr-brd)] last:border-b-0">
                <th scope="row" class="px-4 py-2.5 text-start align-top font-400">
                  <code class="block font-[var(--gr-font-mono)]">{{ token.name }}</code>
                  <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)] text-[var(--gr-muted-fg)]">{{ token.default }}</code>
                </th>
                <td class="px-4 py-2.5 align-top text-[var(--gr-muted-fg)]">
                  {{ token.description }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="overflow-x-auto rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)]" tabindex="0" role="region" aria-label="Токены темы кнопки">
          <table class="w-full border-collapse text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">
            <caption class="px-4 pt-3 text-start text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">
              Тема · {{ buttonTokens.length - hooks.length }}
            </caption>
            <tbody>
              <tr v-for="entry in themePatterns" :key="entry.pattern" class="border-b border-[var(--gr-brd)] last:border-b-0">
                <th scope="row" class="px-4 py-2.5 text-start align-top font-400">
                  <code class="block font-[var(--gr-font-mono)]">{{ entry.pattern }}</code>
                  <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)] text-[var(--gr-muted-fg)]">{{ entry.default }}</code>
                </th>
                <td class="px-4 py-2.5 align-top text-[var(--gr-muted-fg)]">
                  {{ entry.description }}
                  <span v-if="entry.count > 1" class="whitespace-nowrap"> · ×{{ entry.count }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DocSection>
  </div>
</template>
