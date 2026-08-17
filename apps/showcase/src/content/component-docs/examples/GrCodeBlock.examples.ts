import type { ShowcaseComponentExampleDoc } from '../types'

export const grCodeBlockExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'code-block-basic',
    title: 'Raw service response',
    description: 'Ответ приходит `unknown`, сериализуется с отступом и подсвечивается по четырём ролям. Номера строк — CSS-счётчик: как текста их в разметке нет, и в буфер они не попадают.',
    status: 'ready',
    previewKey: 'gr-code-block-basic',
    note: 'Кнопка копирования кладёт в буфер исходный текст, а не отрисованный. Без защищённого контекста она не рисуется вовсе: молча не работающая кнопка хуже её отсутствия.',
  },
  {
    id: 'code-block-resilience',
    title: 'Anything the database can hold',
    description: 'Циклическая ссылка, `BigInt`, готовая строка и `null`. Компонент показывает данные из БД, и уронить страницу он права не имеет — каждый случай разобран отдельно.',
    status: 'ready',
    previewKey: 'gr-code-block-resilience',
  },
]
