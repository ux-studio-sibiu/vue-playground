<script setup lang="ts">
import { computed, onMounted, type Component } from 'vue'
import { Button } from '@/components/ui/button'
import type { WizardStepDef } from '../../../shared/wizard/types'
import { useWizard } from '../composables/useWizard'

interface Props {
  /** Step graph (shared between server & client). */
  steps: WizardStepDef[]
  /** Map of stepId → async Vue component. */
  stepRegistry: Record<string, Component>
  /** Optional total-step hint for the progress indicator. */
  totalStepsHint?: number
}
const props = defineProps<Props>()

const wizard = useWizard(props.steps)

onMounted(() => {
  wizard.start()
})

const StepComponent = computed<Component | null>(() => {
  const id = wizard.currentStep.value?.id
  if (!id) return null
  return props.stepRegistry[id] ?? null
})

const progress = computed(() => {
  const done = wizard.history.value.length
  const total = props.totalStepsHint ?? Math.max(done + 1, 1)
  return Math.min(100, Math.round((done / total) * 100))
})

async function onStepSubmit(values: Record<string, unknown>) {
  await wizard.submit(values)
}

function onBack() {
  wizard.back()
}

async function onFinalize() {
  await wizard.finalize()
}

function onJump(stepId: string) {
  if (stepId === wizard.currentStep.value?.id) return
  wizard.goto(stepId)
}
</script>

<template>
  <section class="wizard-shell flex gap-6">
    <!-- Sidebar: full outline. Visited = clickable, current = highlighted, future = disabled. -->
    <aside class="w-48 shrink-0 border-r pr-4">
      <ol class="space-y-1 text-sm">
        <li v-for="(step, idx) in wizard.allSteps.value" :key="step.id">
          <button type="button" class="block w-full rounded px-2 py-1 text-left transition-colors" :class="[
            step.id === wizard.currentStep.value?.id ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted',
            wizard.history.value.includes(step.id) && step.id !== wizard.currentStep.value?.id ? 'cursor-pointer text-foreground' : '',
            !wizard.history.value.includes(step.id) && step.id !== wizard.currentStep.value?.id ? 'cursor-default text-muted-foreground opacity-60' : '',
          ]" :disabled="wizard.isSubmitting.value || !wizard.history.value.includes(step.id) || step.id === wizard.currentStep.value?.id" @click="onJump(step.id)">
            <span class="mr-2 text-xs opacity-60">{{ idx + 1 }}.</span>{{ step.title ?? step.id }}
          </button>
        </li>
      </ol>
    </aside>

    <!-- Main step area -->
    <div class="min-w-0 flex-1">
      <header class="mb-4">
        <div class="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div class="h-full bg-primary transition-all" :style="{ width: `${progress}%` }" />
        </div>
        <h2 v-if="wizard.currentStep.value?.title" class="mt-3 text-xl font-semibold">{{ wizard.currentStep.value.title }}</h2>
        <p v-if="wizard.currentStep.value?.description" class="mt-1 text-sm text-muted-foreground">{{ wizard.currentStep.value.description }}</p>
      </header>

      <div v-if="wizard.isComplete.value && wizard.finalPayload.value" class="rounded-lg border bg-card p-6">
        <h3 class="text-lg font-semibold">Application transmitted to Mars Control.</h3>
        <p class="mt-2 text-sm text-muted-foreground">Keep this confirmation for your records. There is no return flight.</p>
        <pre class="mt-4 overflow-auto rounded bg-muted p-3 text-xs">{{ JSON.stringify(wizard.finalPayload.value, null, 2) }}</pre>
      </div>

      <div v-else-if="wizard.isComplete.value" class="rounded-lg border bg-card p-6">
        <h3 class="text-lg font-semibold">Review your application</h3>
        <p class="mt-2 text-sm text-muted-foreground">All required steps completed. Submit to finalize.</p>
        <div class="mt-4 flex gap-2">
          <Button variant="outline" :disabled="wizard.isSubmitting.value" @click="onBack">Back</Button>
          <Button :disabled="wizard.isSubmitting.value" @click="onFinalize">Launch</Button>
        </div>
      </div>

      <div v-else-if="StepComponent" :key="wizard.currentStep.value?.id">
        <component :is="StepComponent" :initial-values="wizard.values.value" :server-errors="wizard.errors.value" @submit="onStepSubmit" />
        <div class="mt-6 flex gap-2">
          <Button variant="outline" :disabled="wizard.isSubmitting.value || wizard.history.value.length === 0" @click="onBack">Back</Button>
          <Button form="wizard-step-form" type="submit" :disabled="wizard.isSubmitting.value">Next</Button>
        </div>
      </div>

      <div v-else class="text-sm text-muted-foreground">Preparing your application…</div>
    </div>
  </section>
</template>
