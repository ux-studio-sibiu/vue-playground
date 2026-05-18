# Wizard Architecture

A reusable, content-agnostic multi-step wizard for Nuxt 4. Built around three principles:

1. **Single source of truth for the step graph** — defined once in `shared/`, consumed by both client (VeeValidate) and server (validators).
2. **Client owns navigation state** — history, current step, accumulated values live on the client. The server is a pure validator.
3. **Anti-tamper at finalize** — the server replays the full history against the step graph + Zod schemas before accepting the submission.

The Mars Relocation form under `/mars` is the reference implementation.

---

## File layout

```
shared/wizard/
  types.ts                     Transport + step types (no Vue/Nuxt imports)
  engine.ts                    Pure functions: findNextStep, findStepById, validateStep, replayAndValidate
  steps/
    mars.ts                    Mars step graph: schemas + ordered marsSteps[]

server/api/wizard/
  validate-step.post.ts        Per-step validator. Stateless.
  finalize.post.ts             Replay + validate full history. Stateless.

app/wizard/
  composables/
    useWizard.ts               Client orchestration: submission history, currentStep, breadcrumbs, submitCurrentStep/back/goto/finalize
    useStepForm.ts             VeeValidate wrapper that takes a Zod schema + reactive initialValues + serverErrors
  components/
    wizard-dialog.vue          Dialog + sidebar outline + dynamic step renderer + Back/Next buttons
  steps/
    mars/
      registry.ts              stepId → defineAsyncComponent map (code-splits each step)
      step-1-identity.vue
      step-2-blood-type.vue
      step-3-dependents.vue
      step-4-family-details.vue
      step-5-skills.vue
      step-6-escape-velocity.vue
      step-7-review.vue

app/pages/
  mars.vue                     Entry page: Button → <WizardDialog v-model:open :steps="marsSteps" :step-registry />
```

---

## Core concepts

### `WizardStepDef`

```ts
interface WizardStepDef<TSchema extends ZodTypeAny = ZodTypeAny> {
  id: string                                   // stable id, e.g. 'step-3-dependents'
  schema: TSchema                              // Zod — used on BOTH client and server
  when?: (state: WizardState) => boolean       // dynamic branching predicate
  title?: string                               // shown in sidebar + step header
  description?: string
}
```

A `WizardStepDef[]` is the entire wizard description. It lives in `shared/` so the same array is imported by:

- `server/api/wizard/validate-step.post.ts` → look up step by id, run `schema.safeParse`
- `server/api/wizard/finalize.post.ts` → replay engine
- `app/wizard/components/wizard-dialog.vue` → calls `useWizard(props.steps)` and renders the dialog chrome + step body. The wizard instance is exposed to consumers via the `#review` / `#done` slot props.

`schemas` are never serialized; they cross the runtime boundary only because the server and client both `import` the shared module.

### `WizardState`

```ts
type WizardState = Record<string, unknown>     // keyed by step.id → validated values
```

Both client and server derive state the same way: walk history in order, accumulate `state[entry.stepId] = entry.values`. `when` predicates always receive a `WizardState`, never a partial.

### History entry

```ts
interface WizardHistoryEntry {
  stepId: string
  values: Record<string, unknown>              // already-parsed by Zod
}
```

The client maintains `history: WizardHistoryEntry[]` as the source of truth for "what has the user filled". The state computed is derived from it.

---

## Engine (`shared/wizard/engine.ts`)

Three pure functions. No I/O. Used by both client and server.

- **`findNextStep(steps, state, fromIndex = 0)`** — Returns the next applicable step (skipping any whose `when` predicate returns false). Used to advance the cursor after a successful submit.
- **`findStepById(steps, id)`** — Lookup with index.
- **`validateStep(step, values)`** — Runs `step.schema.safeParse(values)`. On failure, flattens Zod issues into a `field → message` map (joining `issue.path` with `.` so `members.0.name` becomes a flat key). Returns `{ success, data | fieldErrors }`.
- **`replayAndValidate(steps, history)`** — Walks history vs. the graph from scratch. Fails if:
  - history is longer than the graph allows (`history-longer-than-graph`)
  - the i-th history entry doesn't match the i-th applicable step (`graph-mismatch` — branch tampering)
  - any entry fails its schema (`validation-failed`)
  - the graph still has required steps left (`incomplete`)

Returns `{ ok: true, state }` or `{ ok: false, reason, stepId?, fieldErrors? }`.

---

## Server (stateless)

Only two endpoints. No sessions, no cookies, no storage.

### `POST /api/wizard/validate-step`

```ts
// Request
{ stepId: string, values: unknown }

// Response — StepValidationResponse
{ ok: true, data: Record<string, unknown> }
{ ok: false, errors: WizardFieldErrors }       // HTTP 422
```

Pure per-step Zod validation. The client calls this on every "Next". It does **not** record anything; the client uses the returned `data` (post-Zod parse, so coercions like `string → number` are applied) and appends it to its own history.

### `POST /api/wizard/finalize`

