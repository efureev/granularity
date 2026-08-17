<script setup lang="ts">
import { GrFilePreview } from '@feugene/granularity'

// Лента вложений к заявке: одна ссылка на файл, ничего больше. Картинки лежат
// на внешнем хосте и приезжают вразнобой — ровно так, как в бою.
const attachments = Array.from({ length: 12 }, (_, index) => {
  const id = 1060 + index

  return {
    name: `scan-${String(index + 1).padStart(2, '0')}.jpg`,
    mime: 'image/jpeg',
    src: `https://picsum.photos/id/${id}/160/160`,
  }
})
</script>

<template>
  <!--
    Пока картинка не доехала, плитка показывает скелет, а не пустой фон:
    «ещё грузится» и «у файла нет превью» — разные сообщения, и на дюжине
    плиток сразу видно, какое из них правда.
  -->
  <div class="flex flex-wrap gap-2">
    <GrFilePreview
      v-for="file in attachments"
      :key="file.name"
      :src="file.src"
      :mime="file.mime"
      :name="file.name"
      tile-size="xs"
      ratio="1:1"
    />
  </div>
</template>
