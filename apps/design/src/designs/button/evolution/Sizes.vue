<template>
<div class="gr-light doc" style="width: 1280px; min-height: 1760px; padding: 56px 64px; display: flex; flex-direction: column; gap: 32px">

<header style="display: flex; flex-direction: column; gap: 12px">
<span class="eyebrow">04 · Размеры и содержимое</span>
<h2 class="h1" style="font-size: 32px; line-height: 40px">Четыре ступени одной шкалы контролов</h2>
<p class="lead">Кнопка стоит в ряд с полем, селектом и чипом той же ступени — высоты совпадают до пикселя. Ступень приходит из пропа, группы или <span class="code">GrConfigProvider</span>.</p>
</header>

<div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px">

<div style="display: flex; flex-direction: column; gap: 10px">
<div style="display: flex; align-items: baseline; gap: 8px"><span class="mono" style="font-weight: 600">xs</span><span class="cap">28 px · кегль 12</span></div>
<div class="stage" style="min-height: 250px; padding: 40px 24px 24px; display: flex; flex-direction: column; align-items: center; justify-content: space-between">
<div style="position: relative; display: inline-flex">
<button class="gb s-xs v-primary t-primary" type="button">Сохранить</button>
<div class="dim dim-v l" style="left: -18px; top: 0; height: 28px"><span>28</span></div>
<div class="dim dim-h" style="left: 0; top: -14px; width: 10px"><span>10</span></div>
</div>
<button class="gb s-xs v-secondary t-neutral pre" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg><span class="lbl">Добавить</span></button>
<div style="display: flex; gap: 8px">
<button class="gb s-xs sq v-outline t-neutral" type="button" aria-label="Копировать"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="14" height="14" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg></button>
<button class="gb s-xs sq v-ghost t-neutral" type="button" aria-label="Ещё"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg></button>
</div>
</div>
</div>

<div style="display: flex; flex-direction: column; gap: 10px">
<div style="display: flex; align-items: baseline; gap: 8px"><span class="mono" style="font-weight: 600">sm</span><span class="cap">32 px · кегль 14</span></div>
<div class="stage" style="min-height: 250px; padding: 40px 24px 24px; display: flex; flex-direction: column; align-items: center; justify-content: space-between">
<div style="position: relative; display: inline-flex">
<button class="gb s-sm v-primary t-primary" type="button">Сохранить</button>
<div class="dim dim-v l" style="left: -18px; top: 0; height: 32px"><span>32</span></div>
<div class="dim dim-h" style="left: 0; top: -14px; width: 12px"><span>12</span></div>
</div>
<button class="gb s-sm v-secondary t-neutral pre" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg><span class="lbl">Добавить</span></button>
<div style="display: flex; gap: 8px">
<button class="gb s-sm sq v-outline t-neutral" type="button" aria-label="Копировать"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="14" height="14" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg></button>
<button class="gb s-sm sq v-ghost t-neutral" type="button" aria-label="Ещё"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg></button>
</div>
</div>
</div>

<div style="display: flex; flex-direction: column; gap: 10px">
<div style="display: flex; align-items: baseline; gap: 8px"><span class="mono" style="font-weight: 600">md</span><span class="cap">40 px · кегль 14 · по умолчанию</span></div>
<div class="stage" style="min-height: 250px; padding: 40px 24px 24px; display: flex; flex-direction: column; align-items: center; justify-content: space-between">
<div style="position: relative; display: inline-flex">
<button class="gb s-md v-primary t-primary" type="button">Сохранить</button>
<div class="dim dim-v l" style="left: -18px; top: 0; height: 40px"><span>40</span></div>
<div class="dim dim-h" style="left: 0; top: -14px; width: 16px"><span>16</span></div>
</div>
<button class="gb s-md v-secondary t-neutral pre" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg><span class="lbl">Добавить</span></button>
<div style="display: flex; gap: 8px">
<button class="gb s-md sq v-outline t-neutral" type="button" aria-label="Копировать"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="14" height="14" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg></button>
<button class="gb s-md sq v-ghost t-neutral" type="button" aria-label="Ещё"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg></button>
</div>
</div>
</div>