```ts
// Request
{ history: WizardHistoryEntry[] }

// Response — FinalizeResponse
{ ok: true,  submittedAt: number, payload: WizardState }
{ ok: false, reason: string, stepId?, errors? }   // HTTP 422
```

The authoritative checkpoint. Even though navigation is client-driven, no one can finalize with a doctored history — the server re-runs `replayAndValidate` against the canonical step graph and schemas. If it fails with a known `stepId`, the client jumps the user back to fix it.

### Why no session?

Earlier iteration used cookie-bound sessions + persistent `useStorage('wizard')` with `currentStepId`, `history`, ownership checks, expiry, and dedicated `start` / `back` / `goto` / `[sessionId]/submit` / `[sessionId]/finalize` endpoints. Trade-offs we accepted by going stateless:

| Lost                                   | Gained                                                       |
| -------------------------------------- | ------------------------------------------------------------ |
| Cross-device / refresh-survival resume | Two endpoints. No cookie lifecycle. No storage layer.        |
| Server-side audit log of in-progress   | Zero round-trips for Back / sidebar jumps                    |
| —                                      | Simpler reasoning: server is a pure function of its inputs   |

Closing the dialog restarts the wizard (the inner `v-if="open"` remount inside `WizardDialog` enforces this), which already matched the desired UX.

If you need durability later, add a single `POST /api/wizard/checkpoint` that saves history to KV under a UUID and a `GET /api/wizard/checkpoint/:id` to hydrate. Navigation stays client-side.

---

## Client (`useWizard(steps)`)

```ts
const wizard = useWizard(marsSteps)
wizard.initWizard()
await wizard.submitCurrentStep(values) // POSTs validate-step, advances on ok
wizard.back()                          // local, no network
wizard.goto(stepId)                    // local, no network — only visited steps
await wizard.finalize()                // POSTs finalize, sets finalPayload on ok
```

### State shape

| Ref                  | Type                          | Notes                                                      |
| -------------------- | ----------------------------- | ---------------------------------------------------------- |
| `currentStep`        | `WizardStepMeta \| null`      | Derived from `currentStepId` + `steps`                     |
| `currentStepValues`  | `Record<string, unknown>`     | Prefill for the current step (looked up in history)        |
| `errors`             | `WizardFieldErrors \| undef`  | Last server validation errors                              |
| `visitedStepIds`     | `string[]`                    | Visited step ids                                           |
| `allSteps`           | `WizardStepMeta[]`            | Full applicable outline (re-evaluates `when` on state)     |
| `isComplete`         | `boolean`                     | True after the last applicable step is submitted           |
| `isSubmitting`       | `boolean`                     | Flag for disabling navigation during a network call        |
| `finalPayload`       | `Record<string, unknown> \| null` | Set on successful finalize                             |

### Navigation rules

- **submitCurrentStep(values)** — POSTs `validate-step` with the current `stepId`. On 422, surfaces field errors. On ok, appends/replaces the entry in submission history and advances `currentStepId` via `findNextStep`. **If the user re-submitted a step they had already filled, downstream history is truncated** (branches may now differ).
- **back()** — Pure pointer move. Walks backwards through submission history. Does NOT pop entries — values persist so the previous step's form prefills correctly.
- **goto(stepId)** — Pure pointer move. Only allowed for steps already submitted. Does not truncate history.
- **finalize()** — POSTs the whole history. On failure with a `stepId`, truncates history before the offending step, jumps the user there, and surfaces `errors`.

### Why navigation doesn't mutate history

Previous iteration popped the entry on Back/goto, which deleted the very values needed to rehydrate the form. The rule is now: **history is mutated only by `submitCurrentStep`** (which is the only action with new validated data). Pointer moves are read-only. Re-submitting still truncates downstream history because branch resolution may change.

---

## Step components

A step is a regular `.vue` file. Contract:

```ts
defineProps<{
  initialValues: Record<string, unknown>
  serverErrors?: WizardFieldErrors
  isSubmitting: boolean            // passed by WizardDialog; available for spinner/locking logic
}>()
defineEmits<{ submit: [values: Record<string, unknown>]; back: [] }>()
```

Inside, use `useStepForm(schema, () => props.initialValues, () => props.serverErrors)` — a VeeValidate wrapper that:

- Sets up `toTypedSchema(schema)` for instant client-side validation
- Re-initializes when `initialValues` change (so the form rehydrates when you navigate back into it)
- Calls `setErrors(serverErrors)` whenever they change (422 response surfaced under the relevant fields)

The form's root element must use `id="wizard-step-form"`.

### Step footer

Each step owns its own footer — inlined directly in the template, not abstracted into a shared component. Steps Teleport their buttons into `#wizard-footer-portal`, a `<div>` that `WizardDialog` renders below the content row. This keeps each step self-contained and trivially customizable while guaranteeing the footer:

- spans the full dialog width (including the sidebar), because the portal sits outside the sidebar+main row
- never scrolls with the form content, because the portal is a `shrink-0` sibling of the scrollable row

