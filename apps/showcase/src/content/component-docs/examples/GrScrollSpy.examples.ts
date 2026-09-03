import type { ShowcaseComponentExampleDoc } from '../types'

export const grScrollSpyExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'scroll-spy-basic',
    title: 'Оглавление длинного текста',
    description: 'Пункт подсвечивается по мере чтения, клик ведёт к разделу. Оглавление стоит рядом с прокручиваемой областью, а не внутри неё — скроллпорт компонент находит сам, от первого раздела вверх по предкам.',
    status: 'ready',
    previewKey: 'gr-scroll-spy-basic',
  },
  {
    id: 'scroll-spy-nested',
    title: 'Два уровня вложенности',
    description: 'Уровень задаёт отступ и `aria-level`. Раздел активного подраздела не приглушается: иначе оглавление читается как сломанное — активен подпункт, а его пункт выглядит выключенным. Текущим при этом объявлен только один.',
    status: 'ready',
    previewKey: 'gr-scroll-spy-nested',
  },
  {
    id: 'scroll-spy-affix',
    title: 'Пара с липкой шапкой',
    description: '`GrAffix` держит шапку и само оглавление на виду, `GrScrollSpy` показывает в нём позицию чтения. Высота шапки задана переменной на контейнере один раз: и порог прилипания, и линия активации читают её.',
    status: 'ready',
    previewKey: 'gr-scroll-spy-affix',
  },
  {
    id: 'scroll-spy-slot',
    title: 'Своя разметка пункта',
    description: 'Слот отдаёт состояние и способ перейти, вся арифметика остаётся за компонентом. Адрес здесь не трогается: приложение с роутером обновит хеш само, из события `select`.',
    status: 'ready',
    previewKey: 'gr-scroll-spy-slot',
  },
]
