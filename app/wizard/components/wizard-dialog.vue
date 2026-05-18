<script setup lang="ts">
import { computed, onMounted, type Component } from 'vue'
import { DialogClose, DialogRoot } from 'radix-vue'
import { X } from 'lucide-vue-next'
import { DialogContent, DialogTitle } from '@/components/ui/dialog'
import { StepperItem, type StepperItemState } from '@/components/ui/stepper'
import { useWizard } from '../composables/useWizard'
import type { WizardStepDef } from '~~/shared/wizard/types'

interface Props {
  open: boolean
  steps: WizardStepDef[]
  stepRegistry: Record<string, Component>
  fallbackTitle?: string
}
const props = defineProps<Props>()
defineEmits<{ 'update:open': [value: boolean] }>()

const wizard = useWizard(props.steps)
onMounted(() => { wizard.initWizard() })

// maps currentStepId → registered step SFC
const StepComponent = computed<Component | null>(() => {
  const id = wizard.currentStep.value?.id
  return id ? (props.stepRegistry[id] ?? null) : null
})

function stepState(id: string): StepperItemState {
  if (id === wizard.currentStep.value?.id) return 'current'
  if (wizard.visitedStepIds.value.includes(id)) return 'visited'
  return 'upcoming'
}
</script>

<template>
  <DialogRoot :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="wizard-dialog flex max-h-[85vh] w-[95vw] max-w-[1200px] flex-col gap-0 overflow-hidden p-0 sm:max-w-[1200px]">
      <!-- Header -->
      <div class="wizard-dialog-header flex shrink-0 items-center justify-between gap-4 border-b px-6 py-4">
        <DialogTitle class="wizard-dialog-title">{{ wizard.currentStep.value?.title ?? fallbackTitle }}</DialogTitle>
        <DialogClose class="wizard-dialog-close">
          <X />
          <span class="sr-only">Close</span>
        </DialogClose>
      </div>

      <!-- Shell body: sidebar + step area. Remount on close so the wizard restarts cleanly. -->
      <section v-if="open" class="flex min-h-0 flex-1 flex-col">
        <!-- Content row -->
        <div class="flex min-h-0 flex-1 items-stretch">
          <aside class="wizard-dialog-sidebar w-48 shrink-0 border-r p-4">
            <ol class="space-y-1 text-sm">
              <li v-for="(step, idx) in wizard.allSteps.value" :key="step.id">
                <StepperItem :state="stepState(step.id)" :index="idx + 1" :disabled="wizard.isSubmitting.value" @click="wizard.goto(step.id)">
                  {{ step.title ?? step.id }}
                </StepperItem>
              </li>
            </ol>
          </aside>

          <div class="wizard-dialog-main min-h-0 min-w-0 flex-1 overflow-y-auto p-6">
            <header v-if="wizard.currentStep.value?.description" class="mb-4">
              <p class="text-sm text-muted-foreground">{{ wizard.currentStep.value.description }}</p>
            </header>

            <div v-if="wizard.isComplete.value && wizard.finalPayload.value" class="rounded-lg border bg-card p-6">
              <slot name="done" :payload="wizard.finalPayload.value" :wizard="wizard" />
            </div>

            <div v-else-if="wizard.isComplete.value" class="rounded-lg border bg-card p-6">
              <slot name="review" :wizard="wizard" />
            </div>

            <div v-else-if="StepComponent" :key="wizard.currentStep.value?.id">
              <Suspense>
                <template #default>
                  <component :is="StepComponent" :initial-values="wizard.currentStepValues.value" :server-errors="wizard.errors.value" :is-submitting="wizard.isSubmitting.value" @submit="wizard.submitCurrentStep" @back="wizard.back" />
                </template>
                <template #fallback>
                  <div class="text-sm text-muted-foreground">Preparing your application…</div>
                </template>
              </Suspense>
            </div>

            <div v-else class="text-sm text-muted-foreground">Preparing your application…</div>
          </div>
        </div>

        <!-- Footer portal: steps teleport their buttons here, spanning full dialog width -->
        <div id="wizard-footer-portal" class="wizard-dialog-footer shrink-0 border-t" />
      </section>
    </DialogContent>
  </DialogRoot>
</template>

<style scoped lang="scss" src="./wizard-dialog.scss"></style>
<style scoped lang="scss" src="./wizard-dialog.theme-mars.scss"></style>
<style scoped lang="scss" src="./wizard-dialog.theme-dark.scss"></style>