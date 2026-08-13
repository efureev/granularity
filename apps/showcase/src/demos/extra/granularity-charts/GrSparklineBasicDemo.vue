<script setup lang="ts">
// `GrSparkline` подставляется авто-импортом (`unplugin-vue-components`).

/**
 * Спарклайн отвечает на один вопрос: **куда оно движется**.
 *
 * Точные значения даёт число рядом, а форму ряда — линия: осей и подписей у неё
 * нет намеренно, иначе она перестанет читаться боковым зрением за долю секунды,
 * ради которой её и ставят. Читается слева направо: левый край — начало
 * периода, правый — «сейчас». Маркера там нет и не нужно: линия и так упирается
 * в правый край, а концы периода подписывает карточка.
 */
const signups = [980, 1010, 995, 1042, 1078, 1065, 1120, 1156, 1190, 1215, 1246, 1284]
const churn = [34, 33, 30, 31, 27, 24, 22, 23, 18, 15, 13, 11]
const latency = [128, 132, 126, 141, 138, 152, 147, 139, 144, 136]

/** Число на карточке — последнее значение ряда, а не отдельная константа: разойтись им нельзя. */
function current(row: number[]): string {
  return row.at(-1)!.toLocaleString('ru-RU')
}

function delta(row: number[]): number {
  const first = row[0]!
  const last = row.at(-1)!

  return Math.round(((last - first) / first) * 100)
}
</script>

<template>
  <div class="grid gap-6">
    <div class="grid gap-4 sm:grid-cols-2">
      <!--
        Карточка показателя — основной сценарий. Число отвечает «сколько»,
        спарклайн — «как менялось», бейдж — «на сколько за период».
      -->
      <div class="rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
        <div class="flex items-start justify-between gap-3">
          <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">Регистрации</span>
          <GrBadge tone="success" size="sm">+{{ delta(signups) }}%</GrBadge>
        </div>

        <strong class="mt-1 block text-2xl [font-variant-numeric:tabular-nums]">{{ current(signups) }}</strong>

        <div class="mt-3">
          <GrSparkline :data="signups" />
        </div>

        <!-- Подписи концов: без них непонятно, где начало ряда, а где «сейчас». -->
        <div class="mt-1 flex justify-between text-[length:var(--gr-control-text-2xs)] text-[var(--gr-muted-fg)]">
          <span>12 недель назад</span>
          <span>сейчас</span>
        </div>
      </div>

      <div class="rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
        <div class="flex items-start justify-between gap-3">
          <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">Отток</span>
          <GrBadge tone="success" size="sm">{{ delta(churn) }}%</GrBadge>
        </div>

        <strong class="mt-1 block text-2xl [font-variant-numeric:tabular-nums]">{{ current(churn) }}</strong>

        <div class="mt-3">
          <!-- `area` уместна там, где важен объём под кривой, а не только её форма. -->
          <GrSparkline :data="churn" variant="area" color="var(--gr-chart-2)" />
        </div>

        <div class="mt-1 flex justify-between text-[length:var(--gr-control-text-2xs)] text-[var(--gr-muted-fg)]">
          <span>12 недель назад</span>
          <span>сейчас</span>
        </div>
      </div>
    </div>

    <!--
      Второй сценарий: спарклайн внутри строки текста. Ему не нужен ни контейнер,
      ни замер — высоту задаёт токен, ширину контейнер.
    -->
    <p class="flex flex-wrap items-center gap-2 text-[length:var(--gr-control-text-sm)]">
      <span class="text-[var(--gr-muted-fg)]">Отклик API</span>
      <strong class="[font-variant-numeric:tabular-nums]">{{ current(latency) }} мс</strong>
      <span
        class="inline-block w-24"
        style="--gr-sparkline-height: 1.25rem"
      >
        <GrSparkline :data="latency" />
      </span>
      <span class="text-[var(--gr-muted-fg)]">за последний час</span>
    </p>

    <p class="showcase-demo-text text-sm text-[var(--gr-muted-fg)]">
      Осей и сетки у спарклайна нет намеренно: он про <strong>форму</strong>, а не про значения — точные числа стоят
      рядом. Для скринридера форма превращается в текст: имя картинки собирается само, и у карточки «Отток» звучит как
      «падение, от 34 до 11, минимум 11, максимум 34».
    </p>
  </div>
</template>
