<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart, PieChart, GaugeChart } from 'echarts/charts'
import { 
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// Register necessary ECharts components
use([
  CanvasRenderer,
  BarChart,
  PieChart,
  GaugeChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent
])

interface KeywordData {
  keyword: string
  mentions?: number
  sentiment?: number
}

interface GaugeData {
  value: number
  max: number
}

interface Props {
  messageId: string | number
  data: KeywordData[] | GaugeData[]
  type: 'bar_chart' | 'pie_chart' | 'gauge_chart'
  config?: {
    xAxis?: string
    yAxis?: string
    title?: string
    min?: number
    max?: number
  }
}

const props = defineProps<Props>()
console.log('KeywordChart received props:', {
  messageId: props.messageId,
  data: props.data,
  type: props.type,
  config: props.config
})
const emit = defineEmits(['loaded'])

const chartInstance = ref<any>(null)

const getBarChartOptions = () => {
  console.log('getBarChartOptions called with data:', props.data);
  
  const isSentimentComparison = props.config?.title?.includes('Sentiment Distribution') && !props.config?.title?.includes('Negative Sentiment Distribution')
  const isForumDistribution = props.config?.title?.includes('mentions for my brand') || props.config?.title?.includes('Negative Sentiment Distribution by Platform')
  
  console.log('Chart type flags:', {
    isSentimentComparison,
    isForumDistribution
  });
  
  return {
    grid: {
      left: '5%',
      right: '4%',
      bottom: '10%',
      top: '8%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const data = params[0]
        if (isForumDistribution) {
          return `${data.name}<br/>${data.value} mentions`
        }
        if (isSentimentComparison) {
          const item = (props.data as KeywordData[]).find(d => d.keyword === data.name)
          return `${data.name}<br/>` +
                 `Sentiment: ${data.value.toFixed(2)}<br/>` +
                 `Mentions: ${item?.mentions || 0}`
        }
        return `${data.name}: ${data.value} mentions`
      }
    },
    xAxis: {
      type: 'category',
      data: (props.data as KeywordData[]).map(item => item.keyword),
      name: props.config?.xAxis || '',
      axisLabel: {
        interval: 0,
        rotate: isForumDistribution ? 45 : 30,
        fontSize: 11,
        margin: 15,
        hideOverlap: false,
        formatter: (value: string) => value.replace(/\s+/g, ' ').trim()
      },
      axisTick: {
        alignWithLabel: true,
        show: true
      }
    },
    yAxis: {
      type: 'value',
      name: props.config?.yAxis || 'Number of Mentions',
      nameLocation: 'middle',
      nameGap: 40,
      min: 0,
      splitLine: {
        lineStyle: {
          color: '#f3f4f6'
        }
      }
    },
    series: [
      {
        type: 'bar',
        data: (() => {
          const seriesData = (props.data as KeywordData[]).map(item => {
            if (isSentimentComparison) {
              return item.sentiment || 0;
            }
            return item.mentions;
          });
          return seriesData;
        })(),
        itemStyle: {
          color: (params: any) => {
            if (isForumDistribution) {
              return '#3b82f6' // Consistent blue color for forum distribution
            }
            if (isSentimentComparison) {
              // Color gradient based on sentiment value
              const value = params.data
              if (value >= 0.7) return '#34d399' // High sentiment
              if (value >= 0.5) return '#86efac' // Medium-high sentiment
              if (value >= 0.3) return '#fbbf24' // Medium-low sentiment
              return '#f87171' // Low sentiment
            }
            if (props.config?.title?.includes('Negative Sentiment')) {
              return '#f87171' // Red color for negative sentiment
            }
            return '#86efac' // Default color for non-sentiment data
          }
        },
        barWidth: isForumDistribution ? '50%' : '40%',
        label: {
          show: props.config?.title?.includes('mentions for my brand'),
          position: 'top',
          formatter: '{c}',
          fontSize: 12
        },
        emphasis: {
          itemStyle: {
            color: '#60a5fa'
          }
        }
      }
    ]
  }
}

const getPieChartOptions = () => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      type: 'pie',
      radius: '70%',
      data: (props.data as KeywordData[]).map(item => ({
        name: item.keyword,
        value: item.mentions
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
})

const getGaugeChartOptions = () => {
  const gaugeData = props.data[0] as GaugeData
  const value = gaugeData.value
  const max = gaugeData.max
  const percentage = value / max

  return {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: props.config?.min || 0,
        max: props.config?.max || 100,
        splitNumber: 10,
        radius: '100%',
        axisLine: {
          roundCap: true,
          lineStyle: {
            width: 30,
            color: [
              [percentage, {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  {
                    offset: 0,
                    color: '#f87171'
                  },
                  {
                    offset: 0.3,
                    color: '#fbbf24'
                  },
                  {
                    offset: 0.7,
                    color: '#86efac'
                  },
                  {
                    offset: 1,
                    color: '#34d399'
                  }
                ]
              }],
              [1, '#e5e7eb']
            ]
          }
        },
        pointer: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          show: true,
          distance: 15,
          color: '#6b7280',
          fontSize: 16,
          formatter: function(value: number) {
            if (value === gaugeData.max) return `${gaugeData.max}`;
            if (value === 0) return '0';
            return '';
          }
        },
        title: {
          show: true,
          offsetCenter: [0, '30%'],
          fontSize: 16,
          color: '#374151',
          formatter: props.config?.title || 'Score'
        },
        detail: {
          show: true,
          offsetCenter: [0, '0%'],
          fontSize: 36,
          fontWeight: 'bold',
          color: '#374151',
          formatter: function(value: number) {
            return Math.round(value);
          }
        },
        data: [{
          value: gaugeData.value,
          name: props.config?.title || 'Score'
        }]
      }
    ]
  }
}

const chartHandlers = {
  bar_chart: getBarChartOptions,
  pie_chart: getPieChartOptions,
  gauge_chart: getGaugeChartOptions
}

// Watch for changes in props that should trigger a chart update
watch(
  () => [props.data, props.type, props.config],
  () => {
    if (chartInstance.value?.chart) {
      chartInstance.value.chart.clear()
      chartInstance.value.chart.setOption(chartHandlers[props.type]())
    }
  },
  { deep: true }
)

onMounted(() => {
  emit('loaded')
})

onBeforeUnmount(() => {
  if (chartInstance.value?.chart) {
    chartInstance.value.chart.dispose()
    chartInstance.value = null
  }
})

const handleChartInit = (chart: any) => {
  chartInstance.value = chart
}
</script>

<template>
  <div class="relative w-full h-full">
    <VChart 
      @init="handleChartInit"
      :option="chartHandlers[type]()"
      :key="`${messageId}-${type}-${JSON.stringify(data)}-${JSON.stringify(config)}`"
      autoresize
      class="h-full w-full"
    />
  </div>
</template>
