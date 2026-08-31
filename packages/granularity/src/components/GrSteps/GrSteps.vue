<script setup lang="ts">
import type { Component } from 'vue'
import { computed, watchEffect } from 'vue'

import IconCheck from '~icons/lucide/check'

import { useGranularityTranslations } from '../../internal/granularityI18n'
import { useGrComponentProp, useGrComponentSize } from '../GrConfigProvider/context'
import GrProgressBar from '../GrProgressBar/GrProgressBar.vue'

import type { GrStepsOrientation, GrStepsSize, GrStepsVariant } from './grStepsStyles'
import {
  grStepsLabelClass,
  grStepsMarkerClass,
  stepsCompactBarClass,
  stepsCompactCounterClass,
  stepsCompactLabelClass,
  stepsCompactRowClass,
  stepsConnectorClass,
  stepsConnectorDoneClass,
  stepsConnectorPendingClass,
  stepsDescriptionClass,
  stepsItemClass,
  stepsItemConnectedClass,
  stepsListClass,
  stepsRootClass,
  stepsSizeClassBySize,
  stepsTriggerClass,
  stepsTriggerClassByOrientation,
  stepsTriggerEnabledClass,
} from './grStepsStyles'
import type { GrStep, GrStepStatus } from './stepsModel'
import {
  canEnterStep,
  nextEnterableIndex,
  previousEnterableIndex,
  stepIndexOf,
  stepStatusAt,
} from './stepsModel'

/**
 * Индикатор шагов многошагового мастера.
 *
 * По семантике это **навигация**, а не составной виджет выбора: `<nav>` со
 * списком, где пройденный шаг — кнопка со своей остановкой `Tab`, текущий —
 * `aria-current="step"`, будущий — вне таб-порядка. Той же формы держатся
 * `GrBreadcrumbs` и `GrBottomNav`; `role="tab"` здесь неприменим — tablist без
 * `tabpanel` это сломанный паттерн, а панель шага никакой роли не несёт.
 *
 * Контент шага компонент не рисует: его ставит потребитель обычным `v-if`.
 */
export interface GrStepsProps {
  modelValue: string
  steps: GrStep[]
  orientation?: GrStepsOrientation
  size?: GrStepsSize
  /** Компактный вид для узкой колонки: подпись текущего шага и полоса прогресса. */
  variant?: GrStepsVariant
  /**
   * Вперёд — не дальше первого непройденного. Назад свободно всегда: вернуться
   * и поправить заполненное — обычный сценарий, а не обход правила.
   */
  linear?: boolean
  /** Переход кликом по шагу. Выключен — лента становится только индикатором. */
  clickable?: boolean
  ariaLabel?: string
  /**
   * Гейт перехода. Вернул `false` — перехода нет.
   *
   * Сюда потребитель кладёт валидацию шага: `GrSteps` про `GrForm` ничего не
   * знает и знать не должен, а форма уже отдаёт `validate()`/`validateField()`.
   */
  beforeLeave?: (from: string, to: string) => boolean | Promise<boolean>
}

export interface GrStepsEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}

const props = withDefaults(defineProps<GrStepsProps>(), {
  // Дефолты живут в резолверах ниже: Vue подставил бы свой раньше, чем
  // компонент заглянет в `GrConfigProvider`.
  orientation: undefined,
  size: undefined,
  variant: undefined,
  linear: undefined,
  clickable: undefined,
  ariaLabel: undefined,
  beforeLeave: undefined,
})

const emit = defineEmits<GrStepsEmits>()

defineSlots<{
  /**
   * Своя разметка пункта. Корневой тег, `aria-current` и клик остаются за
   * компонентом — иначе доступность шага пришлось бы собирать заново.
   */
  step?: (props: { step: GrStep, index: number, status: GrStepStatus, enterable: boolean }) => unknown
}>()

const { t } = useGranularityTranslations()

