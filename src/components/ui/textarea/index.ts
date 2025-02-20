import { type VariantProps, cva } from 'class-variance-authority'
import { computed, defineComponent, h } from 'vue'

const textareaVariants = cva(
  'flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: '',
        error: 'border-red-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const Textarea = defineComponent({
  name: 'Textarea',
  props: {
    variant: {
      type: String,
      default: 'default',
    },
    modelValue: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit }) {
    const classes = computed(() => {
      return textareaVariants({ variant: props.variant as VariantProps<typeof textareaVariants>['variant'] })
    })

    return () =>
      h('textarea', {
        class: classes.value,
        value: props.modelValue,
        onInput: (e: Event) => {
          emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
        },
        ...attrs,
      })
  },
})

export { Textarea, textareaVariants }