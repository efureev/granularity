<script setup>
import { computed, reactive } from 'vue'

const state = reactive({})

function setState(patch) {
  Object.assign(state, patch)
}

const vals = computed(() => {
  const s = Object.assign({ saving: false }, state || {})
  const configs = [
    { v: 'primary', t: 'primary', verb: 'Сохранить' },
    { v: 'primary', t: 'neutral', verb: 'Продолжить' },
    { v: 'secondary', t: 'neutral', verb: 'Отмена' },
    { v: 'secondary', t: 'primary', verb: 'Дублировать' },
    { v: 'outline', t: 'primary', verb: 'Экспорт' },
    { v: 'ghost', t: 'neutral', verb: 'Пропустить' },
    { v: 'primary', t: 'danger', verb: 'Удалить' },
  ]
  const states = [
    { extra: '' },
    { extra: ' is-hover' },
    { extra: ' is-active' },
    { extra: ' is-focus' },
    { extra: ' is-loading', busy: 'true' },
    { extra: ' is-disabled', ariaDisabled: 'true' },
    { extra: ' is-disabled is-focus', ariaDisabled: 'true' },
  ]
  return {
    rows: configs.map(c => ({
      label: `${c.v} · ${c.t}`,
      cells: states.map(st => ({
        cls: `gb s-md v-${c.v} t-${c.t}${st.extra}`,
        verb: c.verb,
        busy: st.busy,
        ariaDisabled: st.busy || st.ariaDisabled,
      })),
    })),
    saveCls: `gb s-md v-primary t-primary${s.saving ? ' is-loading' : ''}`,
    saveBusy: s.saving ? 'true' : undefined,
    onSave: () => {
      if (s.saving)
        return
      setState({ saving: true })
      setTimeout(setState, 2000, { saving: false })
    },
  }
})
</script>

<template>
<div class="gr-light doc" style="width: 1280px; min-height: 1800px; padding: 56px 64px; display: flex; flex-direction: column; gap: 32px">

<header style="display: flex; flex-direction: column; gap: 12px">
<span class="eyebrow">03 · Состояния и линия хода</span>
<h2 class="h1" style="font-size: 32px; line-height: 40px">Кнопка не двигается — меняются линия и краска</h2>
<p class="lead">Наведение прочерчивает линию, нажатие доводит её до полной яркости и темнит заливку, фокус обводит контуром. Загрузка — бегущий отрезок той же линии, недоступность — пунктир.</p>
</header>

<div class="sheet" style="overflow: hidden">
<div style="display: grid; grid-template-columns: 150px repeat(7, minmax(0, 1fr)); align-items: end; padding: 14px 24px; background: var(--muted)">
<span class="colh">вес · тон</span>
<span class="colh" style="color: var(--fg)">покой</span>
<span class="colh" style="color: var(--fg)">наведение</span>
<span class="colh" style="color: var(--fg)">нажатие</span>
<span class="colh" style="color: var(--fg)">фокус</span>
<span class="colh" style="color: var(--fg)">загрузка</span>
<span class="colh" style="color: var(--fg)">disabled</span>
<span class="colh" style="color: var(--fg)">aria-disabled</span>
</div>
<template v-for="(row, rowIndex) in vals.rows" :key="rowIndex">
<div class="ruled" style="display: grid; grid-template-columns: 150px repeat(7, minmax(0, 1fr)); align-items: center; min-height: 76px; padding: 0 24px">
<span class="mono" style="font-weight: 600; color: var(--fg)">{{ row.label }}</span>
<template v-for="(c, cIndex) in row.cells" :key="cIndex">
<div><button :class="c.cls" type="button" :aria-busy="c.busy" :aria-disabled="c.ariaDisabled"><span class="lbl">{{ c.verb }}</span></button></div>
</template>
</div>
</template>
</div>

