<script setup lang="ts">
import { onBeforeUnmount, ref, useTemplateRef, watch } from 'vue'

/**
 * Обложка карточки товара. Фото приходит позже страницы: продавец выбирает
 * файл, когда рамка уже стоит на месте. Пустая рамка держит соотношение
 * карточки, поэтому пришедшая картинка ничего под собой не сдвигает.
 */
interface Cover {
  url: string
  width: number
  height: number
  weight: number
}

const photo = ref<File | null>(null)
const cover = ref<Cover | null>(null)
const cropper = useTemplateRef('cropper')

function dropCover() {
  if (cover.value)
    URL.revokeObjectURL(cover.value.url)

  cover.value = null
}

watch(photo, dropCover)
onBeforeUnmount(dropCover)

async function saveCover() {
  const blob = await cropper.value?.crop()
  if (!blob)
    return

  // Размер читается из самого файла: видно то, что уедет на сервер, а не то, что заказано.
  const bitmap = await createImageBitmap(blob)
  dropCover()
  cover.value = { url: URL.createObjectURL(blob), width: bitmap.width, height: bitmap.height, weight: blob.size }
  bitmap.close()
}
</script>

<template>
  <div data-demo="image-crop-cover" class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)]">
    <div class="grid content-start gap-3">
      <GrFormField label="Фото товара" for-id="showcase-image-crop-cover-photo">
        <GrFormFile
          v-model="photo"
          accept="image/*"
          placeholder="Фото не выбрано"
          upload-text="Выбрать фото"
          change-text="Другое фото"
          remove-text="Убрать фото"
        />
      </GrFormField>

      <GrImageCrop
        ref="cropper"
        :src="photo"
        :aspect-ratio="4 / 3"
        :output="{ width: 1200, type: 'image/jpeg', quality: 0.85 }"
        aria-label="Обложка товара"
      >
        <template #empty>
          <span class="showcase-demo-text grid justify-items-center gap-1 p-4 text-center text-sm">
            <strong>Обложка 4 : 3</strong>
            Выберите фото — оно встанет в эту рамку
          </span>
        </template>
      </GrImageCrop>

      <GrButton size="sm" :disabled="!photo" @click="saveCover">
        Сохранить обложку
      </GrButton>
    </div>

    <div class="showcase-demo-panel grid content-start gap-3 rounded-[var(--gr-radius-lg)] border p-4">
      <img
        v-if="cover"
        :src="cover.url"
        alt="Обложка товара"
        class="aspect-[4/3] w-full rounded-[var(--gr-radius-md)] object-cover"
      >
      <div v-else class="aspect-[4/3] w-full rounded-[var(--gr-radius-md)] bg-[var(--gr-muted)]" />

      <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] font-600">
        Диван «Осло», серый велюр
      </p>
      <p v-if="cover" class="showcase-demo-text text-sm">
        Файл обложки: <span data-demo-cover-size>{{ cover.width }} × {{ cover.height }}</span> px,
        {{ (cover.weight / 1024).toFixed(0) }} КБ
      </p>
      <p v-else class="showcase-demo-text text-sm">
        Сохранённая обложка появится в карточке.
      </p>
    </div>
  </div>
</template>
