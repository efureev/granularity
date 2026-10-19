<script setup>
import { computed } from 'vue'

const vals = computed(() => {
  const configs = [
    { v: 'primary', t: 'primary', verb: 'Сохранить' },
    { v: 'secondary', t: 'primary', verb: 'Дублировать' },
    { v: 'secondary', t: 'neutral', verb: 'Отмена' },
    { v: 'outline', t: 'primary', verb: 'Экспорт' },
    { v: 'ghost', t: 'neutral', verb: 'Пропустить' },
    { v: 'primary', t: 'danger', verb: 'Удалить' },
  ]
  const states = [
    { extra: '' },
    { extra: ' is-hover' },
    { extra: ' is-active' },
    { extra: ' is-focus' },
    { extra: ' is-loading ov', loading: true },
    { extra: ' is-disabled', ariaDisabled: 'true' },
    { extra: ' is-disabled is-focus', ariaDisabled: 'true' },
  ]
  return {
    rows: configs.map(c => ({
      label: `${c.v} · ${c.t}`,
      verb: c.verb,
      cells: states.map(s => ({
        cls: `gb s-md v-${c.v} t-${c.t}${s.extra}`,
        verb: c.verb,
        loading: Boolean(s.loading),
        plain: !s.loading,
        ariaDisabled: s.ariaDisabled,
      })),
    })),
  }
})
</script>

<template>
<div class="gr-light doc" style="width: 1280px; min-height: 1880px; padding: 56px 64px; display: flex; flex-direction: column; gap: 32px">

<header style="display: flex; flex-direction: column; gap: 12px">
<span class="eyebrow">03 · Состояния</span>
<h2 class="h1" style="font-size: 32px; line-height: 40px">Семь состояний, и каждое говорит своё</h2>
<p class="lead">Загрузка — не недоступность: кнопка остаётся в фокусе и выглядит обычной, о состоянии говорит спиннер. Недоступность гасится токенами, без прозрачности.</p>
</header>

<div class="panel" style="overflow: hidden">
<div style="display: grid; grid-template-columns: 150px repeat(7, minmax(0, 1fr)); align-items: end; padding: 16px 24px; background: var(--bg)">
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
<div style="display: grid; grid-template-columns: 150px repeat(7, minmax(0, 1fr)); align-items: center; min-height: 76px; padding: 0 24px; border-top: 1px solid var(--brd)">
<span class="mono" style="font-weight: 600; color: var(--fg)">{{ row.label }}</span>
<template v-for="(c, cIndex) in row.cells" :key="cIndex">
<div>
<template v-if="c.plain">
<button :class="c.cls" type="button" :aria-disabled="c.ariaDisabled">{{ c.verb }}</button>
</template>
<template v-if="c.loading">
<button :class="c.cls" type="button" aria-busy="true" aria-disabled="true"><span class="lbl">{{ c.verb }}</span><span class="ov-spin" aria-hidden="true"><svg class="spin" viewBox="0 0 24 24"><circle class="trk" cx="12" cy="12" r="9"></circle><path d="M21 12a9 9 0 0 0-9-9"></path></svg></span></button>
</template>
</div>
</template>
</div>
</template>
</div>

<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px">

