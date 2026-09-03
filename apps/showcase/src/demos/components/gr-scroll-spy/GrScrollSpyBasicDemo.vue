<script setup lang="ts">
import { GrScrollSpy } from '@feugene/granularity'

const sections = [
  { id: 'spy-basic-purpose', label: 'Назначение' },
  { id: 'spy-basic-scope', label: 'Область действия' },
  { id: 'spy-basic-order', label: 'Порядок согласования' },
  { id: 'spy-basic-terms', label: 'Сроки' },
  { id: 'spy-basic-exceptions', label: 'Исключения' },
]

const body = [
  'Регламент описывает порядок согласования закупок на сумму свыше пятисот тысяч рублей и действует до конца календарного года.',
  'Под действие регламента попадают все подразделения, включая проектные команды на внешнем финансировании.',
  'Инициатор готовит заявку, юрист проверяет контрагента, финансовая служба сверяет сумму с лимитом статьи бюджета.',
  'Срок исполнения считается с момента согласования последним участником цепочки, а не с момента подачи заявки.',
  'Закупки до пятисот тысяч согласовывает руководитель направления единолично; спорные случаи выносятся на комиссию.',
]
</script>

<template>
  <!--
    Оглавление стоит рядом с прокручиваемой областью, а не внутри неё: иначе оно
    уехало бы вместе с текстом. Скроллпорт компонент находит сам — от первого
    раздела вверх по предкам.
  -->
  <div class="grid w-full gap-4 sm:grid-cols-[180px_1fr]">
    <GrScrollSpy :sections="sections" aria-label="Разделы регламента" />

    <div
      class="h-[280px] overflow-y-auto rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)]"
      tabindex="0"
      role="group"
      aria-label="Текст регламента"
    >
      <section v-for="(section, index) in sections" :id="section.id" :key="section.id" class="px-4 py-3">
        <h3 class="text-[length:var(--gr-control-text-sm)] leading-[var(--gr-leading-sm)] font-600">
          {{ section.label }}
        </h3>
        <p class="mt-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
          {{ body[index] }}
        </p>
      </section>
    </div>
  </div>
</template>
