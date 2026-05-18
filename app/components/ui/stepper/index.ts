import { cva, type VariantProps } from 'class-variance-authority'

export { default as StepperItem } from './StepperItem.vue'

export const stepperItemVariants = cva(
  'block w-full rounded px-2 py-1 text-left transition-colors disabled:cursor-default',
  {
    variants: {
      state: {
        current: 'bg-primary text-color-strong font-medium',
        visited: 'cursor-pointer text-foreground hover:bg-muted',
        upcoming: 'text-muted-foreground opacity-60',
      },
    },
    defaultVariants: { state: 'upcoming' },
  },
)

export type StepperItemVariants = VariantProps<typeof stepperItemVariants>
export type StepperItemState = NonNullable<StepperItemVariants['state']>
