<script setup lang="ts">
import { GrJsonViewer } from '@feugene/granularity'

/**
 * Не выдуманный крайний случай, а форма запроса к модели с картинкой: провайдер
 * кладёт изображение в base64 прямо в тело, и это **один** строковый лист на
 * сотни тысяч символов. Свёртка по узлам его не берёт — узел там один.
 */
const request = {
  model: 'gemini-3.1-pro',
  contents: [
    {
      role: 'user',
      parts: [
        { text: 'Разбери чек и верни JSON по схеме.' },
        { inline_data: { mime_type: 'image/jpeg', data: `data:image/jpeg;base64,${'R0lGODlhAQABAIAAAAUEBA'.repeat(2000)}` } },
      ],
    },
  ],
  // Массив на пять тысяч — вторая крайность: узлов много, каждый крошечный.
  candidates: Array.from({ length: 5000 }, (_, index) => ({ index, logprob: -0.0001 * index })),
}
</script>

<template>
  <div class="grid gap-3">
    <GrJsonViewer
      :value="request"
      :max-string-length="80"
      :max-array-items="50"
      virtual
      max-height="20rem"
      aria-label="Запрос к модели"
    />

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Строка с картинкой обрезана до 80 символов, массив — до 50 элементов с заглушкой «ещё».
      Копирование любого узла всё равно отдаёт значение целиком: обрезка принадлежит показу.
    </p>
  </div>
</template>