<div style="display: flex; flex-direction: column; gap: 10px">
<div style="display: flex; align-items: baseline; gap: 8px"><span class="mono" style="font-weight: 600">lg</span><span class="cap">44 px · кегль 16</span></div>
<div class="stage" style="min-height: 250px; padding: 40px 24px 24px; display: flex; flex-direction: column; align-items: center; justify-content: space-between">
<div style="position: relative; display: inline-flex">
<button class="gb s-lg v-primary t-primary" type="button">Сохранить</button>
<div class="dim dim-v l" style="left: -18px; top: 0; height: 44px"><span>44</span></div>
<div class="dim dim-h" style="left: 0; top: -14px; width: 20px"><span>20</span></div>
</div>
<button class="gb s-lg v-secondary t-neutral pre" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg><span class="lbl">Добавить</span></button>
<div style="display: flex; gap: 8px">
<button class="gb s-lg sq v-outline t-neutral" type="button" aria-label="Копировать"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="14" height="14" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg></button>
<button class="gb s-lg sq v-ghost t-neutral" type="button" aria-label="Ещё"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg></button>
</div>
</div>
</div>

</div>

<div style="display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr); gap: 16px">

<div class="panel" style="overflow: hidden">
<div style="display: grid; grid-template-columns: 70px 70px 70px 90px 70px 70px 80px minmax(0, 1fr); padding: 14px 24px; background: var(--bg)">
<span class="colh">ступень</span><span class="colh">высота</span><span class="colh">отступ</span><span class="colh">кегль</span><span class="colh">иконка</span><span class="colh">зазор</span><span class="colh">квадрат</span><span class="colh">где брать</span>
</div>
<div style="display: grid; grid-template-columns: 70px 70px 70px 90px 70px 70px 80px minmax(0, 1fr); padding: 14px 24px; border-top: 1px solid var(--brd); align-items: center">
<span class="mono" style="font-weight: 600">xs</span><span class="mono">28</span><span class="mono">10</span><span class="mono">12 / 16</span><span class="mono">14</span><span class="mono">4</span><span class="mono">28</span><span class="body">плотные таблицы, строки списков</span>
</div>
<div style="display: grid; grid-template-columns: 70px 70px 70px 90px 70px 70px 80px minmax(0, 1fr); padding: 14px 24px; border-top: 1px solid var(--brd); align-items: center">
<span class="mono" style="font-weight: 600">sm</span><span class="mono">32</span><span class="mono">12</span><span class="mono">14 / 20</span><span class="mono">16</span><span class="mono">6</span><span class="mono">32</span><span class="body">тулбары, фильтры, карточки</span>
</div>
<div style="display: grid; grid-template-columns: 70px 70px 70px 90px 70px 70px 80px minmax(0, 1fr); padding: 14px 24px; border-top: 1px solid var(--brd); align-items: center">
<span class="mono" style="font-weight: 600">md</span><span class="mono">40</span><span class="mono">16</span><span class="mono">14 / 20</span><span class="mono">16</span><span class="mono">8</span><span class="mono">40</span><span class="body">по умолчанию: формы, диалоги</span>
</div>
<div style="display: grid; grid-template-columns: 70px 70px 70px 90px 70px 70px 80px minmax(0, 1fr); padding: 14px 24px; border-top: 1px solid var(--brd); align-items: center">
<span class="mono" style="font-weight: 600">lg</span><span class="mono">44</span><span class="mono">20</span><span class="mono">16 / 24</span><span class="mono">20</span><span class="mono">8</span><span class="mono">44</span><span class="body">мобильный UI, главный призыв</span>
</div>
<p class="cap" style="padding: 14px 24px; border-top: 1px solid var(--brd)">Со стороны иконки отступ на 2 px меньше. Квадрат — <span class="code">--gr-button-square-size</span> в узком скоупе, не на :root.</p>
</div>

<div class="panel" style="padding: 24px; display: flex; flex-direction: column; gap: 16px">
<div style="display: flex; align-items: center; justify-content: space-between"><h3 class="h3">Зона касания</h3><span class="tag tag-new">изменение 12</span></div>
<div class="stage" style="min-height: 150px; display: flex; align-items: center; justify-content: center; gap: 48px">
<div style="position: relative; display: inline-flex">
<div class="zone" style="left: -4px; right: -4px; top: -8px; bottom: -8px"></div>
<button class="gb s-xs v-secondary t-neutral" type="button">Изменить</button>
<div class="dim dim-v" style="right: -22px; top: -8px; height: 44px"><span>44</span></div>
</div>
<div style="position: relative; display: inline-flex">
<div class="zone" style="left: -6px; right: -6px; top: -6px; bottom: -6px"></div>
<button class="gb s-sm sq v-ghost t-neutral" type="button" aria-label="Ещё"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg></button>
<div class="dim dim-v" style="right: -24px; top: -6px; height: 44px"><span>44</span></div>
</div>
</div>
<p class="body">На <span class="code">pointer: coarse</span> у xs и sm невидимый <span class="code">::after</span> растягивает касание до 44 px. Вид и плотность таблицы прежние.</p>
</div>

</div>

