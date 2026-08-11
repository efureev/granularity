<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrTextarea } from '@feugene/granularity'

const changelog = ref('fix: чипы автокомплита видно на светлой теме\nfeat: счётчик строк\n')
const script = ref('INT. OFFICE — DAY\n\nОна открывает ноутбук.\n')
</script>

<template>
  <div class="grid gap-4">
    <GrFormField label="Запись в CHANGELOG" hint="Счётчик строк слева, символов — справа">
      <GrTextarea
        v-model="changelog"
        show-line-count
        show-count
        :maxlength="240"
        :rows="4"
      />
    </GrFormField>

    <GrFormField label="Сцена" hint="maxLines задаёт ориентир и не режет набранное">
      <GrTextarea
        v-model="script"
        show-line-count
        :max-lines="8"
        autosize
        :rows="3"
      />
    </GrFormField>
  </div>
</template>
