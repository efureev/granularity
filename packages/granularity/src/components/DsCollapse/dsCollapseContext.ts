import type { ComputedRef, InjectionKey } from 'vue'

export type DsCollapseValue = string | number

export type DsCollapseModelValue = DsCollapseValue | DsCollapseValue[] | undefined

export type DsCollapseContext = {
  accordion: ComputedRef<boolean>
  disabled: ComputedRef<boolean>
  isActive: (name: DsCollapseValue) => boolean
  toggle: (name: DsCollapseValue) => void
}

export const DS_COLLAPSE_CONTEXT: InjectionKey<DsCollapseContext> = Symbol('DS_COLLAPSE_CONTEXT')