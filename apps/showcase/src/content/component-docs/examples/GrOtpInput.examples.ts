import type { ShowcaseComponentExampleDoc } from '../types'

export const grOtpInputExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'otp-input-basic',
    title: 'Code from an SMS, verified on completion',
    description: 'Кнопки «Отправить» нет: `complete` наступает сам на последнем символе. Вставка «123-456» отсеивает лишнее — это главный сценарий, и он не должен требовать чистить строку руками.',
    status: 'ready',
    previewKey: 'gr-otp-input-basic',
  },
  {
    id: 'otp-input-sizes',
    title: 'Size scale beside the form fields',
    description: 'Сторона ячейки повторяет высоту `GrInput` на той же ступени: код стоит в форме рядом с полями и обязан садиться с ними в одну линию.',
    status: 'ready',
    previewKey: 'gr-otp-input-sizes',
  },
  {
    id: 'otp-input-cell-slot',
    title: 'Custom cell rendering',
    description: 'Слот `cell` меняет оформление, не трогая поведение: размер, рамку и каретку по-прежнему держит компонент.',
    status: 'ready',
    previewKey: 'gr-otp-input-cell-slot',
  },
]