<div class="panel" style="padding: 24px; display: flex; flex-direction: column; gap: 16px">
<div style="display: flex; align-items: center; justify-content: space-between"><h3 class="h3">Загрузка без скачка ширины</h3><span class="tag tag-new">изменение 04</span></div>
<div style="display: grid; grid-template-columns: 110px minmax(0, 1fr); gap: 14px 16px; align-items: center">
<span class="cap">1.1, покой</span>
<div><button class="gb s-md v-primary t-primary" type="button">Сохранить</button></div>
<span class="cap">1.1, загрузка</span>
<div style="display: flex; align-items: center; gap: 12px"><button class="gb s-md v-primary t-primary is-loading" type="button" aria-busy="true"><svg class="spin" viewBox="0 0 24 24" aria-hidden="true"><circle class="trk" cx="12" cy="12" r="9"></circle><path d="M21 12a9 9 0 0 0-9-9"></path></svg><span class="lbl">Сохранить</span></button><span class="mono" style="color: var(--red)">+24 px, соседи едут</span></div>
<span class="cap">1.2, без префикса</span>
<div style="display: flex; align-items: center; gap: 12px"><button class="gb s-md v-primary t-primary is-loading ov" type="button" aria-busy="true"><span class="lbl">Сохранить</span><span class="ov-spin" aria-hidden="true"><svg class="spin" viewBox="0 0 24 24"><circle class="trk" cx="12" cy="12" r="9"></circle><path d="M21 12a9 9 0 0 0-9-9"></path></svg></span></button><span class="mono" style="color: var(--ok)">ширина та же</span></div>
<span class="cap">1.2, с префиксом</span>
<div style="display: flex; align-items: center; gap: 12px"><button class="gb s-md v-primary t-primary pre is-loading" type="button" aria-busy="true"><svg class="spin" viewBox="0 0 24 24" aria-hidden="true"><circle class="trk" cx="12" cy="12" r="9"></circle><path d="M21 12a9 9 0 0 0-9-9"></path></svg><span class="lbl">Опубликовать</span></button><span class="mono" style="color: var(--ok)">спиннер на месте иконки</span></div>
</div>
<p class="body">Подпись прячется через opacity, а не visibility — так она остаётся в доступном имени; к нему добавляется скрытое «Сохраняем…» из <span class="code">loadingText</span>. Курсор — <span class="code">progress</span>.</p>
</div>

<div class="panel" style="padding: 24px; display: flex; flex-direction: column; gap: 16px">
<div style="display: flex; align-items: center; justify-content: space-between"><h3 class="h3">Фокус, который видно на любой заливке</h3><span class="tag tag-new">изменение 02</span></div>
<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px">
<div class="stage" style="padding: 24px 16px; display: flex; flex-direction: column; align-items: center; gap: 12px">
<button class="gb s-md v-primary t-primary" type="button" style="box-shadow: 0 0 0 2px #6366f1">Сохранить</button>
<span class="cap" style="text-align: center">1.1 · ring вплотную: кольцо читается как утолщение, к заливке 1.4:1</span>
</div>
<div class="stage" style="padding: 24px 16px; display: flex; flex-direction: column; align-items: center; gap: 12px">
<button class="gb s-md v-primary t-primary is-focus" type="button">Сохранить</button>
<span class="cap" style="text-align: center">1.2 · outline с отступом в цвет фона: кольцо отделено от кнопки</span>
</div>
</div>
<ul style="display: flex; flex-direction: column; gap: 6px">
<li class="body">Только <span class="code">:focus-visible</span> — клик мышью кольца не рисует.</li>
<li class="body">Outline остаётся в forced-colors: Windows подменит цвет на системный, а не уберёт его.</li>
<li class="body">В группе звено с фокусом поднимается над соседями — кольцо не прячется под рамкой.</li>
</ul>
</div>

</div>

