<template>
<div class="gr-light doc" style="width: 1280px; min-height: 1700px; padding: 56px 64px; display: flex; flex-direction: column; gap: 32px">

<header style="display: flex; flex-direction: column; gap: 12px">
<span class="eyebrow">04 · Размеры, содержимое, группы</span>
<h2 class="h1" style="font-size: 32px; line-height: 40px">Высоты прежние, воздуха больше</h2>
<p class="lead">Ступени остаются на общей шкале контролов, чтобы кнопка стояла вровень с полем. Шире боковые поля, радиус растёт со ступенью, иконка — на 3 px ближе к краю.</p>
</header>

<div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px">
<div style="display: flex; flex-direction: column; gap: 10px">
<div style="display: flex; align-items: baseline; gap: 8px"><span class="mono" style="font-weight: 600">xs</span><span class="cap">28 · поле 10 · r 8 · 12 px</span></div>
<div class="stage" style="min-height: 210px; padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px">
<button class="gb s-xs v-primary t-primary" type="button">Сохранить</button>
<button class="gb s-xs v-secondary t-neutral pre" type="button"><svg class="pop" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg><span class="lbl">Добавить</span></button>
<div style="display: flex; gap: 6px"><button class="gb s-xs sq v-outline t-neutral" type="button" aria-label="Копировать"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="14" height="14" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg></button><button class="gb s-xs sq v-ghost t-neutral is-hover" type="button" aria-label="Ещё"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg></button></div>
</div>
</div>
<div style="display: flex; flex-direction: column; gap: 10px">
<div style="display: flex; align-items: baseline; gap: 8px"><span class="mono" style="font-weight: 600">sm</span><span class="cap">32 · поле 13 · r 8 · 14 px</span></div>
<div class="stage" style="min-height: 210px; padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px">
<button class="gb s-sm v-primary t-primary" type="button">Сохранить</button>
<button class="gb s-sm v-secondary t-neutral pre" type="button"><svg class="pop" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg><span class="lbl">Добавить</span></button>
<div style="display: flex; gap: 6px"><button class="gb s-sm sq v-outline t-neutral" type="button" aria-label="Копировать"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="14" height="14" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg></button><button class="gb s-sm sq v-ghost t-neutral is-hover" type="button" aria-label="Ещё"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg></button></div>
</div>
</div>
<div style="display: flex; flex-direction: column; gap: 10px">
<div style="display: flex; align-items: baseline; gap: 8px"><span class="mono" style="font-weight: 600">md</span><span class="cap">40 · поле 18 · r 10 · 14 px</span></div>
<div class="stage" style="min-height: 210px; padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px">
<button class="gb s-md v-primary t-primary" type="button">Сохранить</button>
<button class="gb s-md v-secondary t-neutral pre" type="button"><svg class="pop" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg><span class="lbl">Добавить</span></button>
<div style="display: flex; gap: 6px"><button class="gb s-md sq v-outline t-neutral" type="button" aria-label="Копировать"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="14" height="14" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg></button><button class="gb s-md sq v-ghost t-neutral is-hover" type="button" aria-label="Ещё"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg></button></div>
</div>
</div>
<div style="display: flex; flex-direction: column; gap: 10px">
<div style="display: flex; align-items: baseline; gap: 8px"><span class="mono" style="font-weight: 600">lg</span><span class="cap">44 · поле 22 · r 12 · 16 px</span></div>
<div class="stage" style="min-height: 210px; padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px">
<button class="gb s-lg v-primary t-primary" type="button">Сохранить</button>
<button class="gb s-lg v-secondary t-neutral pre" type="button"><svg class="pop" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg><span class="lbl">Добавить</span></button>
<div style="display: flex; gap: 6px"><button class="gb s-lg sq v-outline t-neutral" type="button" aria-label="Копировать"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="14" height="14" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg></button><button class="gb s-lg sq v-ghost t-neutral is-hover" type="button" aria-label="Ещё"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg></button></div>
</div>
</div>
</div>

