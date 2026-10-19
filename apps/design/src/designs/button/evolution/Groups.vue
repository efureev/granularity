<template>
<div class="gr-light doc" style="width: 1280px; min-height: 1200px; padding: 56px 64px; display: flex; flex-direction: column; gap: 32px">

<header style="display: flex; flex-direction: column; gap: 12px">
<span class="eyebrow">05 · Группы и составные кнопки</span>
<h2 class="h1" style="font-size: 32px; line-height: 40px">Кнопки, которые работают вместе</h2>
<p class="lead"><span class="code">GrButtonGroup</span> склеивает звенья в один блок и раздаёт им вес, тон и размер. Проп самой кнопки сильнее группы, группа сильнее <span class="code">GrConfigProvider</span>.</p>
</header>

<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px">

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; align-items: baseline; justify-content: space-between"><h3 class="h3">Склеенный ряд</h3><span class="code">attached</span></div>
<div class="stage" style="min-height: 150px; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px">
<div class="grp" role="group" aria-label="Навигация по датам">
<button class="gb s-md sq v-secondary t-neutral" type="button" aria-label="Предыдущая неделя"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"></path></svg></button>
<button class="gb s-md v-secondary t-neutral" type="button">Сегодня</button>
<button class="gb s-md sq v-secondary t-neutral" type="button" aria-label="Следующая неделя"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg></button>
</div>
<div class="grp" role="group" aria-label="Навигация по датам, фокус на среднем звене">
<button class="gb s-md sq v-secondary t-neutral" type="button" aria-label="Предыдущая неделя"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"></path></svg></button>
<button class="gb s-md v-secondary t-neutral is-focus" type="button">Сегодня</button>
<button class="gb s-md sq v-secondary t-neutral" type="button" aria-label="Следующая неделя"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg></button>
</div>
</div>
<p class="body">Внутренние углы — 0, рамки внахлёст на 1 px. Звено с фокусом поднимается над соседями: кольцо видно целиком.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; align-items: baseline; justify-content: space-between"><h3 class="h3">Сплит-кнопка</h3><span class="tag tag-new">разделитель</span></div>
<div class="stage" style="min-height: 150px; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px">
<div class="grp" role="group" aria-label="Публикация">
<button class="gb s-md v-primary t-primary" type="button">Опубликовать</button>
<button class="gb s-md sq v-primary t-primary" type="button" aria-label="Другие варианты публикации" aria-haspopup="menu" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>
</div>
<div class="grp" role="group" aria-label="Экспорт">
<button class="gb s-md v-secondary t-neutral pre" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m7 10 5 5 5-5"></path><path d="M12 15V3"></path></svg><span class="lbl">Экспорт в PDF</span></button>
<button class="gb s-md sq v-secondary t-neutral" type="button" aria-label="Другие форматы" aria-haspopup="menu" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>
</div>
</div>
<p class="body">Между solid-звеньями — светлый разделитель 1 px. Без него «Опубликовать ▾» читается одной кнопкой, и шеврон кажется частью подписи.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; align-items: baseline; justify-content: space-between"><h3 class="h3">Вертикальная</h3><span class="code">orientation="vertical"</span></div>
<div class="stage" style="min-height: 150px; padding: 20px; display: flex; align-items: center; justify-content: center">
<div class="grp vert" role="group" aria-label="Действия с файлом" style="width: 220px">
<button class="gb s-md v-secondary t-neutral pre" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m17 8-5-5-5 5"></path><path d="M12 3v12"></path></svg><span class="lbl">Загрузить новую версию</span></button>
<button class="gb s-md v-secondary t-neutral pre is-hover" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="14" height="14" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg><span class="lbl">Дублировать</span></button>
<button class="gb s-md v-secondary t-danger pre" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg><span class="lbl">Удалить файл</span></button>
</div>
</div>
<p class="body">Звенья одной ширины, подпись прижата к началу — список действий читается сверху вниз.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; align-items: baseline; justify-content: space-between"><h3 class="h3">Тулбар</h3><span class="code">attached: false</span></div>
<div class="stage" style="min-height: 150px; padding: 20px; display: flex; align-items: center; justify-content: center">
<div role="toolbar" aria-label="Форматирование" style="display: flex; align-items: center; gap: 2px; padding: 4px; background: var(--card); border: 1px solid var(--brd); border-radius: 10px; box-shadow: var(--sh-xs)">
<button class="gb s-sm sq v-ghost-border t-neutral" type="button" aria-label="Полужирный"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"></path></svg></button>
<button class="gb s-sm sq v-ghost-border t-neutral is-hover" type="button" aria-label="Курсив"><svg viewBox="0 0 24 24" aria-hidden="true"><line x1="19" x2="10" y1="4" y2="4"></line><line x1="14" x2="5" y1="20" y2="20"></line><line x1="15" x2="9" y1="4" y2="20"></line></svg></button>
<button class="gb s-sm sq v-ghost-border t-neutral" type="button" aria-label="Подчёркнутый"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4v6a6 6 0 0 0 12 0V4"></path><line x1="4" x2="20" y1="20" y2="20"></line></svg></button>
<span aria-hidden="true" style="width: 1px; height: 20px; margin: 0 6px; background: var(--brd)"></span>
<button class="gb s-sm sq v-ghost-border t-neutral" type="button" aria-label="По левому краю"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 6H3M15 12H3M17 18H3"></path></svg></button>
<button class="gb s-sm sq v-ghost-border t-neutral" type="button" aria-label="По центру"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 6H3M17 12H7M19 18H5"></path></svg></button>
<button class="gb s-sm sq v-ghost-border t-neutral" type="button" aria-label="По правому краю"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 6H3M21 12H9M21 18H7"></path></svg></button>
</div>
</div>
<p class="body">Ряд с зазором, ghost-border: граница появляется под указателем. Разделитель не кнопка — в склейку не попадает.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 14px; grid-column: span 2">
<div style="display: flex; align-items: baseline; justify-content: space-between"><h3 class="h3">Наследование: группа задаёт, кнопка уточняет</h3><span class="code">проп → группа → провайдер</span></div>
<div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px">
<div class="stage" style="min-height: 150px; padding: 20px; display: flex; align-items: center; justify-content: center">
<div class="grp" role="group" aria-label="Действия с записью">
<button class="gb s-sm v-outline t-primary" type="button">Изменить</button>
<button class="gb s-sm v-outline t-primary" type="button">Дублировать</button>
<button class="gb s-sm v-outline t-danger" type="button">Удалить</button>
</div>
</div>
<pre class="mono" style="margin: 0; padding: 16px 18px; border-radius: 10px; background: #0f172a; color: #e2e8f0; white-space: pre; overflow: auto">&lt;GrButtonGroup
  variant="outline"
  size="sm"
  aria-label="Действия с записью"&gt;
  &lt;GrButton&gt;Изменить&lt;/GrButton&gt;
  &lt;GrButton&gt;Дублировать&lt;/GrButton&gt;
  &lt;GrButton tone="danger"&gt;Удалить&lt;/GrButton&gt;
&lt;/GrButtonGroup&gt;</pre>
</div>
</div>

</div>

<div class="panel" style="padding: 24px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 32px">
<h3 class="h3" style="grid-column: span 2">Правила склейки</h3>
<p class="body"><b style="color: var(--fg)">Имя группы.</b> <span class="code">aria-label</span> обязателен: без него кнопки читаются как несвязанные.</p>
<p class="body"><b style="color: var(--fg)">Звено</b> — прямой потомок, который сам кнопка или содержит её. Тултип и роутерная ссылка ряд не рвут.</p>
<p class="body"><b style="color: var(--fg)">Углы</b> гасятся переменной радиуса угла, а не border-radius — иначе правило проигрывает слою утилит.</p>
<p class="body"><b style="color: var(--fg)">Переключатели</b> — не сюда: вид одного содержимого меняет <span class="code">GrSegmented</span>, вкл/выкл — <span class="code">GrSwitch</span>.</p>
</div>

</div>
</template>
