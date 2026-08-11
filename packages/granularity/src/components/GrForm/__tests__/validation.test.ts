import { describe, expect, it } from 'vitest'

import {
  createGrFormMessageResolver,
  getByPath,
  isEmpty,
  rulesForTrigger,
  rulesRequired,
  runFieldRules,
  setByPath,
  toRuleArray,
  type GrFormMessageResolver,
  type GrFormRule,
} from '../validation'

// Простой резолвер: kind + params, чтобы проверять какое правило сработало.
const resolve: GrFormMessageResolver = (kind, rule, params) =>
  rule.message ?? `${kind}:${JSON.stringify(params)}`

async function run(value: unknown, rules: GrFormRule[], model: Record<string, unknown> = {}) {
  return runFieldRules(value, rules, model, resolve)
}

describe('GrForm validation engine', () => {
  it('isEmpty: null/undefined/пустая строка/пробелы/пустой массив', () => {
    expect(isEmpty(null)).toBe(true)
    expect(isEmpty(undefined)).toBe(true)
    expect(isEmpty('')).toBe(true)
    expect(isEmpty('   ')).toBe(true)
    expect(isEmpty([])).toBe(true)
    expect(isEmpty('x')).toBe(false)
    expect(isEmpty(0)).toBe(false)
    expect(isEmpty(false)).toBe(false)
    expect(isEmpty(['a'])).toBe(false)
  })

  it('required срабатывает на пустом значении', async () => {
    expect(await run('', [{ required: true }])).toBe('required:{}')
    expect(await run('ok', [{ required: true }])).toBeUndefined()
  })

  it('пустое необязательное значение проходит остальные проверки', async () => {
    expect(await run('', [{ min: 3, type: 'email' }])).toBeUndefined()
  })

  it('min/max/len по длине строки', async () => {
    expect(await run('ab', [{ min: 3 }])).toBe('min:{"min":3}')
    expect(await run('abcd', [{ max: 3 }])).toBe('max:{"max":3}')
    expect(await run('abc', [{ len: 3 }])).toBeUndefined()
    expect(await run('ab', [{ len: 3 }])).toBe('len:{"len":3}')
  })

  it('min/max по числовому значению', async () => {
    expect(await run(5, [{ min: 10 }])).toBe('min:{"min":10}')
    expect(await run(15, [{ max: 10 }])).toBe('max:{"max":10}')
    expect(await run(7, [{ min: 5, max: 10 }])).toBeUndefined()
  })

  it('pattern и type=email', async () => {
    expect(await run('abc', [{ pattern: /^\d+$/ }])).toBe('pattern:{}')
    expect(await run('123', [{ pattern: /^\d+$/ }])).toBeUndefined()
    expect(await run('not-an-email', [{ type: 'email' }])).toBe('email:{}')
    expect(await run('a@b.co', [{ type: 'email' }])).toBeUndefined()
  })

  it('кастомный валидатор: false → дефолт, строка → её текст, true → ок', async () => {
    expect(await run('x', [{ validator: () => false }])).toBe('invalid:{}')
    expect(await run('x', [{ validator: () => false, message: 'нельзя' }])).toBe('нельзя')
    expect(await run('x', [{ validator: () => 'своя ошибка' }])).toBe('своя ошибка')
    expect(await run('x', [{ validator: () => true }])).toBeUndefined()
  })

  it('async-валидатор и доступ к model', async () => {
    const rule: GrFormRule = {
      validator: async (value, model) => (value === model.confirm ? true : 'не совпадает'),
    }
    expect(await run('a', [rule], { confirm: 'a' })).toBeUndefined()
    expect(await run('a', [rule], { confirm: 'b' })).toBe('не совпадает')
  })

  it('возвращает первую ошибку по порядку правил', async () => {
    expect(await run('', [{ required: true }, { min: 3 }])).toBe('required:{}')
  })

  it('rulesForTrigger: undefined-триггер = все; конкретный = свои + без триггера', () => {
    const rules: GrFormRule[] = [
      { required: true }, // без trigger
      { min: 3, trigger: 'blur' },
      { max: 5, trigger: 'change' },
    ]
    expect(rulesForTrigger(rules)).toHaveLength(3)
    expect(rulesForTrigger(rules, 'blur')).toHaveLength(2) // required + blur
    expect(rulesForTrigger(rules, 'change')).toHaveLength(2) // required + change
  })

  it('rulesRequired / toRuleArray', () => {
    expect(rulesRequired([{ min: 1 }])).toBe(false)
    expect(rulesRequired([{ required: true }])).toBe(true)
    expect(toRuleArray(undefined)).toEqual([])
    expect(toRuleArray({ required: true })).toHaveLength(1)
    expect(toRuleArray([{ required: true }, { min: 1 }])).toHaveLength(2)
  })

  it('getByPath / setByPath поддерживают dot-path', () => {
    const obj = { a: 1, nested: { city: 'X' } }
    expect(getByPath(obj, 'a')).toBe(1)
    expect(getByPath(obj, 'nested.city')).toBe('X')
    expect(getByPath(obj, 'nested.missing')).toBeUndefined()
    setByPath(obj, 'nested.city', 'Y')
    expect(obj.nested.city).toBe('Y')
    setByPath(obj, 'deep.new.key', 42)
    expect((obj as Record<string, any>).deep.new.key).toBe(42)
  })
})

