import { defineComponent, h, Transition } from 'vue'

const Dialog = defineComponent({
  name: 'Dialog',
  props: {
    open: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:open'],
  setup(props, { emit, slots }) {
    const close = () => {
      emit('update:open', false)
    }

    return () =>
      props.open
        ? h(
            'div',
            {
              class: 'fixed inset-0 z-50 bg-black bg-opacity-50',
              onClick: close,
            },
            h(
              'div',
              {
                class: 'fixed inset-0 flex items-center justify-center p-4',
                onClick: (e) => e.stopPropagation(),
              },
              h(
                Transition,
                {
                  enterActiveClass: 'duration-200 ease-out',
                  enterFromClass: 'opacity-0 scale-95',
                  enterToClass: 'opacity-100 scale-100',
                  leaveActiveClass: 'duration-200 ease-in',
                  leaveFromClass: 'opacity-100 scale-100',
                  leaveToClass: 'opacity-0 scale-95',
                },
                () =>
                  h(
                    'div',
                    {
                      class: 'w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-6 shadow-xl',
                    },
                    slots.default?.()
                  )
              )
            )
          )
        : null
  },
})

const DialogContent = defineComponent({
  name: 'DialogContent',
  setup(_, { slots, attrs }) {
    return () =>
      h(
        'div',
        {
          class: 'relative w-full bg-white',
          ...attrs,
        },
        slots.default?.()
      )
  },
})

const DialogHeader = defineComponent({
  name: 'DialogHeader',
  setup(_, { slots }) {
    return () =>
      h(
        'div',
        {
          class: 'flex flex-col space-y-1.5 text-center sm:text-left',
        },
        slots.default?.()
      )
  },
})

const DialogTitle = defineComponent({
  name: 'DialogTitle',
  setup(_, { slots }) {
    return () =>
      h(
        'h2',
        {
          class: 'text-lg font-semibold leading-none tracking-tight',
        },
        slots.default?.()
      )
  },
})

const DialogDescription = defineComponent({
  name: 'DialogDescription',
  setup(_, { slots }) {
    return () =>
      h(
        'p',
        {
          class: 'text-sm text-muted-foreground',
        },
        slots.default?.()
      )
  },
})

const DialogFooter = defineComponent({
  name: 'DialogFooter',
  setup(_, { slots }) {
    return () =>
      h(
        'div',
        {
          class: 'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
        },
        slots.default?.()
      )
  },
})

const DialogTrigger = defineComponent({
  name: 'DialogTrigger',
  props: {
    asChild: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    return () =>
      props.asChild
        ? slots.default?.()
        : h(
            'button',
            {
              type: 'button',
            },
            slots.default?.()
          )
  },
})

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
}