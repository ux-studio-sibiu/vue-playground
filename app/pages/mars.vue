<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { marsSteps } from '../../shared/wizard/steps/mars'
import WizardShell from '~/wizard/components/WizardShell.vue'
import { marsStepRegistry } from '~/wizard/steps/mars/registry'

definePageMeta({ layout: 'blank' })

const open = ref(false)
</script>

<template>
  <main class="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6">
    <h1 class="text-center text-3xl font-bold tracking-tight">Mars Relocation Program — 2026</h1>
    <p class="max-w-md text-center text-sm text-muted-foreground">Apply for a one-way ticket to humanity's red and dusty future. Applications close when Earth does.</p>
    <Button size="lg" @click="open = true">Begin application</Button>

    <Dialog v-model:open="open">
      <DialogContent class="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Mars Relocation Application</DialogTitle>
          <DialogDescription>Complete all required steps. There is no return flight.</DialogDescription>
        </DialogHeader>
        <!-- Remount the shell each time the dialog opens so the wizard restarts cleanly -->
        <WizardShell v-if="open" :steps="marsSteps" :step-registry="marsStepRegistry" :total-steps-hint="7" />
      </DialogContent>
    </Dialog>
  </main>
</template>
