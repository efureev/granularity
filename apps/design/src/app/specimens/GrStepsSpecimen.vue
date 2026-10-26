<script setup lang="ts">
import IconCreditCard from '~icons/lucide/credit-card'
import IconMapPin from '~icons/lucide/map-pin'
import IconPackage from '~icons/lucide/package'
import IconShieldCheck from '~icons/lucide/shield-check'

import { computed, ref, useTemplateRef, watch } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const previewSteps = [
  { value: 'plan', label: 'Тариф' },
  { value: 'payment', label: 'Оплата' },
  { value: 'done', label: 'Готово' },
]
const previewStep = ref('payment')

const agreed = ref(false)
const planError = ref(false)
watch(agreed, (value) => {
  if (value)
    planError.value = false
})

const wizardSteps = computed(() => [
  { value: 'plan', label: 'Тариф', ...(planError.value ? { status: 'error' as const } : {}) },
  { value: 'team', label: 'Команда' },
  { value: 'payment', label: 'Оплата' },
  { value: 'done', label: 'Готово' },
])
const wizardStep = ref('plan')
const wizardIndex = computed(() => wizardSteps.value.findIndex(step => step.value === wizardStep.value))
const wizard = useTemplateRef<{ next: () => Promise<boolean>, back: () => Promise<boolean> }>('wizard')

const wizardText: Record<string, string> = {
  team: '12 мест: участников пригласите по почте сразу после оплаты.',
  payment: 'Карта •• 4417 · 4 800 ₽ в месяц, списание 1-го числа.',
  done: 'Тариф подключён — счёт для бухгалтерии придёт на почту.',
}

// Назад пускаем всегда: правка заполненного не должна упираться в проверку.
function checkStep(from: string, to: string): boolean {
  const steps = wizardSteps.value
  if (steps.findIndex(step => step.value === to) < steps.findIndex(step => step.value === from))
    return true
  if (from === 'plan' && !agreed.value) {
    planError.value = true
    return false
  }
  return true
}

const documentSteps = [
  { value: 'data', label: 'Данные', description: 'Заполнено' },
  { value: 'docs', label: 'Документы', description: 'Не хватает паспорта', status: 'error' as const },
  { value: 'review', label: 'Проверка', description: '1–2 дня' },
]
const documentStep = ref('docs')

const tariffSteps = [
  { value: 'plan', label: 'Тариф' },
  { value: 'team', label: 'Команда' },
  { value: 'payment', label: 'Оплата' },
  { value: 'done', label: 'Готово' },
]
const compactStep = ref('team')

const domainSteps = [
  { value: 'add', label: 'Добавить домен', description: 'studio.ru' },
  { value: 'verify', label: 'Подтвердить владение', description: 'Добавьте TXT-запись у регистратора' },
  { value: 'mail', label: 'Включить почту', description: 'Займёт пару минут' },
]
const domainStep = ref('verify')

const orderSteps = [
  { value: 'cart', label: 'Состав', icon: IconPackage },
  { value: 'address', label: 'Адрес', icon: IconMapPin },
  { value: 'insurance', label: 'Страховка', icon: IconShieldCheck, disabled: true },
  { value: 'payment', label: 'Оплата', icon: IconCreditCard },
]
const orderStep = ref('address')
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrSteps v-model="previewStep" :steps="previewSteps" aria-label="Шаги оформления тарифа" />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Мастер с проверкой шага" note="вперёд — не дальше пройденного; кнопки ставит приложение, проверку — гейт перехода" wide>
      <div class="flex flex-col gap-5 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
        <GrSteps ref="wizard" v-model="wizardStep" :steps="wizardSteps" :before-leave="checkStep" linear aria-label="Шаги подключения тарифа" />
        <div class="flex min-h-[64px] flex-col justify-center gap-2">
          <template v-if="wizardStep === 'plan'">
            <GrCheckbox v-model="agreed">
              Принимаю условия тарифа «Команда»
            </GrCheckbox>
            <p v-if="planError" class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-danger-text)]">
              Без согласия с условиями дальше не пройти.
            </p>
          </template>
          <p v-else class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-base)]">
            {{ wizardText[wizardStep] }}
          </p>
        </div>
        <div class="flex justify-between gap-3">
          <GrButton variant="ghost" tone="neutral" :disabled="wizardIndex === 0" @click="wizard?.back()">
            Назад
          </GrButton>
          <GrButton :disabled="wizardIndex === wizardSteps.length - 1" @click="wizard?.next()">
            Далее
          </GrButton>
        </div>
      </div>
    </Specimen>

    <Specimen title="Шаг с ошибкой" note="ошибку ставит приложение: пройденный шаг не сошёлся, дальше не пустит">
      <GrSteps v-model="documentStep" :steps="documentSteps" aria-label="Шаги проверки документов" />
    </Specimen>

    <Specimen title="Иконки и выключенный шаг" note="значок вместо номера, малая ступень; «Страховка» недоступна и пропускается">
      <GrSteps v-model="orderStep" :steps="orderSteps" size="sm" aria-label="Шаги оформления заказа" />
    </Specimen>

    <Specimen title="Вертикально" note="с описанием шага — для боковой колонки или длинных подписей">
      <GrSteps v-model="domainStep" :steps="domainSteps" orientation="vertical" aria-label="Подключение домена" />
    </Specimen>

    <Specimen title="Компактно" note="для узкой колонки и телефона: подпись текущего шага, счётчик и полоса вместо ленты">
      <div class="max-w-[300px]">
        <GrSteps v-model="compactStep" :steps="tariffSteps" variant="compact" aria-label="Шаги тарифа, компактно" />
      </div>
    </Specimen>
  </div>
</template>
