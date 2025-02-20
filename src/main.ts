import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/index.css'

// Import Sentry
import * as Sentry from "@sentry/vue"

// Import ECharts
import ECharts from 'vue-echarts'
import { use } from 'echarts/core'
import {
  CanvasRenderer
} from 'echarts/renderers'
import {
  LineChart,
  BarChart,
  PieChart,
  TreemapChart,
  ScatterChart
} from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent,
  ToolboxComponent,
  DatasetComponent,
  TransformComponent,
  VisualMapComponent,
  MarkPointComponent,
  MarkLineComponent
} from 'echarts/components'

// Register ECharts components
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  TreemapChart,
  ScatterChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent,
  ToolboxComponent,
  DatasetComponent,
  TransformComponent,
  VisualMapComponent,
  MarkPointComponent,
  MarkLineComponent
])

// Clear service worker caches except OneSignal
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      // Skip OneSignal service workers
      if (!registration.scope.includes('OneSignal')) {
        registration.unregister()
      }
    }
  })
  caches.keys().then(function(names) {
    for (let name of names) {
      // Skip OneSignal caches
      if (!name.includes('OneSignal')) {
        caches.delete(name)
      }
    }
  })
}

// Create app
const app = createApp(App)
const pinia = createPinia()

// Initialize Sentry
try {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
    integrations: [
      Sentry.vueIntegration({ app }),
    ],
    // Set tracesSampleRate to 1.0 for development, lower for production
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
    // Only enable Sentry if DSN is provided
    enabled: !!import.meta.env.VITE_SENTRY_DSN,
    // Ignore 402 Payment Required errors since we handle them with a dialog
    ignoreErrors: [
      'Request failed with status code 402'
    ],
  });
} catch (error) {
  console.warn('Sentry initialization failed:', error);
  // Application continues to run normally
}

// Register v-chart component globally
app.component('v-chart', ECharts)

app.use(pinia)
app.use(router)

app.mount('#app')
