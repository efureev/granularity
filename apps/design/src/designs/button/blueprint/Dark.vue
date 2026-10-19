<script setup>
import { computed } from 'vue'

const vals = computed(() => {
  const tones = [
    { key: 'primary', verb: 'Сохранить' },
    { key: 'neutral', verb: 'Продолжить' },
    { key: 'success', verb: 'Принять' },
    { key: 'warning', verb: 'Продолжить' },
    { key: 'danger', verb: 'Удалить' },
    { key: 'info', verb: 'Подробнее' },
    { key: 'slate', verb: 'В архив' },
    { key: 'azure', verb: 'Открыть' },
  ]
  const variants = ['primary', 'secondary', 'outline', 'ghost', 'ghost-border']
  const configs = [
    { v: 'primary', t: 'primary', verb: 'Сохранить' },
    { v: 'primary', t: 'neutral', verb: 'Продолжить' },
    { v: 'secondary', t: 'neutral', verb: 'Отмена' },
    { v: 'outline', t: 'primary', verb: 'Экспорт' },
  ]
  const states = [
    { extra: '' },
    { extra: ' is-hover' },
    { extra: ' is-active' },
    { extra: ' is-focus' },
    { extra: ' is-loading', busy: 'true' },
    { extra: ' is-disabled', ariaDisabled: 'true' },
  ]
  return {
    rows: tones.map(t => ({
      key: t.key,
      cells: variants.map(v => ({ cls: `gb s-md v-${v} t-${t.key}`, verb: t.verb })),
    })),
    stateRows: configs.map(c => ({
      label: `${c.v} · ${c.t}`,
      cells: states.map(st => ({
        cls: `gb s-md v-${c.v} t-${c.t}${st.extra}`,
        verb: c.verb,
        busy: st.busy,
        ariaDisabled: st.busy || st.ariaDisabled,
      })),
    })),
  }
})
</script>

<template>
<div class="gr-dark doc" style="width: 1280px; min-height: 1400px; padding: 56px 64px; display: flex; flex-direction: column; gap: 28px">

<header style="display: flex; flex-direction: column; gap: 12px">
<span class="eyebrow">05 · Тёмная тема</span>
<h2 class="h1" style="font-size: 32px; line-height: 40px">Синька: светлые линии на тёмном листе</h2>
<p class="lead">Без теней тёмной теме нечем отделять кнопку, кроме краски и линий, — поэтому рамки и линия хода здесь светлее, а заливки остаются насыщенными со светлой подписью.</p>
</header>

<div class="sheet" style="overflow: hidden">
<div style="display: grid; grid-template-columns: 160px repeat(5, minmax(0, 1fr)); align-items: end; padding: 12px 24px; background: var(--muted)">
<span class="colh">тон \ вес</span>
<span class="colh" style="color: var(--fg)">primary</span>
<span class="colh" style="color: var(--fg)">secondary</span>
<span class="colh" style="color: var(--fg)">outline</span>
<span class="colh" style="color: var(--fg)">ghost</span>
<span class="colh" style="color: var(--fg)">ghost-border</span>
</div>
<template v-for="(row, rowIndex) in vals.rows" :key="rowIndex">
<div class="ruled" style="display: grid; grid-template-columns: 160px repeat(5, minmax(0, 1fr)); align-items: center; min-height: 58px; padding: 0 24px">
<span class="mono" style="font-weight: 600; color: var(--fg)">{{ row.key }}</span>
<template v-for="(c, cIndex) in row.cells" :key="cIndex">
<div><button :class="c.cls" type="button">{{ c.verb }}</button></div>
</template>
</div>
</template>
</div>

<div class="sheet" style="overflow: hidden">
<div style="display: grid; grid-template-columns: 160px repeat(6, minmax(0, 1fr)); align-items: end; padding: 12px 24px; background: var(--muted)">
<span class="colh">вес · тон</span>
<span class="colh" style="color: var(--fg)">покой</span>
<span class="colh" style="color: var(--fg)">наведение</span>
<span class="colh" style="color: var(--fg)">нажатие</span>
<span class="colh" style="color: var(--fg)">фокус</span>
<span class="colh" style="color: var(--fg)">загрузка</span>
<span class="colh" style="color: var(--fg)">disabled</span>
</div>
<template v-for="(row, rowIndex) in vals.stateRows" :key="rowIndex">
<div class="ruled" style="display: grid; grid-template-columns: 160px repeat(6, minmax(0, 1fr)); align-items: center; min-height: 72px; padding: 0 24px">
<span class="mono" style="font-weight: 600; color: var(--fg)">{{ row.label }}</span>
<template v-for="(c, cIndex) in row.cells" :key="cIndex">
<div><button :class="c.cls" type="button" :aria-busy="c.busy" :aria-disabled="c.ariaDisabled"><span class="lbl">{{ c.verb }}</span></button></div>
</template>
</div>
</template>
</div>

<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0; border: 1px solid var(--brd-2); border-radius: 4px; background: var(--card)">
<div style="padding: 22px; display: flex; flex-direction: column; gap: 8px">
<span class="idx">линия светлее рамки</span>
<p class="body">Линия хода берёт тон подписи — в тёмной теме пастельный, — поэтому она заметна на любой заливке и не теряется на фоне, как терялась бы тень.</p>
</div>
<div style="padding: 22px; display: flex; flex-direction: column; gap: 8px; border-left: 1px solid var(--brd-2)">
<span class="idx">пунктир заметнее</span>
<p class="body">Пунктир недоступной кнопки — <span class="code">--gr-brd-hover</span> тёмной темы, светлее обычной рамки: пустая кнопка без заливки иначе исчезла бы.</p>
</div>
<div style="padding: 22px; display: flex; flex-direction: column; gap: 8px; border-left: 1px solid var(--brd-2)">
<span class="idx">контраст подписи</span>
<p class="body">Подпись solid — <span class="code">--gr-{tone}-solid-fg</span>, не ниже 4.5:1 на всех восьми тонах. Без бликов поверх заливки контраст одинаков по всей высоте кнопки.</p>
</div>
</div>

</div>
</template>