<section style="display: flex; flex-direction: column; gap: 16px">
<h2 class="h2">Содержимое оживает</h2>
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px">

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; align-items: baseline; justify-content: space-between"><h3 class="h3">Плюс поворачивается</h3><span class="code">#prefix</span></div>
<div class="stage" style="min-height: 96px; display: flex; align-items: center; justify-content: center; gap: 10px">
<button class="gb s-md v-primary t-primary pre is-hover" type="button"><svg class="pop" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg><span class="lbl">Новый отчёт</span></button>
</div>
<p class="body">Под указателем плюс делает четверть оборота — действие «создать» ощущается живым.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; align-items: baseline; justify-content: space-between"><h3 class="h3">Стрелка подталкивает</h3><span class="code">#suffix</span></div>
<div class="stage" style="min-height: 96px; display: flex; align-items: center; justify-content: center; gap: 10px">
<button class="gb s-md v-outline t-primary suf is-hover" type="button"><span class="lbl">Следующий шаг</span><svg class="nudge" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></button>
</div>
<p class="body">Стрелка уходит на 3 px вперёд и пружинит обратно: кнопка ведёт дальше.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; align-items: baseline; justify-content: space-between"><h3 class="h3">Шеврон знает о меню</h3><span class="code">aria-expanded</span></div>
<div class="stage" style="min-height: 96px; display: flex; align-items: center; justify-content: center; gap: 10px">
<button class="gb s-md v-secondary t-neutral suf" type="button" aria-haspopup="menu" aria-expanded="false"><span class="lbl">Экспорт</span><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>
<button class="gb s-md v-secondary t-neutral suf is-active" type="button" aria-haspopup="menu" aria-expanded="true"><span class="lbl">Экспорт</span><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>
</div>
<p class="body">Открытое меню переворачивает шеврон — состояние берётся из атрибута, а не из пропа.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; align-items: baseline; justify-content: space-between"><h3 class="h3">Клавиша и счётчик</h3><span class="code">GrKbd · GrBadge</span></div>
<div class="stage" style="min-height: 96px; display: flex; align-items: center; justify-content: center; gap: 10px">
<button class="gb s-md v-secondary t-neutral pre suf" type="button" aria-keyshortcuts="Meta+K"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg><span class="lbl">Найти</span><span class="kbd">⌘K</span></button>
<button class="gb s-md v-primary t-primary suf" type="button"><span class="lbl">Отправить</span><span class="cnt">12</span></button>
</div>
<p class="body">Клавиша — тиснёная плашка с нижней кромкой, как настоящая клавиша.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; align-items: baseline; justify-content: space-between"><h3 class="h3">Только иконка</h3><span class="code">square + ariaLabel</span></div>
<div class="stage" style="min-height: 96px; display: flex; align-items: flex-end; justify-content: center; gap: 6px; padding-bottom: 18px">
<span class="anchor"><button class="gb s-md sq v-ghost-border t-neutral is-hover" type="button" aria-label="Копировать"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="14" height="14" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg></button><span class="tip" role="tooltip">Копировать</span></span>
<button class="gb s-md sq v-ghost-border t-neutral" type="button" aria-label="Переименовать"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg></button>
<button class="gb s-md sq v-ghost-border t-danger" type="button" aria-label="Удалить"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg></button>
</div>
<p class="body">Подложка всплывает из центра — квадратная кнопка не мигает прямоугольником.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; align-items: baseline; justify-content: space-between"><h3 class="h3">Ширина</h3><span class="code">block · многоточие</span></div>
<div class="stage" style="min-height: 96px; display: flex; align-items: center; justify-content: center; gap: 16px; padding: 12px 16px">
<div style="width: 150px; display: flex; flex-direction: column; gap: 6px">
<button class="gb s-sm v-primary t-primary block" type="button">Войти</button>
<button class="gb s-sm v-secondary t-neutral block" type="button">Создать аккаунт</button>
</div>
<div style="width: 150px"><button class="gb s-sm v-secondary t-neutral" type="button" title="Экспортировать отчёт за третий квартал" style="width: 100%"><span class="lbl">Экспортировать отчёт за третий квартал</span></button></div>
</div>
<p class="body">block тянется на ширину, длинная подпись режется многоточием.</p>
</div>

