<template>
<div class="gr-light doc" style="width: 1280px; min-height: 1700px; padding: 64px 72px; display: flex; flex-direction: column; gap: 32px">

<header style="display: flex; flex-direction: column; gap: 12px">
<span class="eyebrow">Размеры, содержимое, группы</span>
<h2 class="title" style="font-size: 34px">Мягкие углы, тонкий штрих, тихие плашки</h2>
<p class="lead">Высоты — общая шкала контролов. Радиус растёт вместе с кнопкой: 6 / 8 / 8 / 10px. Иконки — тонкий линейный штрих 1.5px, клавиши и счётчики — плашки без рамки.</p>
</header>

<div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px">
<div style="display: flex; flex-direction: column; gap: 10px">
<span class="cap"><b style="color: var(--fg); font-weight: 500">xs</b> · 28 · 12/16 · радиус 6</span>
<div class="paper" style="min-height: 200px; padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: space-between">
<button class="gb s-xs v-primary t-neutral" type="button">Сохранить</button>
<button class="gb s-xs v-secondary t-neutral" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg><span class="lbl">Добавить</span></button>
<div style="display: flex; gap: 4px"><button class="gb s-xs sq v-ghost t-neutral" type="button" aria-label="Копировать"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="13" height="13" rx="2"></rect><path d="M4 16V6a2 2 0 0 1 2-2h10"></path></svg></button><button class="gb s-xs sq v-ghost t-neutral is-hover" type="button" aria-label="Ещё"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle></svg></button></div>
</div>
</div>
<div style="display: flex; flex-direction: column; gap: 10px">
<span class="cap"><b style="color: var(--fg); font-weight: 500">sm</b> · 32 · 14/20 · радиус 8</span>
<div class="paper" style="min-height: 200px; padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: space-between">
<button class="gb s-sm v-primary t-neutral" type="button">Сохранить</button>
<button class="gb s-sm v-secondary t-neutral" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg><span class="lbl">Добавить</span></button>
<div style="display: flex; gap: 4px"><button class="gb s-sm sq v-ghost t-neutral" type="button" aria-label="Копировать"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="13" height="13" rx="2"></rect><path d="M4 16V6a2 2 0 0 1 2-2h10"></path></svg></button><button class="gb s-sm sq v-ghost t-neutral is-hover" type="button" aria-label="Ещё"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle></svg></button></div>
</div>
</div>
<div style="display: flex; flex-direction: column; gap: 10px">
<span class="cap"><b style="color: var(--fg); font-weight: 500">md</b> · 40 · 14/20 · радиус 8</span>
<div class="paper" style="min-height: 200px; padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: space-between">
<button class="gb s-md v-primary t-neutral" type="button">Сохранить</button>
<button class="gb s-md v-secondary t-neutral" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg><span class="lbl">Добавить</span></button>
<div style="display: flex; gap: 4px"><button class="gb s-md sq v-ghost t-neutral" type="button" aria-label="Копировать"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="13" height="13" rx="2"></rect><path d="M4 16V6a2 2 0 0 1 2-2h10"></path></svg></button><button class="gb s-md sq v-ghost t-neutral is-hover" type="button" aria-label="Ещё"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle></svg></button></div>
</div>
</div>
<div style="display: flex; flex-direction: column; gap: 10px">
<span class="cap"><b style="color: var(--fg); font-weight: 500">lg</b> · 44 · 16/24 · радиус 10</span>
<div class="paper" style="min-height: 200px; padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: space-between">
<button class="gb s-lg v-primary t-neutral" type="button">Сохранить</button>
<button class="gb s-lg v-secondary t-neutral" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg><span class="lbl">Добавить</span></button>
<div style="display: flex; gap: 4px"><button class="gb s-lg sq v-ghost t-neutral" type="button" aria-label="Копировать"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="13" height="13" rx="2"></rect><path d="M4 16V6a2 2 0 0 1 2-2h10"></path></svg></button><button class="gb s-lg sq v-ghost t-neutral is-hover" type="button" aria-label="Ещё"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle></svg></button></div>
</div>
</div>
</div>

<section style="display: flex; flex-direction: column; gap: 14px">
<h2 class="heading">Содержимое</h2>
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px">

