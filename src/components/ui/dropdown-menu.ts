import { defineComponent, h, ref, Transition, provide, inject, Ref, InjectionKey } from 'vue'
import { onClickOutside } from '@vueuse/core'

interface DropdownMenuContext {
  isOpen: Ref<boolean>
  toggle: () => void
  close: () => void
}

const DropdownMenuKey = Symbol('DropdownMenu') as InjectionKey<DropdownMenuContext>

const useDropdownMenu = () => {
  const context = inject(DropdownMenuKey)
  if (!context) {
    throw new Error('useDropdownMenu must be used within DropdownMenu')
  }
  return context
}

const DropdownMenu = defineComponent({
  name: 'DropdownMenu',
  setup(_, { slots }) {
    const isOpen = ref(false)
    
    const context: DropdownMenuContext = {
      isOpen,
      toggle: () => isOpen.value = !isOpen.value,
      close: () => isOpen.value = false
    }
    
    provide(DropdownMenuKey, context)

    return () => h('div', { class: 'relative' }, slots.default?.())
  }
})

const DropdownMenuTrigger = defineComponent({
  name: 'DropdownMenuTrigger',
  setup(_, { slots }) {
    const { toggle } = useDropdownMenu()

    return () => h('div', { 
      onClick: toggle,
      class: 'cursor-pointer w-full'
    }, slots.default?.())
  }
})

const DropdownMenuContent = defineComponent({
  name: 'DropdownMenuContent',
  props: {
    align: {
      type: String,
      default: 'start'
    },
    class: {
      type: String,
      default: ''
    }
  },
  setup(props, { slots }) {
    const { isOpen, close } = useDropdownMenu()
    const contentRef = ref<HTMLElement | null>(null)

    onClickOutside(contentRef, () => {
      close()
    })

    return () => h(Transition, {
      enterActiveClass: 'transition ease-out duration-200',
      enterFromClass: 'opacity-0 translate-y-1',
      enterToClass: 'opacity-100 translate-y-0',
      leaveActiveClass: 'transition ease-in duration-150',
      leaveFromClass: 'opacity-100 translate-y-0',
      leaveToClass: 'opacity-0 translate-y-1'
    }, () => isOpen.value && h('div', {
      ref: contentRef,
      class: `absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 text-gray-950 shadow-md bottom-full mb-2 ${props.align === 'end' ? 'right-0' : 'left-0'} ${props.class}`
    }, slots.default?.()))
  }
})

const DropdownMenuItem = defineComponent({
  name: 'DropdownMenuItem',
  setup(_, { slots }) {
    const { close } = useDropdownMenu()

    return () => h('div', {
      class: 'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 hover:text-gray-900',
      onClick: () => {
        close()
      }
    }, slots.default?.())
  }
})

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
}