<div class="panel" style="overflow: hidden">
<div style="display: grid; grid-template-columns: 150px 300px 140px minmax(0, 1fr); padding: 14px 24px; background: var(--bg)">
<span class="colh">состояние</span><span class="colh">токены</span><span class="colh">курсор</span><span class="colh">поведение и ARIA</span>
</div>
<div style="display: grid; grid-template-columns: 150px 300px 140px minmax(0, 1fr); gap: 0; align-items: start">
<div style="display: contents">
<span class="h3" style="padding: 12px 24px; border-top: 1px solid var(--brd)">Наведение</span><span class="mono" style="padding: 12px 0; border-top: 1px solid var(--brd)">--gr-button-*-bg-hover</span><span class="mono" style="padding: 12px 0; border-top: 1px solid var(--brd)">pointer</span><span class="body" style="padding: 12px 24px 12px 0; border-top: 1px solid var(--brd)">Цвет за 150 мс; у soft-весов тон подмешивается в саму подложку.</span>
</div>
<div style="display: contents">
<span class="h3" style="padding: 12px 24px; border-top: 1px solid var(--brd)">Нажатие</span><span class="mono" style="padding: 12px 0; border-top: 1px solid var(--brd)">--gr-button-*-bg-active</span><span class="mono" style="padding: 12px 0; border-top: 1px solid var(--brd)">pointer</span><span class="body" style="padding: 12px 24px 12px 0; border-top: 1px solid var(--brd)">Внутренняя тень и scale .98 за 120 мс; Enter срабатывает на keydown, Space — на keyup.</span>
</div>
<div style="display: contents">
<span class="h3" style="padding: 12px 24px; border-top: 1px solid var(--brd)">Фокус</span><span class="mono" style="padding: 12px 0; border-top: 1px solid var(--brd)">--gr-ring</span><span class="mono" style="padding: 12px 0; border-top: 1px solid var(--brd)">—</span><span class="body" style="padding: 12px 24px 12px 0; border-top: 1px solid var(--brd)">outline 2 px, offset 2 px; ref.focus() работает и когда корень — RouterLink.</span>
</div>
<div style="display: contents">
<span class="h3" style="padding: 12px 24px; border-top: 1px solid var(--brd)">Загрузка</span><span class="mono" style="padding: 12px 0; border-top: 1px solid var(--brd)">цвета покоя</span><span class="mono" style="padding: 12px 0; border-top: 1px solid var(--brd)">progress</span><span class="body" style="padding: 12px 24px 12px 0; border-top: 1px solid var(--brd)">aria-busy и aria-disabled, клик гасится в capture-фазе, фокус остаётся, скрытый суффикс gr.button.loading.</span>
</div>
<div style="display: contents">
<span class="h3" style="padding: 12px 24px; border-top: 1px solid var(--brd)">disabled</span><span class="mono" style="padding: 12px 0; border-top: 1px solid var(--brd)">--gr-button-disabled-bg / -fg / -brd</span><span class="mono" style="padding: 12px 0; border-top: 1px solid var(--brd)">not-allowed</span><span class="body" style="padding: 12px 24px 12px 0; border-top: 1px solid var(--brd)">Нативный disabled у button; у ссылки — aria-disabled, снятый href и tabindex −1. Внутри GrForm disabled гаснет только submit.</span>
</div>
<div style="display: contents">
<span class="h3" style="padding: 12px 24px; border-top: 1px solid var(--brd)">aria-disabled</span><span class="mono" style="padding: 12px 0; border-top: 1px solid var(--brd)">те же disabled-токены</span><span class="mono" style="padding: 12px 0; border-top: 1px solid var(--brd)">not-allowed</span><span class="body" style="padding: 12px 24px 12px 0; border-top: 1px solid var(--brd)">Остаётся в таб-порядке — на неё можно навести тултип с причиной. Клик гасит потребитель.</span>
</div>
</div>
</div>

<div class="stage" style="padding: 24px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
<span class="h3" style="margin-right: 8px">Живые кнопки — наведите, нажмите, пройдите Tab</span>
<button class="gb s-md v-primary t-primary" type="button">Сохранить</button>
<button class="gb s-md v-secondary t-neutral" type="button">Отмена</button>
<button class="gb s-md v-outline t-primary" type="button">Предпросмотр</button>
<button class="gb s-md v-ghost t-neutral" type="button">Пропустить</button>
<button class="gb s-md v-primary t-danger" type="button">Удалить</button>
<span class="anchor"><button class="gb s-md v-primary t-primary is-disabled" type="button" aria-disabled="true" aria-describedby="why-locked">Опубликовать</button><span id="why-locked" class="tip" role="tooltip">Нужна роль редактора</span></span>
</div>

</div>
</template>