<div class="card" style="padding: 20px; display: flex; flex-direction: column; gap: 12px">
<h3 class="h3">Иконка слева</h3>
<div class="paper" style="min-height: 100px; display: flex; align-items: center; justify-content: center; gap: 8px">
<button class="gb s-md v-primary t-neutral" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg><span class="lbl">Новый отчёт</span></button>
<button class="gb s-md v-secondary t-neutral" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m7 10 5 5 5-5"></path><path d="M12 15V3"></path></svg><span class="lbl">Скачать</span></button>
</div>
<p class="body">Тонкий штрих не спорит с подписью: иконка уточняет глагол, а не громче его.</p>
</div>

<div class="card" style="padding: 20px; display: flex; flex-direction: column; gap: 12px">
<h3 class="h3">Клавиша и счётчик</h3>
<div class="paper" style="min-height: 100px; display: flex; align-items: center; justify-content: center; gap: 8px">
<button class="gb s-md v-secondary t-neutral" type="button"><span class="lbl">Найти</span><span class="kbd">⌘K</span></button>
<button class="gb s-md v-primary t-neutral" type="button"><span class="lbl">Отправить</span><span class="cnt">3</span></button>
</div>
<p class="body">Плашка — оттенок бумаги или 16 % цвета подписи на заливке. Ни рамки, ни моноширинного шрифта: тише некуда.</p>
</div>

<div class="card" style="padding: 20px; display: flex; flex-direction: column; gap: 12px">
<h3 class="h3">Меню</h3>
<div class="paper" style="min-height: 100px; display: flex; align-items: center; justify-content: center; gap: 8px">
<button class="gb s-md v-ghost t-neutral" type="button" aria-haspopup="menu" aria-expanded="false"><span class="lbl">Экспорт</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>
<button class="gb s-md v-ghost t-neutral is-active" type="button" aria-haspopup="menu" aria-expanded="true"><span class="lbl">Модель</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>
</div>
<p class="body">Выбор из списка — прозрачная кнопка с тонким шевроном. Открытое меню держит кнопку в оттенке нажатия.</p>
</div>

<div class="card" style="padding: 20px; display: flex; flex-direction: column; gap: 12px">
<h3 class="h3">Только иконка</h3>
<div class="paper" style="min-height: 100px; padding-bottom: 18px; display: flex; align-items: flex-end; justify-content: center; gap: 2px">
<span class="anchor"><button class="gb s-md sq v-ghost t-neutral is-hover" type="button" aria-label="Копировать"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="13" height="13" rx="2"></rect><path d="M4 16V6a2 2 0 0 1 2-2h10"></path></svg></button><span class="tip" role="tooltip">Копировать</span></span>
<button class="gb s-md sq v-ghost t-neutral" type="button" aria-label="Повторить"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path><path d="M3 21v-5h5"></path></svg></button>
<button class="gb s-md sq v-ghost t-neutral" type="button" aria-label="Нравится"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10v11"></path><path d="M15 5.9 14 10h5.8a2 2 0 0 1 2 2.4l-1.4 7A2 2 0 0 1 18.4 21H7V10l4-8a3 3 0 0 1 4 3.9z"></path></svg></button>
</div>
<p class="body">Ряд прозрачных квадратов — до наведения только иконки. Имя — в <span class="code">ariaLabel</span>, подсказка тёмная на бумаге.</p>
</div>

<div class="card" style="padding: 20px; display: flex; flex-direction: column; gap: 12px">
<h3 class="h3">Ссылка наружу</h3>
<div class="paper" style="min-height: 100px; display: flex; align-items: center; justify-content: center; gap: 8px">
<a class="gb s-md v-outline t-neutral" href="https://granularity.tech/docs" target="_blank" rel="noopener noreferrer"><span class="lbl">Документация</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7"></path><path d="M8 7h9v9"></path></svg></a>
</div>
<p class="body">Тонкая стрелка ↗ — новая вкладка. Подсказка для скринридера та же, что у <span class="code">GrLink</span>.</p>
</div>