/** Файл заданного размера: содержимое неважно, важны имя, тип и `size`. */
function makeFile(name: string, sizeBytes: number, type = ''): File {
  return new File([new Uint8Array(sizeBytes)], name, { type })
}

const MB = 1024 * 1024

describe('GrForm validation engine — файловое правило', () => {
  it('accept отбивает чужой тип и пропускает свой', async () => {
    const rule: GrFormRule = { file: { accept: 'image/*,.pdf' } }

    expect(await run(makeFile('a.exe', 10, 'application/x-msdownload'), [rule])).toContain('"code":"accept"')
    expect(await run(makeFile('a.pdf', 10, 'application/pdf'), [rule])).toBeUndefined()
    expect(await run(makeFile('a.png', 10, 'image/png'), [rule])).toBeUndefined()
  })

  it('extensions и mimeTypes — белые списки', async () => {
    expect(await run(makeFile('a.doc', 10), [{ file: { extensions: ['pdf'] } }])).toContain('"code":"extension"')
    expect(await run(makeFile('a.pdf', 10), [{ file: { extensions: ['.pdf'] } }])).toBeUndefined()

    const mime: GrFormRule = { file: { mimeTypes: ['application/pdf'] } }
    expect(await run(makeFile('a.png', 10, 'image/png'), [mime])).toContain('"code":"mimeType"')
    expect(await run(makeFile('a.pdf', 10, 'application/pdf'), [mime])).toBeUndefined()
  })

  it('maxSizeMb и maxSizeBytes ограничивают один файл', async () => {
    expect(await run(makeFile('big.pdf', 2 * MB), [{ file: { maxSizeMb: 1 } }])).toContain('"code":"maxFileSize"')
    expect(await run(makeFile('ok.pdf', 512), [{ file: { maxSizeMb: 1 } }])).toBeUndefined()

    // Заданы оба предела — применяется меньший, а не последний объявленный.
    expect(await run(makeFile('mid.pdf', 4096), [{ file: { maxSizeMb: 1, maxSizeBytes: 1024 } }]))
      .toContain('"code":"maxFileSize"')
  })

  it('maxCount и maxTotalSizeMb считают набор целиком', async () => {
    const three = [makeFile('a.pdf', 10), makeFile('b.pdf', 10), makeFile('c.pdf', 10)]

    expect(await run(three, [{ file: { maxCount: 2 } }])).toContain('"code":"maxCount"')
    expect(await run(three, [{ file: { maxCount: 3 } }])).toBeUndefined()

    const heavy = [makeFile('a.pdf', MB), makeFile('b.pdf', MB)]
    expect(await run(heavy, [{ file: { maxTotalSizeMb: 1 } }])).toContain('"code":"maxTotalSize"')
    expect(await run(heavy, [{ file: { maxTotalSizeMb: 3 } }])).toBeUndefined()
  })

  it('валидаторы потребителя работают после встроенных, в том числе async', async () => {
    const scan = async ({ files }: { files: File[] }) => {
      return files.some(f => f.name.startsWith('virus'))
        ? [{ code: 'scan', message: 'infected', fileName: files[0]?.name }]
        : []
    }

    expect(await run(makeFile('virus.pdf', 10, 'application/pdf'), [{
      file: { accept: 'application/pdf', validators: [scan] },
    }])).toContain('"code":"scan"')

    // Встроенная проверка отработала раньше и уже отбила файл — до своей очередь
    // дошла бы, но сообщение отдаёт первая проблема.
    const message = await run(makeFile('virus.exe', 10), [{
      file: { accept: 'application/pdf', validators: [scan] },
    }])
    expect(message).toContain('"code":"accept"')
  })

  it('при нескольких проблемных файлах в сообщение идёт первая', async () => {
    const message = await run(
      [makeFile('a.exe', 10), makeFile('b.exe', 10)],
      [{ file: { accept: '.pdf' } }],
    )

    expect(message).toContain('a.exe')
    expect(message).not.toContain('b.exe')
  })

  it('одиночный File и File[] проверяются одинаково', async () => {
    const rule: GrFormRule = { file: { accept: '.pdf' } }
    const single = await run(makeFile('a.exe', 10), [rule])
    const list = await run([makeFile('a.exe', 10)], [rule])

    expect(single).toBe(list)
  })

  it('не-файловое значение правило пропускает', async () => {
    // Правило описывает файлы; строку ему проверять нечем, и придумывать вердикт
    // за неё оно не должно.
    expect(await run('строка', [{ file: { accept: '.pdf' } }])).toBeUndefined()
    expect(await run([{ url: 'x' }], [{ file: { accept: '.pdf' } }])).toBeUndefined()
  })

  it('пустое значение разбирает required, а не файловое правило', async () => {
    expect(await run(null, [{ file: { accept: '.pdf' } }])).toBeUndefined()
    expect(await run([], [{ file: { accept: '.pdf' } }])).toBeUndefined()
    expect(await run(null, [{ required: true, file: { accept: '.pdf' } }])).toBe('required:{}')
  })

  it('rule.message перекрывает текст валидатора', async () => {
    expect(await run(makeFile('a.exe', 10), [{ file: { accept: '.pdf' }, message: 'Нужен PDF' }]))
      .toBe('Нужен PDF')
  })
})

describe('createGrFormMessageResolver — файловые сообщения', () => {
  const t = (key: string, fallback: string) => `${key}|${fallback}`
  const resolveMessage = createGrFormMessageResolver(t)

  it('текст берётся из ключа валидатора, а не из gr.form.file', () => {
    const issue = { code: 'accept', message: 'File "a.exe" does not match', fileName: 'a.exe' }

    // Одна и та же проблема обязана звучать одинаково в поле и в форме.
    expect(resolveMessage('file', {}, { issue })).toBe('gr.fileValidation.accept|File "a.exe" does not match')
  })

  it('вид file без issue падает на собственный ключ формы', () => {
    expect(resolveMessage('file', {}, {})).toBe('gr.form.file|Invalid file')
  })

  it('rule.message сильнее любого источника', () => {
    const issue = { code: 'accept', message: 'File "a.exe" does not match' }
    expect(resolveMessage('file', { message: 'Нужен PDF' }, { issue })).toBe('Нужен PDF')
  })
})
