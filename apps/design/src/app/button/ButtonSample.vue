<script setup lang="ts">
import IconDownload from '~icons/lucide/download'
import IconPlus from '~icons/lucide/plus'

import type { ButtonSampleId } from './samples'

defineProps<{ sample: ButtonSampleId }>()
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <template v-if="sample === 'main'">
      <GrButton>Сохранить</GrButton>
      <GrButton variant="secondary" tone="neutral">
        Отмена
      </GrButton>
    </template>

    <template v-else-if="sample === 'weights'">
      <GrButton variant="secondary">
        Копия
      </GrButton>
      <GrButton variant="outline">
        Сравнить
      </GrButton>
      <GrButton variant="ghost">
        Ещё
      </GrButton>
    </template>

    <template v-else-if="sample === 'icon'">
      <GrButton>
        <template #prefix>
          <GrIcon><IconPlus /></GrIcon>
        </template>
        Создать
      </GrButton>
      <GrButton variant="secondary" tone="neutral" square aria-label="Скачать">
        <GrIcon><IconDownload /></GrIcon>
      </GrButton>
    </template>

    <template v-else-if="sample === 'loading'">
      <GrButton loading>
        Сохранить
      </GrButton>
      <GrButton variant="secondary" tone="neutral" loading>
        <template #prefix>
          <GrIcon><IconDownload /></GrIcon>
        </template>
        Файл
      </GrButton>
    </template>

    <template v-else-if="sample === 'disabled'">
      <GrButton disabled>
        Отправить
      </GrButton>
      <GrButton variant="outline" disabled>
        Отправить
      </GrButton>
    </template>

    <GrButtonGroup v-else aria-label="Период" variant="outline" tone="neutral">
      <GrButton>День</GrButton>
      <GrButton>Неделя</GrButton>
      <GrButton>Месяц</GrButton>
    </GrButtonGroup>
  </div>
</template>
