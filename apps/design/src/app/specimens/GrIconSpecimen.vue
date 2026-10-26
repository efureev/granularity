<script setup lang="ts">
import IconCircleAlert from '~icons/lucide/circle-alert'
import IconCircleCheck from '~icons/lucide/circle-check'
import IconDownload from '~icons/lucide/download'
import IconInbox from '~icons/lucide/inbox'
import IconInfo from '~icons/lucide/info'
import IconLoaderCircle from '~icons/lucide/loader-circle'
import IconSparkles from '~icons/lucide/sparkles'
import IconTriangleAlert from '~icons/lucide/triangle-alert'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const iconTones = [
  { tone: 'primary', icon: IconSparkles },
  { tone: 'success', icon: IconCircleCheck },
  { tone: 'warning', icon: IconTriangleAlert },
  { tone: 'danger', icon: IconCircleAlert },
  { tone: 'info', icon: IconInfo },
  { tone: 'neutral', icon: IconInbox },
] as const
const iconSteps = ['xs', 'sm', 'md', 'lg'] as const
const buttonSteps = ['xs', 'sm', 'md', 'lg'] as const
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <div class="flex flex-wrap items-center gap-4">
      <GrIcon v-for="item in iconTones" :key="item.tone" :tone="item.tone" size="lg">
        <component :is="item.icon" />
      </GrIcon>
    </div>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Тоны палитры" note="цвет — из роли текста тона: насыщенный на светлой подложке не держит контраст">
      <div class="flex flex-wrap gap-5">
        <div v-for="item in iconTones" :key="item.tone" class="flex flex-col items-center gap-1.5">
          <GrIcon :tone="item.tone" size="lg">
            <component :is="item.icon" />
          </GrIcon>
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)] text-[var(--gr-muted-fg)]">
            {{ item.tone }}
          </span>
        </div>
      </div>
    </Specimen>

    <Specimen title="Ступени и пиксели" note="xs · sm · md · lg — токены темы; число — размер мимо шкалы">
      <div class="flex flex-wrap items-end gap-4">
        <GrIcon v-for="step in iconSteps" :key="step" :size="step">
          <IconSparkles />
        </GrIcon>
        <GrIcon :size="32">
          <IconSparkles />
        </GrIcon>
      </div>
    </Specimen>

    <Specimen title="Значимая и вращение" note="без имени иконка скрыта от диктора; с именем — картинка со смыслом">
      <div class="flex flex-wrap items-center gap-5">
        <span class="flex items-center gap-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
          <GrIcon tone="success"><IconCircleCheck /></GrIcon>
          Сохранено
        </span>
        <GrIcon tone="success" label="Оплачено">
          <IconCircleCheck />
        </GrIcon>
        <GrIcon tone="primary" spin label="Загрузка">
          <IconLoaderCircle />
        </GrIcon>
      </div>
    </Specimen>

    <Specimen title="Внутри кнопки" note="ступень подсказывает кнопка: свой размер иконке задавать не нужно">
      <div class="flex flex-wrap items-center gap-3">
        <GrButton v-for="step in buttonSteps" :key="step" :size="step" variant="secondary" tone="neutral">
          <GrIcon><IconDownload /></GrIcon>
          Скачать
        </GrButton>
      </div>
    </Specimen>
  </div>
</template>
