<script setup lang="ts">
import { GrAffix, GrScrollSpy } from '@feugene/granularity'

const sections = [
  { id: 'spy-affix-summary', label: 'Сводка' },
  { id: 'spy-affix-parties', label: 'Стороны' },
  { id: 'spy-affix-subject', label: 'Предмет договора' },
  { id: 'spy-affix-payment', label: 'Порядок расчётов' },
  { id: 'spy-affix-liability', label: 'Ответственность' },
  { id: 'spy-affix-final', label: 'Заключительные положения' },
]
</script>

<template>
  <!--
    Пара: `GrAffix` держит и шапку, и оглавление на виду, `GrScrollSpy` показывает
    в оглавлении позицию чтения. Оба отступа заданы переменными на контейнере:
    шапка прилипает к самому краю, а линия активации проходит чуть ниже её — так
    заголовок считается прочитанным ровно тогда, когда уходит под шапку.
  -->
  <div
    class="h-[320px] w-full overflow-y-auto rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)]"
    tabindex="0"
    role="group"
    aria-label="Текст договора"
    style="--gr-affix-offset: 41px; --gr-scroll-spy-offset: 56px"
  >
    <GrAffix :offset="0">
      <div class="border-b border-[var(--gr-brd)] px-4 py-2 text-[length:var(--gr-control-text-sm)] leading-[var(--gr-leading-sm)] font-600">
        Договор поставки № 4417
      </div>
    </GrAffix>

    <div class="grid gap-4 px-4 py-3 sm:grid-cols-[170px_1fr]">
      <!--
        Обёртка нужна: `GrAffix` — фрагмент из сентинела и коробки, и в гриде они
        заняли бы две ячейки. Внутри обёртки этого не происходит, а высоту для
        поездки даёт сам грид — ячейка растягивается на высоту ряда.
      -->
      <div>
        <GrAffix>
          <GrScrollSpy :sections="sections" aria-label="Разделы договора" class="py-2" />
        </GrAffix>
      </div>

      <div>
        <section v-for="section in sections" :id="section.id" :key="section.id" class="pb-6">
          <h3 class="text-[length:var(--gr-control-text-sm)] leading-[var(--gr-leading-sm)] font-600">
            {{ section.label }}
          </h3>
          <p class="mt-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
            Пункт договора «{{ section.label }}» с текстом на несколько строк, чтобы раздел занимал заметную высоту.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
