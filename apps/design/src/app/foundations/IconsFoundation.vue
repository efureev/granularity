<script setup lang="ts">
import IconArrowRight from '~icons/lucide/arrow-right'
import IconCopy from '~icons/lucide/copy'
import IconDownload from '~icons/lucide/download'
import IconPlus from '~icons/lucide/plus'
import IconSave from '~icons/lucide/save'
import IconSearch from '~icons/lucide/search'
import IconSend from '~icons/lucide/send'
import IconTrash from '~icons/lucide/trash-2'

import DocSection from '../parts/DocSection.vue'
import { foundationSection } from '../tokens'

const sizes = foundationSection('Iconography: icon sizes').map(token => ({
  ...token,
  step: token.name.replace('--gr-icon-size-', '') as 'xs' | 'sm' | 'md' | 'lg',
}))
const sample = [IconPlus, IconSearch, IconSave, IconDownload, IconCopy, IconSend, IconTrash, IconArrowRight]

const buttonSteps = [
  { size: 'xs', icon: '14px' },
  { size: 'sm', icon: '16px' },
  { size: 'md', icon: '16px' },
  { size: 'lg', icon: '20px' },
] as const
</script>

<template>
  <div class="flex flex-col gap-14">
    <DocSection title="Набор и ступени" lead="Lucide — линейные иконки со штрихом 2px, подключаются как компоненты, оборачиваются в GrIcon. Ступень задаёт размер, а не пиксели.">
      <div class="overflow-x-auto rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)]" tabindex="0" role="region" aria-label="Ступени иконок">
        <table class="w-full min-w-[560px] border-collapse">
          <tbody>
            <tr v-for="token in sizes" :key="token.name" class="border-b border-[var(--gr-brd)] last:border-b-0">
              <th scope="row" class="w-[220px] px-5 py-3 text-start align-middle font-400">
                <code class="block font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">{{ token.step }}</code>
                <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)] text-[var(--gr-muted-fg)]">{{ token.value }}</span>
              </th>
              <td class="px-5 py-3">
                <span class="flex flex-wrap items-center gap-4">
                  <GrIcon v-for="(icon, index) in sample" :key="index" :size="token.step">
                    <component :is="icon" />
                  </GrIcon>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DocSection>

    <DocSection title="Внутри кнопки ступень подсказывает кнопка" lead="Иконка в слоте не задаёт размер: она берёт ступень от кнопки. Явный size у иконки сильнее подсказки.">
      <div class="flex flex-wrap items-end gap-6 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-6">
        <div v-for="step in buttonSteps" :key="step.size" class="flex flex-col items-start gap-2">
          <GrButton :size="step.size" variant="secondary" tone="neutral">
            <template #prefix>
              <GrIcon><IconPlus /></GrIcon>
            </template>
            Добавить
          </GrButton>
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)] text-[var(--gr-muted-fg)]">{{ step.size }} → {{ step.icon }}</code>
        </div>
      </div>
    </DocSection>

    <DocSection title="Значимая или декоративная" lead="По умолчанию иконка декоративна и скрыта от скринридера. Значимой её делает label — тогда у неё есть имя.">
      <div class="grid gap-4 md:grid-cols-2">
        <div class="flex flex-col gap-3 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
          <span class="flex items-center gap-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
            <GrIcon><IconSave /></GrIcon> Сохранено
          </span>
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)] text-[var(--gr-muted-fg)]">рядом есть слово — иконка декоративна</code>
        </div>
        <div class="flex flex-col gap-3 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
          <span class="flex items-center gap-2">
            <GrButton square variant="ghost" tone="neutral" aria-label="Скопировать ссылку">
              <GrIcon><IconCopy /></GrIcon>
            </GrButton>
          </span>
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)] text-[var(--gr-muted-fg)]">слова нет — имя даёт aria-label кнопки</code>
        </div>
      </div>
      <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-base)] text-[var(--gr-muted-fg)]">
        Эмодзи вместо иконок не используются: их вид зависит от платформы, а цвет не управляется темой.
      </p>
    </DocSection>
  </div>
</template>
