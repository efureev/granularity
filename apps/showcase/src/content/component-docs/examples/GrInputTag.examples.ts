import type { ShowcaseComponentExampleDoc } from '../types'

export const grInputTagExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'input-tag-addons',
    title: 'Addons around the chips',
    description: 'Слоты `prefix` и `suffix` в оболочке: иконка слева, счётчик набора справа — чипы остаются на своём месте.',
    status: 'ready',
    previewKey: 'gr-input-tag-addons',
  },
  {
    id: 'input-tag-validation',
    title: 'Проверка тега перед добавлением',
    description: 'Асинхронный `beforeAdd` со спиннером, событие `reject` для объяснения отказа и `clearable` для сброса набора.',
    status: 'ready',
    previewKey: 'gr-input-tag-validation',
  },
  {
    id: 'input-tag-basic-flow',
    title: 'Basic tag entry with live summary',
    description: 'Базовый live-demo фиксирует основной UX: ввод, `Enter`/separator commit и отражение списка тегов на стороне хоста.',
    status: 'ready',
    previewKey: 'gr-input-tag-basic-flow',
  },
  {
    id: 'input-tag-max-state',
    title: 'Controlled limit with semantic state',
    description: 'Отдельно документируем сценарий с `max`: компонент удобно использовать для curated lists и constrained profile metadata.',
    status: 'ready',
    previewKey: 'gr-input-tag-max-state',
  },
  {
    id: 'input-tag-custom-slot',
    title: 'Custom tag slot for semantic badges',
    description: 'Через slot `tag` витрина показывает, как host-screen может переоформить tag-pill и добавить собственные маркеры статуса.',
    status: 'ready',
    previewKey: 'gr-input-tag-custom-slot',
  },
  {
    id: 'input-tag-editable',
    title: 'Правка тега на месте',
    description: '`editable` открывает правку двойным кликом по тегу или `F2` с клавиатуры: `Enter` сохраняет, `Escape` отменяет, уход фокуса сохраняет. До этого опечатка в длинном теге стоила полного перенабора.',
    status: 'ready',
    previewKey: 'gr-input-tag-editable',
    note: '`F2`, а не `Enter`: цель roving-кольца — настоящая кнопка снятия, и `Enter` на ней уже означает «удалить». Пустое значение по `Enter` снимает тег, а по уходу фокуса — нет: удаление обязано остаться явным действием.',
  },
]
