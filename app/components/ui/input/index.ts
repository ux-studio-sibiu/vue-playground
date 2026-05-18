import { cva, type VariantProps } from 'class-variance-authority'

export { default as Input } from './Input.vue'

export const inputVariants = cva(
  'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive',
  {
    variants: {
      size: {
        default: 'h-10',
        sm: 'h-9 px-2 text-xs',
        lg: 'h-11 px-4',
      },
    },
    defaultVariants: { size: 'default' },
  },
)

export type InputVariants = VariantProps<typeof inputVariants>