```vue
<!-- step N (has Back) -->
<Teleport to="#wizard-footer-portal" defer>
  <div class="flex gap-2 px-6 py-4">
    <Button variant="btn-default" @click="$emit('back')">Back</Button>
    <Button variant="btn-primary" form="wizard-step-form" type="submit">Next</Button>
  </div>
</Teleport>

<!-- step 1 (no Back) -->
<Teleport to="#wizard-footer-portal" defer>
  <div class="flex gap-2 px-6 py-4">
    <Button variant="btn-primary" form="wizard-step-form" type="submit">Next</Button>
  </div>
</Teleport>
```

`defer` (Vue 3.5+) ensures the Teleport waits until the portal div is in the DOM before mounting — both are inside the same `v-if="open"` block, so without `defer` there would be a same-tick race.

> **Convention**: don't extract the footer into a shared component unless two or more steps genuinely share a non-trivial piece of logic — copy-paste is cheaper than the wrong abstraction.

### Registry

```ts
// app/wizard/steps/mars/registry.ts
export const marsStepRegistry: Record<string, Component> = {
  'step-1-identity': defineAsyncComponent(() => import('./step-1-identity.vue')),
  ...
}
```

Each step is code-split so the page doesn't pay the cost of all 7 SFCs up-front.

---

## WizardDialog

A reusable dialog-wrapped wizard:

```vue
<WizardDialog v-model:open="open" :steps="marsSteps" :step-registry="marsStepRegistry" fallback-title="Mars Relocation Application" />
```

`WizardDialog` owns the wizard instance (`useWizard(props.steps)`), the Radix `Dialog` shell, the header (title + close icon), the sidebar outline, and the step renderer. It passes `:is-submitting` and `@back` down to each step component; steps render their own footer. The parent page only supplies the step graph + registry and the per-domain copy through slots.

Renders:

- **Sidebar** — full outline of `wizard.allSteps`. Visited = clickable (`goto`), current = highlighted, unreached = disabled.
- **Progress bar** — `visitedStepIds.length / totalStepsHint`.
- **Dynamic step component** — `<component :is="stepRegistry[currentStep.id]" />` with `:key="currentStep.id"` so each step mounts fresh.
- **Back / Next buttons** — `Back` calls `wizard.back()`; `Next` is `type="submit" form="wizard-step-form"`.
- **Review state** — when `isComplete && !finalPayload`, renders the `#review` slot (default: generic "Submit to finalize" + Back/Submit buttons). Slot prop: `wizard`.
- **Done state** — when `finalPayload` is set, renders the `#done` slot (default: dumps the payload as JSON). Slot props: `payload`, `wizard`.

Domain-specific copy (e.g. Mars's "Launch" / "Application transmitted to Mars Control") lives in the parent page via these slots — `WizardDialog` stays generic.

```vue
<WizardDialog v-model:open="open" :steps="marsSteps" :step-registry="marsStepRegistry">
  <template #review="{ wizard: w }">…custom review UI; call w.back/w.finalize…</template>
  <template #done="{ payload }">…custom confirmation UI…</template>
</WizardDialog>
```

---

## Adding a new step

1. Define a `z.object({...})` schema in the steps file.
2. Push a `WizardStepDef` into the ordered array (add `when` if conditional).
3. Create `step-N-foo.vue` matching the step component contract.
4. Register it in the registry.

No server changes needed — `validate-step` and `finalize` resolve everything by id from the shared graph.

---

## Adding a new wizard (different domain)

1. Create `shared/wizard/steps/<domain>.ts` with `<domain>Steps: WizardStepDef[]`.
2. Create `app/wizard/steps/<domain>/registry.ts` + per-step SFCs.
3. Reference both arrays from a page that mounts `<WizardDialog v-model:open :steps :step-registry />`.
4. The existing endpoints (`validate-step`, `finalize`) accept any stepId — but **change them to switch on a wizard name** if you want multiple wizards on the same server. Cheapest: take `{ wizardId, stepId, values }` and look up the right step array.

---

## Security checklist

- ✅ Zod schemas live server-side; finalize re-runs them all.
- ✅ `replayAndValidate` rejects any history that doesn't match the canonical step order/branching.
- ✅ Client `data` returned by `validate-step` is the **post-parse** value (Zod coercions applied), so type/shape on the wire matches `payload` on finalize.
- ⚠️ No rate limit on the validator endpoints — add one if exposed publicly.
- ⚠️ The full history is sent on finalize. For very large wizards, chunk or compress; for sensitive fields, never log the request body.

---

## Reference flow

```
Open dialog
  ↓
WizardDialog mounts → useWizard.initWizard()
  ↓
First applicable step rendered (step-1-identity)
  ↓
User types → Zod validates on field change (instant feedback)
  ↓
Click "Next" → POST /api/wizard/validate-step
  ├─ 422 → display field errors, stay on step
  └─ 200 → append history entry, advance currentStepId
  ↓
... repeat per step ...
  ↓
After last step → isComplete = true → "Launch" button
  ↓
Click "Launch" → POST /api/wizard/finalize { history }
  ├─ 422 → jump back to offending step, show errors
  └─ 200 → finalPayload set, render confirmation
```