</div>
</section>

<section style="display: flex; flex-direction: column; gap: 16px">
<h2 class="h2">Группы</h2>
<div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px">

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 14px">
<h3 class="h3">Склеенный ряд</h3>
<div class="stage" style="min-height: 110px; display: flex; align-items: center; justify-content: center">
<div class="grp" role="group" aria-label="Навигация по датам">
<button class="gb s-sm sq v-outline t-neutral" type="button" aria-label="Назад"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"></path></svg></button>
<button class="gb s-sm v-outline t-neutral" type="button">Сегодня</button>
<button class="gb s-sm sq v-outline t-neutral" type="button" aria-label="Вперёд"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg></button>
</div>
</div>
<p class="body">Внутри группы подъёма нет — ряд держится единым блоком.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 14px">
<h3 class="h3">Сплит-кнопка</h3>
<div class="stage" style="min-height: 110px; display: flex; align-items: center; justify-content: center">
<div class="grp" role="group" aria-label="Публикация">
<button class="gb s-sm v-primary t-primary" type="button">Опубликовать</button>
<button class="gb s-sm sq v-primary t-primary" type="button" aria-label="Другие варианты" aria-haspopup="menu" aria-expanded="false"><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>
</div>
</div>
<p class="body">Светлый шов 1 px разводит звенья: шеврон не читается частью подписи.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 14px">
<h3 class="h3">Тулбар</h3>
<div class="stage" style="min-height: 110px; display: flex; align-items: center; justify-content: center">
<div role="toolbar" aria-label="Форматирование" style="display: flex; align-items: center; gap: 2px; padding: 4px; background: var(--card); border-radius: 12px; box-shadow: 0 0 0 1px rgba(15, 23, 42, .08), 0 6px 16px -8px rgba(15, 23, 42, .2)">
<button class="gb s-sm sq v-ghost t-neutral" type="button" aria-label="Полужирный"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"></path></svg></button>
<button class="gb s-sm sq v-ghost t-neutral is-hover" type="button" aria-label="Курсив"><svg viewBox="0 0 24 24" aria-hidden="true"><line x1="19" x2="10" y1="4" y2="4"></line><line x1="14" x2="5" y1="20" y2="20"></line><line x1="15" x2="9" y1="4" y2="20"></line></svg></button>
<button class="gb s-sm sq v-ghost t-neutral" type="button" aria-label="Подчёркнутый"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4v6a6 6 0 0 0 12 0V4"></path><line x1="4" x2="20" y1="20" y2="20"></line></svg></button>
<span aria-hidden="true" style="width: 1px; height: 18px; margin: 0 4px; background: var(--brd)"></span>
<button class="gb s-sm sq v-ghost t-neutral" type="button" aria-label="Ссылка"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg></button>
</div>
</div>
<p class="body">Плавающая панель с ghost-кнопками: подложки всплывают по одной.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 14px">
<h3 class="h3">Вертикальная</h3>
<div class="stage" style="min-height: 110px; display: flex; align-items: center; justify-content: center; padding: 12px">
<div class="grp vert" role="group" aria-label="Действия с файлом" style="width: 190px">
<button class="gb s-sm v-outline t-neutral pre" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m17 8-5-5-5 5"></path><path d="M12 3v12"></path></svg><span class="lbl">Новая версия</span></button>
<button class="gb s-sm v-outline t-neutral pre" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="14" height="14" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg><span class="lbl">Дублировать</span></button>
<button class="gb s-sm v-outline t-danger pre" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg><span class="lbl">Удалить</span></button>
</div>
</div>
<p class="body">Подпись прижата к началу, звенья одной ширины.</p>
</div>

</div>
</section>

</div>
</template>
