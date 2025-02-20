/// <reference types="vite/client" />

// Declare Vue component modules
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Declare image modules
declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

// Environment variables
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_CLAUDE_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
