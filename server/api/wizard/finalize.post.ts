import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { replayAndValidate } from '~~/shared/wizard/engine'
import { marsSteps } from '~~/shared/wizard/steps/mars'
import type { FinalizeResponse, WizardHistoryEntry } from '~~/shared/wizard/types'

/**
 * Whole-application replay + validation.
 *
 * Client posts the full history (the ordered list of {stepId, values} the user filled).
 * Server re-runs the step graph from scratch with `when` predicates and re-parses each
 * step's values against its Zod schema. This is the anti-tamper boundary: even though
 * navigation is purely client-side, no one can finalize with a doctored history because
 * the graph & schemas live on the server and are the final authority.
 */
export default defineEventHandler(async (event): Promise<FinalizeResponse> => {
  const body = await readBody<{ history?: WizardHistoryEntry[] }>(event)
  const history = Array.isArray(body?.history) ? body!.history : []

  // Light shape guard before handing to the engine.
  for (const h of history) {
    if (!h || typeof h.stepId !== 'string' || typeof h.values !== 'object' || h.values === null) {
      setResponseStatus(event, 400)
      return { ok: false, reason: 'malformed-history' }
    }
  }

  const result = replayAndValidate(marsSteps, history)
  if (!result.ok) {
    setResponseStatus(event, 422)
    return {
      ok: false,
      reason: result.reason,
      stepId: result.stepId,
      errors: result.fieldErrors,
    }
  }

  // In a real app, here is where you would persist the application, dispatch jobs, etc.
  return {
    ok: true,
    submittedAt: Date.now(),
    payload: result.state,
  }
})
