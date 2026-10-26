<script setup lang="ts">
import type { GrFormFileError } from '@feugene/granularity'
import { maxFileSize } from '@feugene/granularity/fileValidation'
import { reactive, ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const SIZES = ['xs', 'sm', 'md', 'lg'] as const

function pdf(name: string, kb: number): File {
  return new File([new Uint8Array(kb * 1024)], name, { type: 'application/pdf' })
}

/* Снимки галереи — SVG прямо в файле: цвета здесь пиксели картинки, а не оформление. */
function photo(name: string, sky: string, hill: string): File {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80">'
    + `<rect width="120" height="80" fill="${sky}"/>`
    + `<path d="M0 56 Q40 36 80 52 T120 48 V80 H0Z" fill="${hill}"/>`
    + '</svg>'
  return new File([svg], name, { type: 'image/svg+xml' })
}

const previewContract = ref<File | null>(pdf('Договор.pdf', 184))

const contract = ref<File | null>(pdf('Договор.pdf', 184))
const scans = ref<File[]>([])
const scanValidators = [maxFileSize({ mb: 10 })]

const gallery = ref<File[]>([
  photo('Фасад.svg', 'hsl(204, 64%, 80%)', 'hsl(150, 30%, 40%)'),
  photo('Двор.svg', 'hsl(32, 86%, 80%)', 'hsl(18, 34%, 50%)'),
  photo('Мастерская.svg', 'hsl(260, 40%, 82%)', 'hsl(230, 26%, 42%)'),
])

const states = reactive({
  invalid: [pdf('Скан паспорта.pdf', 96)] as File[],
  disabled: pdf('Акт.pdf', 64) as File | null,
  readonly: [pdf('Устав.pdf', 412), pdf('Выписка ЕГРЮЛ.pdf', 230)] as File[],
})
const serverErrors = ref<GrFormFileError[]>([
  { code: 'server', fileName: 'Скан паспорта.pdf', message: 'не читается номер — пересканируйте разворот целиком' },
])

const stepFile = ref<File | null>(null)
</script>

<template>
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrFormField label="Договор">
      <GrFormFile v-model="previewContract" accept=".pdf,application/pdf" />
    </GrFormField>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Один файл" note="Файл — значение поля: уходит вместе с формой; кнопка меняет его или убирает.">
      <GrFormField label="Договор" hint="PDF до 10 МБ">
        <GrFormFile
          v-model="contract"
          accept=".pdf,application/pdf"
          upload-text="Выбрать файл"
          change-text="Заменить"
          remove-text="Убрать"
          placeholder="Файл не выбран"
        />
      </GrFormField>
    </Specimen>

    <Specimen title="Несколько файлов" note="Новый выбор дописывается к набору; лишний или тяжёлый файл отбивается ошибкой, а не обрезается молча.">
      <GrFormField label="Сканы паспорта" hint="До трёх файлов, JPG или PDF, до 10 МБ каждый">
        <GrFormFile
          v-model="scans"
          multiple
          :limit="3"
          :validators="scanValidators"
          accept="image/jpeg,.pdf"
          upload-text="Выбрать файлы"
          add-text="Добавить ещё"
          remove-text="Убрать"
          clear-all-text="Убрать все"
          placeholder="Файлы не выбраны"
        />
      </GrFormField>
    </Specimen>

    <Specimen title="Превью и порядок" note="У картинок — миниатюры; ручка слева меняет порядок мышью или клавишами: Space берёт строку, стрелки двигают.">
      <GrFormField label="Фото объекта" hint="Первое фото станет обложкой">
        <GrFormFile v-model="gallery" multiple preview reorderable accept="image/*" />
      </GrFormField>
    </Specimen>

    <Specimen title="Состояния" note="Ошибку сервера кладут в v-model:errors; только чтение показывает набор, но не даёт его менять.">
      <GrFormField label="Скан паспорта">
        <GrFormFile v-model="states.invalid" v-model:errors="serverErrors" multiple accept="image/jpeg,.pdf" />
      </GrFormField>
      <GrFormField label="Акт выполненных работ" hint="Подписан — заменить нельзя" disabled>
        <GrFormFile v-model="states.disabled" />
      </GrFormField>
      <GrFormField label="Учредительные документы" readonly>
        <GrFormFile v-model="states.readonly" multiple />
      </GrFormField>
    </Specimen>

    <Specimen title="Ступени" note="Кнопка выбора и подпись идут за ступенью поля.">
      <div v-for="size in SIZES" :key="size" class="flex items-center gap-3">
        <span class="w-6 shrink-0 font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ size }}</span>
        <div class="min-w-0 flex-1">
          <GrFormFile v-model="stepFile" :size="size" :aria-label="`Вложение, ступень ${size}`" />
        </div>
      </div>
    </Specimen>
  </div>
</template>