<div class="card" style="padding: 20px; display: flex; flex-direction: column; gap: 12px">
<h3 class="h3">Ширина</h3>
<div class="paper" style="min-height: 100px; padding: 12px; display: flex; align-items: center; justify-content: center; gap: 14px">
<div style="width: 150px; display: flex; flex-direction: column; gap: 6px">
<button class="gb s-sm v-primary t-neutral block" type="button">Войти</button>
<button class="gb s-sm v-secondary t-neutral block" type="button">Создать аккаунт</button>
</div>
<div style="width: 150px"><button class="gb s-sm v-secondary t-neutral" type="button" title="Экспортировать отчёт за третий квартал" style="width: 100%"><span class="lbl">Экспортировать отчёт за третий квартал</span></button></div>
</div>
<p class="body">block — на всю колонку, длинная подпись режется многоточием.</p>
</div>

</div>
</section>

<section style="display: flex; flex-direction: column; gap: 14px">
<h2 class="heading">Группы — лоток вместо склейки</h2>
<div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px">

<div class="card" style="padding: 20px; display: flex; flex-direction: column; gap: 12px">
<h3 class="h3">Ряд в лотке</h3>
<div class="paper" style="min-height: 96px; display: flex; align-items: center; justify-content: center">
<div class="grp" role="group" aria-label="Навигация по датам">
<button class="gb s-sm sq v-ghost t-neutral" type="button" aria-label="Назад"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"></path></svg></button>
<button class="gb s-sm v-ghost t-neutral is-hover" type="button">Сегодня</button>
<button class="gb s-sm sq v-ghost t-neutral" type="button" aria-label="Вперёд"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg></button>
</div>
</div>
<p class="body">Звенья не склеены рамками — они лежат в общем лотке цвета бумаги с зазором 2px.</p>
</div>

<div class="card" style="padding: 20px; display: flex; flex-direction: column; gap: 12px">
<h3 class="h3">Выбранное звено</h3>
<div class="paper" style="min-height: 96px; display: flex; align-items: center; justify-content: center">
<div class="grp" role="group" aria-label="Вид">
<button class="gb s-sm v-ghost t-neutral is-on" type="button" aria-pressed="true">Текст</button>
<button class="gb s-sm v-ghost t-neutral" type="button" aria-pressed="false">Код</button>
<button class="gb s-sm v-ghost t-neutral" type="button" aria-pressed="false">Таблица</button>
</div>
</div>
<p class="body">Нажатое звено — белый лист с тонкой рамкой поверх лотка. Для выбора вида в пакете есть <span class="code">GrSegmented</span>; здесь — его же почерк.</p>
</div>

<div class="card" style="padding: 20px; display: flex; flex-direction: column; gap: 12px">
<h3 class="h3">Сплит-кнопка</h3>
<div class="paper" style="min-height: 96px; display: flex; align-items: center; justify-content: center">
<div style="display: inline-flex; gap: 2px">
<button class="gb s-sm v-primary t-neutral" type="button" style="border-start-end-radius: 3px; border-end-end-radius: 3px">Опубликовать</button>
<button class="gb s-sm sq v-primary t-neutral" type="button" aria-label="Другие варианты" aria-haspopup="menu" aria-expanded="false" style="border-start-start-radius: 3px; border-end-start-radius: 3px"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>
</div>
</div>
<p class="body">Две графитовые половины с зазором 2px и внутренним радиусом 3px — шов виден, а форма читается одной кнопкой.</p>
</div>

<div class="card" style="padding: 20px; display: flex; flex-direction: column; gap: 12px">
<h3 class="h3">Вертикальная</h3>
<div class="paper" style="min-height: 96px; padding: 12px; display: flex; align-items: center; justify-content: center">
<div class="grp vert" role="group" aria-label="Действия с файлом" style="width: 190px">
<button class="gb s-sm v-ghost t-neutral" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m17 8-5-5-5 5"></path><path d="M12 3v12"></path></svg><span class="lbl">Новая версия</span></button>
<button class="gb s-sm v-ghost t-neutral is-hover" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="13" height="13" rx="2"></rect><path d="M4 16V6a2 2 0 0 1 2-2h10"></path></svg><span class="lbl">Дублировать</span></button>
<button class="gb s-sm v-ghost t-danger" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg><span class="lbl">Удалить</span></button>
</div>
</div>
<p class="body">Вертикальный лоток — меню действий без меню.</p>
</div>

</div>
</section>

</div>
</template>
