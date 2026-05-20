import { computed, ref, shallowRef } from 'vue'
import { findNextStep, findStepById } from '~~/shared/wizard/engine'
import type { FinalizeResponse, StepValidationResponse, WizardFieldErrors, WizardHistoryEntry, WizardStepDef, WizardStepMeta } from '~~/shared/wizard/types'

function toStepMeta(step: WizardStepDef | null): WizardStepMeta | null {
  if (!step) return null
  return { id: step.id, title: step.title, description: step.description }
}

/**
 * Client-owned wizard orchestration.
 *
 * State (history, current step, accumulated values) lives entirely on the client. The
 * server is a pure validator with two endpoints:
 *   - POST /api/wizard/validate-step  → per-step server validation on "Next"
 *   - POST /api/wizard/finalize       → replay + validate full history on launch
 *
 * Navigation (Back / Goto / Next-after-validate) never hits the network: it just
 * reshapes the local history array and currentStepId. The shared step graph
 * (`steps` param) is the same array the server uses, so engine results stay in sync.
 */
export function useWizard(steps: WizardStepDef[]) {
  const submitStepHistory = ref<WizardHistoryEntry[]>([])
  const currentStepId = ref<string | null>(null)
  const errors = ref<WizardFieldErrors | undefined>(undefined)
  const isSubmitting = ref(false)
  const isComplete = ref(false)
  const finalPayload = ref<Record<string, unknown> | null>(null)

  /** Values derived from submission history: stepId → validated values. */
  const submittedValues = computed<Record<string, unknown>>(() => {
    const out: Record<string, unknown> = {}
    for (const h of submitStepHistory.value) out[h.stepId] = h.values
    return out
  })

  const currentStep = computed<WizardStepMeta | null>(() => {
    const id = currentStepId.value
    if (!id) return null
    return toStepMeta(findStepById(steps, id)?.step ?? null)
  })

  /** Pre-fill for the current step (in case user navigated back to a previously filled step). */
  const currentStepValues = computed<Record<string, unknown>>(() => {
    const id = currentStepId.value
    if (!id) return {}
    return (submittedValues.value[id] as Record<string, unknown>) ?? {}
  })

  /**
   * Every step that is currently applicable given the recorded state, in order.
   * `when` predicates are evaluated against the *current* derived state, so dynamic
   * branches will appear/disappear as the user fills earlier steps. Used by the
   * sidebar to render the full outline up-front (visited ones become clickable,
   * the current is highlighted, and future ones are disabled).
   */
  const allSteps = computed<WizardStepMeta[]>(() => {
    const out: WizardStepMeta[] = []
    for (const step of steps) {
      if (!step.when || step.when(submittedValues.value)) {
        out.push(toStepMeta(step)!)
      }
    }
    return out
  })

  /** Just the visited step ids (for "is this clickable / has user been here" checks). */
  const visitedStepIds = computed<string[]>(() => submitStepHistory.value.map((h) => h.stepId))

  function initWizard() {
    submitStepHistory.value = []
    errors.value = undefined
    isComplete.value = false
    finalPayload.value = null
    const first = findNextStep(steps, {}, 0)
    currentStepId.value = first?.step.id ?? null
  }

  async function submitCurrentStep(stepValues: Record<string, unknown>) {
    const id = currentStepId.value
    if (!id) return { ok: false as const }
    isSubmitting.value = true
    errors.value = undefined
    try {
      const res = await $fetch<StepValidationResponse>('/api/wizard/validate-step', {
        method: 'POST',
        body: { stepId: id, values: stepValues },
        // 422 responses are returned, not thrown — we still want to read errors.
        ignoreResponseError: true,
      })
      if (!res.ok) {
        errors.value = res.errors
        return { ok: false as const, fieldErrors: res.errors }
      }
      // Record/replace history entry for this step. If the user came back and re-submitted,
      // truncate everything after — downstream branches may now differ.
      const existingIndex = submitStepHistory.value.findIndex((h) => h.stepId === id)
      const entry: WizardHistoryEntry = { stepId: id, values: res.data }
      if (existingIndex >= 0) {
        submitStepHistory.value = [...submitStepHistory.value.slice(0, existingIndex), entry]
      } else {
        submitStepHistory.value = [...submitStepHistory.value, entry]
      }
      // Advance via the engine using the current submitted values.
      const nextSearchIndex = findStepById(steps, id)!.index + 1
      const next = findNextStep(steps, submittedValues.value, nextSearchIndex)
      currentStepId.value = next?.step.id ?? null
      if (!next) isComplete.value = true
      return { ok: true as const }
    } finally {
      isSubmitting.value = false
    }
  }

  function back() {
    // If we are on the review/complete screen, drop back into the last filled step.
    if (isComplete.value) {
      isComplete.value = false
      const last = submitStepHistory.value[submitStepHistory.value.length - 1]
      if (last) currentStepId.value = last.stepId
      errors.value = undefined
      return
    }
    // Otherwise: move to the previous step in the recorded history WITHOUT removing
    // its entry — that way navigation preserves previously entered values for prefill.
    // History only gets truncated when the user actually re-submits (see `submitCurrentStep`).
    const id = currentStepId.value
    if (!id) return
    const idx = submitStepHistory.value.findIndex((h) => h.stepId === id)
    if (idx > 0) {
      currentStepId.value = submitStepHistory.value[idx - 1]!.stepId
    } else if (idx === -1 && submitStepHistory.value.length > 0) {
      // Currently on a step that hasn't been submitted yet — jump to the last filled one.
      currentStepId.value = submitStepHistory.value[submitStepHistory.value.length - 1]!.stepId
    }
    errors.value = undefined
  }

  function goto(stepId: string) {
    if (stepId === currentStepId.value) return
    // Only previously visited steps are jumpable.
    if (!submitStepHistory.value.some((h) => h.stepId === stepId)) return
    // Just move the pointer; keep history (and therefore prefill values) intact.
    // Re-submitting on this step (or any later one) will truncate downstream entries
    // via `submit`'s existing-index logic.
    currentStepId.value = stepId
    errors.value = undefined
    isComplete.value = false
  }

  async function finalize() {
    isSubmitting.value = true
    try {
      const res = await $fetch<FinalizeResponse>('/api/wizard/finalize', {
        method: 'POST',
        body: { history: submitStepHistory.value },
        ignoreResponseError: true,
      })
      if (!res.ok) {
        // Surface the failure: jump to the offending step if the server identified one.
        if (res.stepId) {
          const idx = submitStepHistory.value.findIndex((h) => h.stepId === res.stepId)
          if (idx >= 0) {
            submitStepHistory.value = submitStepHistory.value.slice(0, idx)
            currentStepId.value = res.stepId
            isComplete.value = false
          }
        }
        errors.value = res.errors
        return { ok: false as const, reason: res.reason }
      }
      finalPayload.value = res.payload
      isComplete.value = true
      return { ok: true as const }
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    // state
    currentStep,
    currentStepValues,
    errors,
    visitedStepIds,
    allSteps,
    isComplete,
    isSubmitting,
    finalPayload,
    // actions
    initWizard,
    submitCurrentStep,
    back,
    goto,
    finalize,
  }
}