const resolvedSize = useGrComponentSize<GrStepsSize>(() => props.size, { component: 'GrSteps' })
const resolvedOrientation = useGrComponentProp('GrSteps', 'orientation', () => props.orientation, 'horizontal')
const resolvedVariant = useGrComponentProp('GrSteps', 'variant', () => props.variant, 'steps')
const resolvedLinear = useGrComponentProp('GrSteps', 'linear', () => props.linear, true)
const resolvedClickable = useGrComponentProp('GrSteps', 'clickable', () => props.clickable, true)

const currentIndex = computed(() => stepIndexOf(props.steps, props.modelValue))
const currentStep = computed(() => props.steps[currentIndex.value])

const resolvedAriaLabel = computed(() => props.ariaLabel ?? t('gr.steps.label', 'Progress'))

function statusAt(index: number): GrStepStatus {
  return stepStatusAt(props.steps, index, currentIndex.value)
}

function isEnterable(index: number): boolean {
  if (!resolvedClickable.value)
    return false
  return canEnterStep({
    steps: props.steps,
    index,
    currentIndex: currentIndex.value,
    linear: resolvedLinear.value,
  })
}

/**
 * Пройденный шаг печатает галку вместо номера, шаг с ошибкой — восклицание.
 * Оба декоративны: смысл несёт скрытая подпись состояния рядом с меткой.
 */
function markerText(index: number): string {
  return statusAt(index) === 'error' ? '!' : String(index + 1)
}

function stateText(status: GrStepStatus): string {
  if (status === 'complete')
    return t('gr.steps.completed', 'completed')
  if (status === 'error')
    return t('gr.steps.error', 'has errors')
  return ''
}

const statusText = computed(() => t('gr.steps.status', 'Step {step} of {count}', {
  step: currentIndex.value + 1,
  count: props.steps.length,
}))

/** Полоса компактного вида: доля пройденного, а не номер шага. */
const progressValue = computed(() => {
  if (props.steps.length <= 1)
    return 100
  return Math.round((currentIndex.value / (props.steps.length - 1)) * 100)
})

function tagFor(index: number): 'button' | 'span' {
  return isEnterable(index) ? 'button' : 'span'
}

function triggerClass(index: number): string {
  const base = `${stepsTriggerClass} ${stepsTriggerClassByOrientation[resolvedOrientation.value]}`
  return isEnterable(index) ? `${base} ${stepsTriggerEnabledClass}` : base
}

/** Место под соединитель нужно только тем пунктам, за которыми ещё есть шаг. */
function itemClass(index: number): string {
  const base = stepsItemClass[resolvedOrientation.value]
  if (index >= props.steps.length - 1)
    return base
  return `${base} ${stepsItemConnectedClass[resolvedOrientation.value]}`.trim()
}

function connectorClass(index: number): string {
  const done = statusAt(index) === 'complete'
  return `${stepsConnectorClass[resolvedOrientation.value]} ${done ? stepsConnectorDoneClass : stepsConnectorPendingClass}`
}

function iconOf(step: GrStep): string | Component | undefined {
  return step.icon
}

async function goToIndex(index: number): Promise<boolean> {
  const target = props.steps[index]
  if (!target || target.value === props.modelValue)
    return false

  if (props.beforeLeave) {
    const allowed = await props.beforeLeave(props.modelValue, target.value)
    if (!allowed)
      return false
  }

  emit('update:modelValue', target.value)
  emit('change', target.value)

  return true
}

async function onStepClick(index: number): Promise<void> {
  if (!isEnterable(index))
    return
  await goToIndex(index)
}

async function next(): Promise<boolean> {
  const index = nextEnterableIndex(props.steps, currentIndex.value)
  return index === -1 ? false : goToIndex(index)
}

async function back(): Promise<boolean> {
  const index = previousEnterableIndex(props.steps, currentIndex.value)
  return index === -1 ? false : goToIndex(index)
}

async function goTo(value: string): Promise<boolean> {
  return goToIndex(stepIndexOf(props.steps, value))
}

