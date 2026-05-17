import type { ZodTypeAny } from 'zod'
import type { WizardFieldErrors, WizardHistoryEntry, WizardState, WizardStepDef } from './types'

/**
 * Find the next applicable step starting at `fromIndex` (inclusive).
 * Skips steps whose `when` predicate returns false.
 * Returns `null` when there are no more applicable steps (wizard complete).
 */
export function findNextStep(
  steps: WizardStepDef[],
  state: WizardState,
  fromIndex = 0,
): { step: WizardStepDef; index: number } | null {
  for (let i = fromIndex; i < steps.length; i++) {
    const step = steps[i]!
    if (!step.when || step.when(state)) {
      return { step, index: i }
    }
  }
  return null
}

export function findStepById(
  steps: WizardStepDef[],
  id: string,
): { step: WizardStepDef; index: number } | null {
  const index = steps.findIndex((s) => s.id === id)
  return index === -1 ? null : { step: steps[index]!, index }
}

export interface ValidateStepResult<TOut = unknown> {
  success: boolean
  data?: TOut
  fieldErrors?: WizardFieldErrors
}

/**
 * Run the step's Zod schema against the supplied values.
 * Returns either parsed `data` or a flat `field → message` map suitable for
 * VeeValidate's `setErrors` on the client.
 */
export function validateStep<S extends ZodTypeAny>(
  step: WizardStepDef<S>,
  values: unknown,
): ValidateStepResult {
  const result = step.schema.safeParse(values)
  if (result.success) {
    return { success: true, data: result.data }
  }
  const fieldErrors: WizardFieldErrors = {}
  for (const issue of result.error.issues) {
    const key = issue.path.length ? issue.path.join('.') : '_'
    if (!fieldErrors[key]) fieldErrors[key] = issue.message
  }
  return { success: false, fieldErrors }
}

/**
 * Replay the recorded history against the step graph from scratch:
 *  - the i-th history entry must equal the i-th applicable step (graph still matches)
 *  - each entry's values must still pass that step's schema
 *
 * Used by `finalize` as an anti-tamper check so an attacker cannot POST steps
 * out of order or with branch-skipping payloads.
 */
export function replayAndValidate(
  steps: WizardStepDef[],
  history: WizardHistoryEntry[],
): { ok: true; state: WizardState } | { ok: false; reason: string; stepId?: string; fieldErrors?: WizardFieldErrors } {
  const state: WizardState = {}
  let cursor = 0
  for (const entry of history) {
    const next = findNextStep(steps, state, cursor)
    if (!next) {
      return { ok: false, reason: 'history-longer-than-graph', stepId: entry.stepId }
    }
    if (next.step.id !== entry.stepId) {
      return { ok: false, reason: 'graph-mismatch', stepId: entry.stepId }
    }
    const validation = validateStep(next.step, entry.values)
    if (!validation.success) {
      return {
        ok: false,
        reason: 'validation-failed',
        stepId: entry.stepId,
        fieldErrors: validation.fieldErrors,
      }
    }
    state[entry.stepId] = validation.data
    cursor = next.index + 1
  }
  // Also assert no further required step is still pending.
  const trailing = findNextStep(steps, state, cursor)
  if (trailing) {
    return { ok: false, reason: 'incomplete', stepId: trailing.step.id }
  }
  return { ok: true, state }
}
