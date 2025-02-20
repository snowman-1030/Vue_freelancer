import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { 
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components'
import {
  LineChart,
  BarChart,
  TreemapChart,
  ScatterChart,
  PieChart
} from 'echarts/charts'
import VChart from 'vue-echarts'
import type { App } from 'vue'

// Register ECharts components
use([
  CanvasRenderer,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  LineChart,
  BarChart,
  TreemapChart,
  ScatterChart,
  PieChart
])

export function setupECharts(app: App) {
  app.component('v-chart', VChart)
}