defineExpose({
  next,
  back,
  goTo,
  isFirst: computed(() => previousEnterableIndex(props.steps, currentIndex.value) === -1),
  isLast: computed(() => nextEnterableIndex(props.steps, currentIndex.value) === -1),
})

if (__GR_DEV__) {
  watchEffect(() => {
    if (props.modelValue === undefined) {
      console.warn(
        `[granularity] GrSteps: обязательный проп \`modelValue\` не передан — получено ${String(props.modelValue)}.`,
      )
    }

    if (!Array.isArray(props.steps)) {
      console.warn(
        `[granularity] GrSteps: обязательный проп \`steps\` должен быть массивом — получено ${String(props.steps)}.`,
      )
    }
  })
}
</script>

<template>
  <nav
    data-gr-steps
    :data-orientation="resolvedOrientation"
    :class="[stepsRootClass, stepsSizeClassBySize[resolvedSize]]"
    :aria-label="resolvedAriaLabel"
  >
    <div v-if="resolvedVariant === 'compact'" data-gr-steps-compact>
      <div :class="stepsCompactRowClass">
        <span :class="stepsCompactLabelClass">{{ currentStep?.label }}</span>
        <span :class="stepsCompactCounterClass">{{ currentIndex + 1 }} / {{ steps.length }}</span>
      </div>
      <!--
        Полоса декоративна: то же самое уже сказано текстом рядом и скрытым
        живым регионом ниже, а второй `progressbar` в дереве заставил бы
        диктора читать прогресс дважды.
      -->
      <GrProgressBar
        :value="progressValue"
        :size="resolvedSize === 'lg' ? 'md' : 'sm'"
        :class="stepsCompactBarClass"
        aria-hidden="true"
      />
    </div>

    <ol v-else data-gr-steps-list :class="stepsListClass[resolvedOrientation]">
      <li
        v-for="(step, index) in steps"
        :key="step.value"
        data-gr-step
        :data-value="step.value"
        :data-status="statusAt(index)"
        :class="itemClass(index)"
      >
        <component
          :is="tagFor(index)"
          data-gr-step-trigger
          :type="tagFor(index) === 'button' ? 'button' : undefined"
          :class="triggerClass(index)"
          :aria-current="statusAt(index) === 'current' ? 'step' : undefined"
          :aria-disabled="step.disabled ? 'true' : undefined"
          @click="tagFor(index) === 'button' ? onStepClick(index) : undefined"
        >
          <slot
            name="step"
            :step="step"
            :index="index"
            :status="statusAt(index)"
            :enterable="isEnterable(index)"
          >
            <span data-gr-step-marker :class="grStepsMarkerClass(statusAt(index))" aria-hidden="true">
              <component :is="iconOf(step)" v-if="step.icon" class="h-[60%] w-[60%]" />
              <IconCheck v-else-if="statusAt(index) === 'complete'" class="h-[60%] w-[60%]" />
              <template v-else>{{ markerText(index) }}</template>
            </span>

            <span class="block min-w-0">
              <span data-gr-step-label :class="grStepsLabelClass(statusAt(index))">{{ step.label }}</span>
              <!--
                Состояние шага словом: пройденный и шаг с ошибкой иначе звучат
                одинаково — цвет маркера диктору недоступен.
              -->
              <span v-if="stateText(statusAt(index))" class="sr-only"> — {{ stateText(statusAt(index)) }}</span>
              <span v-if="step.description" data-gr-step-description :class="stepsDescriptionClass">
                {{ step.description }}
              </span>
            </span>
          </slot>
        </component>

        <span
          v-if="index < steps.length - 1"
          data-gr-step-connector
          :class="connectorClass(index)"
          aria-hidden="true"
        />
      </li>
    </ol>

    <!--
      «Шаг 2 из 5» — состояние виджета, а не событие, поэтому живёт своим
      регионом в разметке, а не уходит в общий объявитель (`docs/announcer.md`).
      Образец — компактный индикатор `GrPagination`.
    -->
    <div data-gr-steps-status role="status" class="sr-only">
{{ statusText }}
</div>
  </nav>
</template>