<div class="sheet" style="overflow: hidden">
<div style="display: grid; grid-template-columns: 170px minmax(0, 1fr) 90px 190px 300px; align-items: end; gap: 16px; padding: 12px 24px; background: var(--muted)">
<span class="colh">событие</span><span class="colh">что меняется</span><span class="colh">длит.</span><span class="colh">кривая</span><span class="colh">шкала, 1 с = 250 px</span>
</div>
<div class="ruled" style="display: grid; grid-template-columns: 170px minmax(0, 1fr) 90px 190px 300px; align-items: center; gap: 16px; padding: 12px 24px"><span class="h3">Линия хода</span><span class="body">прочерчивается слева направо, scaleX 0 → 1</span><span class="mono">180 мс</span><span class="mono">.2 0 0 1</span><div class="bar" style="width: 45px"></div></div>
<div class="ruled" style="display: grid; grid-template-columns: 170px minmax(0, 1fr) 90px 190px 300px; align-items: center; gap: 16px; padding: 12px 24px"><span class="h3">Краска</span><span class="body">заливка, рамка и подпись</span><span class="mono">120 мс</span><span class="mono">linear</span><div class="bar" style="width: 30px"></div></div>
<div class="ruled" style="display: grid; grid-template-columns: 170px minmax(0, 1fr) 90px 190px 300px; align-items: center; gap: 16px; padding: 12px 24px"><span class="h3">Нажатие</span><span class="body">заливка темнее, линия полной яркости; кнопка на месте</span><span class="mono">0 мс</span><span class="mono">—</span><span class="cap">движения нет</span></div>
<div class="ruled" style="display: grid; grid-template-columns: 170px minmax(0, 1fr) 90px 190px 300px; align-items: center; gap: 16px; padding: 12px 24px"><span class="h3">Фокус</span><span class="body">контур 2px с отступом 3px цветом кольца</span><span class="mono">80 мс</span><span class="mono">linear</span><div class="bar" style="width: 20px"></div></div>
<div class="ruled" style="display: grid; grid-template-columns: 170px minmax(0, 1fr) 90px 190px 300px; align-items: center; gap: 16px; padding: 12px 24px"><span class="h3">Загрузка</span><span class="body">отрезок в 36 % ширины бежит по кромке, по кругу</span><span class="mono">1100 мс</span><span class="mono">linear</span><div class="bar" style="width: 275px"></div></div>
<div class="ruled" style="display: grid; grid-template-columns: 170px minmax(0, 1fr) 90px 190px 300px; align-items: center; gap: 16px; padding: 12px 24px"><span class="h3">reduced-motion</span><span class="body">линия появляется сразу; отрезок загрузки не выключается, а замедляется до 2.6 с — другого сигнала у неё нет</span><span class="mono">0 мс</span><span class="mono">—</span><span class="cap">смысл не теряется</span></div>
</div>

<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px">

<div class="sheet" style="padding: 22px; display: flex; flex-direction: column; gap: 14px">
<span class="idx">загрузка без спиннера</span>
<div style="display: grid; grid-template-columns: 110px minmax(0, 1fr); gap: 12px 16px; align-items: center">
<span class="cap">покой</span><div><button class="gb s-md v-primary t-primary" type="button">Сохранить</button></div>
<span class="cap">загрузка</span><div style="display: flex; align-items: center; gap: 12px"><button class="gb s-md v-primary t-primary is-loading" type="button" aria-busy="true"><span class="lbl">Сохранить</span></button><span class="mono" style="color: var(--ok)">ширина та же, текст читается</span></div>
<span class="cap">outline</span><div><button class="gb s-md v-outline t-primary is-loading" type="button" aria-busy="true"><span class="lbl">Экспорт</span></button></div>
<span class="cap">ghost</span><div><button class="gb s-md v-ghost t-neutral is-loading" type="button" aria-busy="true"><span class="lbl">Обновить</span></button></div>
</div>
<p class="body">Подпись не прячется — человек видит, что именно ждёт. Скрытое «Загрузка…» по-прежнему дописывается к имени для скринридера, <span class="code">aria-busy</span> на месте.</p>
</div>

<div class="sheet" style="padding: 22px; display: flex; flex-direction: column; gap: 14px">
<span class="idx">недоступность — пунктир</span>
<div style="display: grid; grid-template-columns: 110px minmax(0, 1fr); gap: 12px 16px; align-items: center">
<span class="cap">primary</span><div><button class="gb s-md v-primary t-primary is-disabled" type="button" aria-disabled="true">Опубликовать</button></div>
<span class="cap">secondary</span><div><button class="gb s-md v-secondary t-neutral is-disabled" type="button" aria-disabled="true">Дублировать</button></div>
<span class="cap">с причиной</span><div style="padding-top: 28px"><span class="anchor"><button class="gb s-md v-primary t-primary is-disabled is-focus" type="button" aria-disabled="true" aria-describedby="why">Опубликовать</button><span id="why" class="tip" role="tooltip">Нужна роль редактора</span></span></div>
</div>
<p class="body">Заливка уходит у всех весов, остаётся пунктир <span class="code">--gr-brd-hover</span> и подпись <span class="code">--gr-disabled-fg</span>. Отличить от живой кнопки можно и в монохроме, и при плохой цветопередаче.</p>
</div>

</div>

<div class="blueprint" style="padding: 28px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
<span class="h3" style="margin-right: 8px">Живьём — наведите и нажмите</span>
<button :class="vals.saveCls" type="button" :aria-busy="vals.saveBusy" :aria-disabled="vals.saveBusy" @click="vals.onSave"><span class="lbl">Сохранить</span></button>
<button class="gb s-md v-secondary t-neutral" type="button">Отмена</button>
<button class="gb s-md v-outline t-primary" type="button">Предпросмотр</button>
<button class="gb s-md v-ghost t-neutral" type="button">Пропустить</button>
<button class="gb s-md v-primary t-danger" type="button">Удалить</button>
<span class="cap">«Сохранить» — 2 с загрузки</span>
</div>

</div>
</template>