<section style="display: flex; flex-direction: column; gap: 16px">
<h2 class="h2">Содержимое и слоты</h2>
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px">

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; align-items: baseline; justify-content: space-between"><h3 class="h3">Иконка слева</h3><span class="code">#prefix</span></div>
<div class="stage" style="min-height: 96px; display: flex; align-items: center; justify-content: center; gap: 10px">
<button class="gb s-md v-primary t-primary pre" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg><span class="lbl">Новый отчёт</span></button>
<button class="gb s-md v-secondary t-neutral pre" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m7 10 5 5 5-5"></path><path d="M12 15V3"></path></svg><span class="lbl">Скачать</span></button>
</div>
<p class="body">Иконка уточняет глагол, а не заменяет его. Одна на кнопку.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; align-items: baseline; justify-content: space-between"><h3 class="h3">Меню и клавиша</h3><span class="code">#suffix</span></div>
<div class="stage" style="min-height: 96px; display: flex; align-items: center; justify-content: center; gap: 10px">
<button class="gb s-md v-secondary t-neutral suf" type="button" aria-haspopup="menu" aria-expanded="false"><span class="lbl">Экспорт</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>
<button class="gb s-md v-secondary t-neutral pre suf" type="button" aria-keyshortcuts="Meta+K"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg><span class="lbl">Найти</span><span class="kbd">⌘K</span></button>
</div>
<p class="body">Шеврон — только когда кнопка открывает меню: <span class="code">aria-haspopup</span> и <span class="code">aria-expanded</span>.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; align-items: baseline; justify-content: space-between"><h3 class="h3">Счётчик</h3><span class="code">#suffix</span></div>
<div class="stage" style="min-height: 96px; display: flex; align-items: center; justify-content: center; gap: 10px">
<button class="gb s-md v-outline t-neutral pre suf" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"></path></svg><span class="lbl">Фильтры</span><span class="cnt">3</span></button>
<button class="gb s-md v-primary t-primary suf" type="button"><span class="lbl">Отправить</span><span class="cnt">12</span></button>
</div>
<p class="body">Число входит в доступное имя: «Фильтры, 3 активных» через скрытый текст.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; align-items: baseline; justify-content: space-between"><h3 class="h3">Только иконка</h3><span class="code">square + ariaLabel</span></div>
<div class="stage" style="min-height: 96px; display: flex; align-items: flex-end; justify-content: center; gap: 6px; padding-bottom: 18px">
<span class="anchor"><button class="gb s-md sq v-ghost-border t-neutral is-hover" type="button" aria-label="Копировать"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="14" height="14" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg></button><span class="tip" role="tooltip">Копировать</span></span>
<button class="gb s-md sq v-ghost-border t-neutral" type="button" aria-label="Переименовать"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg></button>
<button class="gb s-md sq v-ghost-border t-danger" type="button" aria-label="Удалить"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg></button>
</div>
<p class="body">Без <span class="code">ariaLabel</span> кнопка безымянна. Тултип повторяет имя для зрячих.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; align-items: baseline; justify-content: space-between"><h3 class="h3">Ссылка с видом кнопки</h3><span class="code">href · external</span></div>
<div class="stage" style="min-height: 96px; display: flex; align-items: center; justify-content: center; gap: 10px">
<a class="gb s-md v-outline t-primary suf" href="https://granularity.tech/docs" target="_blank" rel="noopener noreferrer"><span class="lbl">Документация</span><svg class="ext" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg></a>
<a class="gb s-md v-ghost t-primary" href="#">Все отчёты</a>
</div>
<p class="body">Корень — <span class="code">&lt;a&gt;</span>: Enter переходит, Space нет, как у любой ссылки. Значок и «в новой вкладке» — когда ссылка правда уводит в новую вкладку.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; align-items: baseline; justify-content: space-between"><h3 class="h3">Ширина</h3><span class="code">block · многоточие</span></div>
<div class="stage" style="min-height: 96px; display: flex; align-items: center; justify-content: center; gap: 16px; padding: 0 16px">
<div style="width: 150px; display: flex; flex-direction: column; gap: 6px">
<button class="gb s-sm v-primary t-primary block" type="button">Войти</button>
<button class="gb s-sm v-secondary t-neutral block" type="button">Создать аккаунт</button>
</div>
<div style="width: 150px; padding: 6px; border: 1px dashed var(--brd-3); border-radius: 8px">
<button class="gb s-sm v-secondary t-neutral" type="button" title="Экспортировать отчёт за третий квартал" style="width: 100%"><span class="lbl">Экспортировать отчёт за третий квартал</span></button>
</div>
</div>
<p class="body">block тянет на ширину контейнера. Длинная подпись режется многоточием, полное имя — в title.</p>
</div>

</div>
</section>

</div>
</template>
