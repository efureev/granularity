import type { PluginSetupFunction } from '@vue/devtools-kit'
import { resolveGrConfig } from '@feugene/granularity/composables/useGrComponentConfig'

import type { GrIssueLog } from '../resolve/issues'
import { propSourceState } from '../resolve/propSource'
import { missingRequiredMessage, missingRequiredProps } from '../resolve/requiredProps'

type DevtoolsApi = Parameters<PluginSetupFunction>[0]

/** Инстанс Vue в том объёме, который нужен разделу. */
interface InstanceLike {
  type?: { __name?: string, name?: string }
  props?: Record<string, unknown>
  vnode?: { props?: Record<string, unknown> | null }
  provides?: Record<string | symbol, unknown>
}

interface VisitPayload {
  componentInstance: InstanceLike
  treeNode: { tags: unknown[] }
}

interface InspectPayload {
  componentInstance: InstanceLike
  // `unknown[]`, а не свой тип записи: в этот же массив пишут другие плагины, и
  // сузить его значило бы объявить чужие записи невалидными.
  instanceData: { state: unknown[] }
}

const TAG_GRANULARITY = { label: 'Gr', textColor: 0xFFFFFF, backgroundColor: 0x7C3AED }
const TAG_MISSING_PROP = { label: 'missing prop', textColor: 0xFFFFFF, backgroundColor: 0xDC2626 }

/**
 * Имя компонента в рантайме. У SFC оно приезжает в `__name` (Vue выводит его из
 * имени файла), у объектных компонентов — в `name`.
 */
function componentName(instance: InstanceLike | undefined): string | undefined {
  return instance?.type?.__name ?? instance?.type?.name
}

/**
 * Секция «Granularity config» в штатном инспекторе компонентов.
 *
 * Ключевой момент — **что считать «переданным значением»**. Объявление пропов
 * для этого не годится: ядро приезжает потребителю production-сборкой SFC, где
 * `@vue/compiler-sfc` стирает `type` и `required`, и отличить «пользователь
 * передал» от «сработал дефолт» по нему нельзя. Зато можно по `vnode.props` —
 * это ровно то, что написал вызывающий, до подстановки дефолтов.
 */
export function registerComponentConfig(api: DevtoolsApi, log: GrIssueLog): void {
  api.on.visitComponentTree((payload: VisitPayload) => {
    const name = componentName(payload.componentInstance)
    if (!name?.startsWith('Gr'))
      return

    payload.treeNode.tags.push(TAG_GRANULARITY)

    // Обход дерева — единственный момент, когда панель видит все экземпляры
    // сразу: `inspectComponent` приходит только на выбранный пользователем.
    const missing = missingRequiredProps(name, payload.componentInstance.props)
    if (missing.length > 0) {
      payload.treeNode.tags.push(TAG_MISSING_PROP)
      log.record('error', name, missingRequiredMessage(name, missing))
    }
  })

  api.on.inspectComponent((payload: InspectPayload) => {
    const instance = payload.componentInstance
    const name = componentName(instance)
    if (!name?.startsWith('Gr'))
      return

    // Конфиг читается из `provides` самого инстанса: у Vue это цепочка
    // прототипов, поэтому здесь виден ближайший `GrConfigProvider` — тот же,
    // что увидел бы `inject` внутри компонента.
    const config = resolveGrConfig(instance)
    const componentDefaults = config.componentDefaults.value[name as never] as Record<string, unknown> | undefined

    payload.instanceData.state.push(...propSourceState(instance.props ?? {}, {
      passedProps: instance.vnode?.props,
      componentDefaults,
      providerSize: config.size.value,
    }))
  })
}
