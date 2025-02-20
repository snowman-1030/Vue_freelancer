import jsPDF from 'jspdf'
import { saveAs } from 'file-saver'
import Papa from 'papaparse'
import type { ReportResponse, TrendData, SentimentData } from '../types/reports'

export interface ChartExport {
  name: string
  dataUrl: string
  description?: string
}

interface PDFTableStyles {
  headerBgColor: number[]  // RGB values
  headerTextColor: number[]
  rowBgColor: number[]
  alternateRowBgColor: number[]
  borderColor: number[]
  textColor: number[]
}

// Brand colors following VueLeaf standards
const BRAND_COLORS = {
  primary: [34, 197, 94],    // green-600
  secondary: [17, 24, 39],   // gray-900
  neutral: [107, 114, 128],  // gray-500
  negative: [220, 38, 38],   // red-600
  background: [249, 250, 251] // gray-50
} as const

export class ExportService {
  // PDF dimensions and spacing (A4)
  private static readonly PAGE_WIDTH = 210 // mm
  private static readonly PAGE_HEIGHT = 297 // mm
  private static readonly MARGIN = 20 // mm
  private static readonly CONTENT_WIDTH = ExportService.PAGE_WIDTH - (ExportService.MARGIN * 2)

  // Font configurations
  private static readonly FONTS = {
    title: { size: 24, style: 'bold' },
    subtitle: { size: 16, style: 'normal' },
    heading: { size: 14, style: 'normal' }, // Changed from bold to normal
    body: { size: 10, style: 'normal' },
    small: { size: 8, style: 'normal' }
  } as const

  // Table styling
  private readonly tableStyles: PDFTableStyles = {
    headerBgColor: [249, 250, 251],  // gray-50
    headerTextColor: [107, 114, 128], // gray-500
    rowBgColor: [255, 255, 255],     // white
    alternateRowBgColor: [249, 250, 251], // gray-50
    borderColor: [229, 231, 235],    // gray-200
    textColor: [17, 24, 39]          // gray-900
  }

  // Helper methods for styling
  private setFont(doc: jsPDF, type: keyof typeof ExportService.FONTS): void {
    const font = ExportService.FONTS[type]
    doc.setFontSize(font.size)
    if (font.style === 'bold') {
      doc.setFont('helvetica', 'bold')
    } else {
      doc.setFont('helvetica', 'normal')
    }
  }

  private setTextColor(doc: jsPDF, color: readonly number[]): void {
    doc.setTextColor(color[0], color[1], color[2])
  }

  private setFillColor(doc: jsPDF, color: readonly number[]): void {
    doc.setFillColor(color[0], color[1], color[2])
  }

  private drawRect(doc: jsPDF, x: number, y: number, width: number, height: number, color: readonly number[]): void {
    this.setFillColor(doc, color)
    doc.rect(x, y, width, height, 'F')
  }

  private drawBadge(doc: jsPDF, text: string, x: number, y: number, type: 'positive' | 'neutral' | 'negative'): void {
    const colors = {
      positive: { bg: [220, 252, 231], text: [22, 163, 74] },  // green-100, green-600
      neutral: { bg: [243, 244, 246], text: [75, 85, 99] },    // gray-100, gray-600
      negative: { bg: [254, 226, 226], text: [220, 38, 38] }   // red-100, red-600
    }
    const color = colors[type]
    const textWidth = doc.getTextWidth(text)
    const padding = 5
    const width = textWidth + (padding * 2)
    
    // Draw badge background
    this.drawRect(doc, x, y - 6, width, 8, color.bg)
    
    // Draw badge text
    this.setTextColor(doc, color.text)
    doc.text(text, x + padding, y)
    this.setTextColor(doc, this.tableStyles.textColor)
  }

  /**
   * Generate a PDF report with charts and data
   * @param data Report data from the API
   * @param charts Map of chart names to their image data URLs
   * @param userInfo Optional user information for the report header
   * @returns Promise resolving to a Blob containing the PDF
   */
  async generatePDF(
    data: ReportResponse,
    charts: Map<string, ChartExport>,
    userInfo?: { username: string; avatar?: string }
  ): Promise<Blob> {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // Add header with branding
      await this.addHeader(doc, data, userInfo)

      // Add charts with descriptions and their corresponding tables
      let yPosition = 90 // Increased spacing to avoid overlap with Report Period box

      // Process sections with charts
      for (const [name, chart] of charts.entries()) {
        if (yPosition + 100 > ExportService.PAGE_HEIGHT - ExportService.MARGIN) {
          doc.addPage()
          yPosition = ExportService.MARGIN
        }

        await this.addChartSection(doc, chart, yPosition)
        
        // Add table for this specific chart
        this.addTableForChart(doc, data, chart.name, yPosition + 100)
        yPosition += 180 // Spacing for next chart
      }

      // Add Keyword Analysis section if data exists
      if (data.data.keywords) {
        if (yPosition + 100 > ExportService.PAGE_HEIGHT - ExportService.MARGIN) {
          doc.addPage()
          yPosition = ExportService.MARGIN
        }
        this.setFont(doc, 'heading')
        doc.text('Keyword Analysis', ExportService.MARGIN, yPosition + 10)
        this.addTableForChart(doc, data, 'Keyword Analysis', yPosition + 30)
      }

      // Add footer with page numbers
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(10)
        doc.text(
          `Page ${i} of ${pageCount} | Generated: ${new Date().toLocaleString()}`,
          ExportService.MARGIN,
          ExportService.PAGE_HEIGHT - 10
        )
      }

      return doc.output('blob')
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      throw new Error('Failed to generate PDF report')
    }
  }

  /**
   * Generate a CSV export of the report data
   * @param data Report data from the API
   * @returns CSV string
   */
  generateCSV(data: ReportResponse): string {
    try {
      const csvData = this.formatChartData(data)
      return Papa.unparse(csvData, {
        header: true,
        delimiter: ',',
        newline: '\n'
      })
    } catch (error) {
      console.error('Failed to generate CSV:', error)
      throw new Error('Failed to generate CSV report')
    }
  }

  /**
   * Format the report data for CSV export
   * @param data Report data
   * @returns Formatted data for CSV export
   */
  private formatChartData(data: ReportResponse): any[] {
    const formattedData: any[] = []

    // Add sentiment data
    if (data.data.sentimentCounts) {
      const validSentiments = data.data.sentimentCounts.filter(item =>
        item.sentiment && ['positive', 'negative', 'neutral'].includes(item.sentiment.toLowerCase())
      )

      validSentiments.forEach(item => {
        formattedData.push({
          type: 'Sentiment',
          category: item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1),
          value: item.count,
          confidence: item.confidence?.toFixed(2) ?? 'N/A'
        })
      })
    }

    // Add source data
    if (data.data.sourceCounts) {
      data.data.sourceCounts.forEach(item => {
        formattedData.push({
          type: 'Source',
          category: item.source,
          value: item.count,
          percentage: item.percentage
        })
      })
    }

    // Add trend data
    if (data.data.sentimentTrends) {
      data.data.sentimentTrends.forEach(item => {
        formattedData.push({
          type: 'Trend',
          date: item.date,
          value: item.value,
          sentiment: item.sentiment
        })
      })
    }

    // Add keyword data
    if (data.data.keywords) {
      data.data.keywords.forEach(item => {
        formattedData.push({
          type: 'Keyword',
          keyword: item.keyword,
          total: item.total,
          positive: item.positive,
          neutral: item.neutral,
          negative: item.negative
        })
      })
    }

    return formattedData
  }

  /**
   * Add header section to PDF
   * @param doc PDF document
   * @param data Report data
   * @param userInfo Optional user information
   */
  private async addHeader(doc: jsPDF, data: ReportResponse, userInfo?: { username: string; avatar?: string }): Promise<void> {
    // Add VueLeaf branding
    this.setFont(doc, 'subtitle')
    this.setTextColor(doc, BRAND_COLORS.primary)
    doc.text('VueLeaf', ExportService.MARGIN, ExportService.MARGIN)
    
    this.setFont(doc, 'small')
    this.setTextColor(doc, BRAND_COLORS.neutral)
    const tagline = 'Protecting and growing cannabis brands through intelligent review management.'
    doc.text(tagline, ExportService.MARGIN, ExportService.MARGIN + 5)

    // Add divider
    this.drawRect(
      doc,
      ExportService.MARGIN,
      ExportService.MARGIN + 10,
      ExportService.CONTENT_WIDTH,
      0.5,
      this.tableStyles.borderColor
    )

    // Add avatar and report title
    if (userInfo?.avatar) {
      try {
        await doc.addImage(
          userInfo.avatar,
          'PNG',
          ExportService.MARGIN,
          ExportService.MARGIN + 15,
          8, // width in mm
          8  // height in mm
        )
        // Add report title with username, shifted right to make room for avatar
        this.setFont(doc, 'heading')  // Use heading style for consistency
        this.setTextColor(doc, BRAND_COLORS.secondary)
        const title = `${userInfo.username}'s Analytics Report`
        doc.text(title, ExportService.MARGIN + 12, ExportService.MARGIN + 22)
      } catch (error) {
        console.error('Failed to add avatar:', error)
        // Fallback to centered title without avatar
        this.setFont(doc, 'heading')  // Use heading style for consistency
        this.setTextColor(doc, BRAND_COLORS.secondary)
        const title = `${userInfo.username}'s Analytics Report`
        doc.text(title, ExportService.MARGIN, ExportService.MARGIN + 25)
      }
    } else {
      // No avatar, center the title
      this.setFont(doc, 'heading')  // Use heading style for consistency
      this.setTextColor(doc, BRAND_COLORS.secondary)
      const title = userInfo ? `${userInfo.username}'s Analytics Report` : 'Analytics Report'
      doc.text(title, ExportService.MARGIN, ExportService.MARGIN + 25)
    }

    // Add metadata boxes
    const boxHeight = 20
    const boxSpacing = 4
    const boxY = ExportService.MARGIN + 35

    // Report Period box
    this.drawRect(
      doc,
      ExportService.MARGIN,
      boxY,
      (ExportService.CONTENT_WIDTH / 2) - boxSpacing,
      boxHeight,
      this.tableStyles.alternateRowBgColor
    )
    
    this.setFont(doc, 'small')
    this.setTextColor(doc, BRAND_COLORS.neutral)
    doc.text('Report Period', ExportService.MARGIN + 5, boxY + 5)
    
    this.setFont(doc, 'body')
    this.setTextColor(doc, BRAND_COLORS.secondary)
    const formatDate = (date: string) => {
      if (!date) return 'N/A'
      try {
        // Handle YYYY-MM-DD format from input[type="date"]
        const [year, month, day] = date.split('-').map(Number)
        const dateObj = new Date(year, month - 1, day) // month is 0-based
        if (isNaN(dateObj.getTime())) {
          return 'N/A'
        }
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      } catch (error) {
        return 'N/A'
      }
    }
    
    const period = `${formatDate(data.startDate)} to ${formatDate(data.endDate)}`
    doc.text(period, ExportService.MARGIN + 5, boxY + 12)

    // Total Records box
    this.drawRect(
      doc,
      ExportService.MARGIN + (ExportService.CONTENT_WIDTH / 2) + boxSpacing,
      boxY,
      (ExportService.CONTENT_WIDTH / 2) - boxSpacing,
      boxHeight,
      this.tableStyles.alternateRowBgColor
    )
    
    this.setFont(doc, 'small')
    this.setTextColor(doc, BRAND_COLORS.neutral)
    doc.text('Total Records', ExportService.MARGIN + (ExportService.CONTENT_WIDTH / 2) + boxSpacing + 5, boxY + 5)
    
    this.setFont(doc, 'body')
    this.setTextColor(doc, BRAND_COLORS.secondary)
    doc.text(
      (data.metadata?.totalRecords ?? 0).toLocaleString(),
      ExportService.MARGIN + (ExportService.CONTENT_WIDTH / 2) + boxSpacing + 5,
      boxY + 12
    )
  }

  /**
   * Add a chart section to the PDF
   * @param doc PDF document
   * @param chart Chart data
   * @param yPosition Vertical position to start drawing
   */
  private async addChartSection(doc: jsPDF, chart: ChartExport, yPosition: number): Promise<void> {
      // Add chart title
      doc.setFontSize(14)
      // Move everything up by 5mm (adjusted from 10mm)
      const adjustedY = yPosition - 5

      // Title with consistent font and size
      this.setFont(doc, 'heading')  // Use heading style for consistency
      doc.text(chart.name || 'Untitled Chart', ExportService.MARGIN, adjustedY)

      // Add description if available
      if (chart.description) {
          this.setFont(doc, 'body')  // Use body style for consistency
          const description = chart.description.split('\n') // Handle multi-line descriptions
          description.forEach((line, index) => {
              doc.text(line, ExportService.MARGIN, adjustedY + 4 + (index * 5))
          })
      }

      try {
          // Use maximum available width
          const contentWidth = ExportService.PAGE_WIDTH - (ExportService.MARGIN * 2)
          
          // Load image to get aspect ratio
          const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
              const img = new Image()
              img.onload = () => resolve({ width: img.width, height: img.height })
              img.onerror = reject
              img.src = chart.dataUrl
          })
          
          // Calculate height maintaining aspect ratio
          const aspectRatio = dimensions.height / dimensions.width
          const imgWidth = contentWidth
          let imgHeight = contentWidth * aspectRatio
          
          // Add 25mm to height for all charts
          imgHeight += 25
          
          await doc.addImage(
              chart.dataUrl,
              'PNG',
              ExportService.MARGIN,
              adjustedY + 10,
              imgWidth,
              imgHeight
          )

          // No page break needed here since it's handled in addTableForChart
      } catch (error) {
          console.error(`Failed to add chart image for ${chart.name}:`, error)
          doc.text('Chart image could not be loaded', ExportService.MARGIN, yPosition + 50)
      }
  }

  /**
   * Add a table for a specific chart
   * @param doc PDF document
   * @param data Report data
   * @param chartName Name of the chart
   * @param yPosition Vertical position to start drawing
   */
  private addTableForChart(doc: jsPDF, data: ReportResponse, chartName: string, yPosition: number): void {
    switch (chartName) {
      case 'Overall Sentiment':
        if (data.data.sentimentScore) {
          this.addTable(doc, 'Overall Sentiment Score', [
            ['Metric', 'Value'],
            ['Sentiment Score', data.data.sentimentScore.value.toFixed(2)],
            ['Total Reviews', data.data.sentimentScore.total.toString()]
          ], yPosition)
        }
        break;

      case 'Sentiment Distribution':
        if (Array.isArray(data.data.sentimentCounts)) {
          const validSentiments = data.data.sentimentCounts
            .filter(item => item.sentiment && ['positive', 'negative', 'neutral'].includes(item.sentiment.toLowerCase()))
            .map(item => [
              item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1),
              item.count.toString(),
              item.confidence.toFixed(2)
            ]);

          this.addTable(doc, 'Sentiment Distribution', [
            ['Sentiment', 'Count', 'Confidence'],
            ...validSentiments
          ], yPosition)
        }
        break;

      case 'Platform Sentiment':
        if (Array.isArray(data.data.platformSentiment)) {
          const platformData = new Map<string, { positive: number; negative: number; neutral: number }>();
          
          data.data.platformSentiment
            .filter(item => item.sentiment && item.source)
            .forEach(item => {
              if (!platformData.has(item.source)) {
                platformData.set(item.source, { positive: 0, negative: 0, neutral: 0 })
              }
              const counts = platformData.get(item.source)!
              counts[item.sentiment.toLowerCase() as 'positive' | 'negative' | 'neutral'] += item.count
            });

          const tableData = Array.from(platformData.entries())
            .map(([platform, counts]) => [
              platform,
              counts.positive.toString(),
              counts.neutral.toString(),
              counts.negative.toString()
            ]);

          if (tableData.length > 0) {
            this.addTable(doc, 'Platform Sentiment Analysis', [
              ['Platform', 'Positive', 'Neutral', 'Negative'],
              ...tableData
            ], yPosition)
          }
        }
        break;

      case 'Source Distribution':
      case 'Source Breakdown':
        if (Array.isArray(data.data.sourceCounts)) {
          // Calculate grand total
          const totalMentions = data.data.sourceCounts.reduce((sum, item) => sum + item.count, 0);
          
          // Create table rows
          const rows = data.data.sourceCounts.map(item => [
            item.source,
            item.count.toString(),
            `${item.percentage.toFixed(2)}%`
          ]);

          // Add period clarification
          this.setFont(doc, 'small');
          this.setTextColor(doc, BRAND_COLORS.neutral);
          doc.text(`Data shown for period: ${data.startDate} to ${data.endDate}`, ExportService.MARGIN, yPosition - 5);

          // Reset font for table
          this.setFont(doc, 'body');
          this.setTextColor(doc, this.tableStyles.textColor);

          // Add table with total row
          this.addTable(doc, 'Source Distribution', [
            ['Source', 'Count', 'Percentage'],
            ...rows,
            ['', '', ''], // Empty row for spacing
            ['Total (All Sources)', totalMentions.toString(), '100.00%']
          ], yPosition);
        }
        break;



      case 'Sentiment Trends':
        if (Array.isArray(data.data.sentimentTrends)) {
          // Group trends by date
          const trendsByDate = new Map<string, { positive: number; negative: number; neutral: number }>();
          
          // Initialize all dates with zero counts
          data.data.sentimentTrends.forEach(trend => {
            if (!trendsByDate.has(trend.date)) {
              trendsByDate.set(trend.date, { positive: 0, negative: 0, neutral: 0 });
            }
          });

          // Accumulate values by sentiment
          data.data.sentimentTrends.forEach(trend => {
            const counts = trendsByDate.get(trend.date);
            if (counts && trend.sentiment) {
              const sentiment = trend.sentiment.toLowerCase();
              if (sentiment in counts) {
                counts[sentiment as 'positive' | 'negative' | 'neutral'] += trend.value;
              }
            }
          });

          // Convert to table rows with totals
          const tableRows = Array.from(trendsByDate.entries())
            .sort((a, b) => b[0].localeCompare(a[0])) // Newest first
            .map(([date, counts]) => {
              const total = counts.positive + counts.neutral + counts.negative;
              return [
                date,
                counts.positive.toString(),
                counts.neutral.toString(),
                counts.negative.toString(),
                total.toString()
              ];
            });

          // Start table on a new page
          doc.addPage();
          const tableY = ExportService.MARGIN + 20;

          // Add period clarification
          this.setFont(doc, 'small');
          this.setTextColor(doc, BRAND_COLORS.neutral);
          doc.text(`Data shown for period: ${data.startDate} to ${data.endDate}`, ExportService.MARGIN, tableY - 5);

          // Reset font for table
          this.setFont(doc, 'body');
          this.setTextColor(doc, this.tableStyles.textColor);

          this.addTable(doc, 'Sentiment Trends', [
            ['Date', 'Positive', 'Neutral', 'Negative', 'Total'],
            ...tableRows
          ], tableY);
        }
        break;

      case 'Source Distribution Trends':
        if (Array.isArray(data.data.sourceTrends)) {
          this.addTable(doc, 'Source Distribution Trends', [
            ['Date', 'Value', 'Source'],
            ...data.data.sourceTrends.map(trend => [
              trend.date,
              trend.value.toString(),
              trend.source || 'N/A'
            ])
          ], yPosition)
        }
        break;

      case 'Keyword Analysis':
          if (Array.isArray(data.data.keywords)) {
            // Add period clarification
            this.setFont(doc, 'small');
            this.setTextColor(doc, BRAND_COLORS.neutral);
            doc.text(`Data shown for period: ${data.startDate} to ${data.endDate}`, ExportService.MARGIN, yPosition - 5);
  
            // Reset font for table
            this.setFont(doc, 'body');
            this.setTextColor(doc, this.tableStyles.textColor);
  
            const rows = data.data.keywords.map(keyword => [
              keyword.keyword,
              keyword.total.toString(),
              keyword.positive.toString(),
              keyword.neutral.toString(),
              keyword.negative.toString()
            ]);
  
            // Calculate totals
            const totals = rows.reduce((acc, [_, total, pos, neu, neg]) => ({
              total: acc.total + parseInt(total),
              positive: acc.positive + parseInt(pos),
              neutral: acc.neutral + parseInt(neu),
              negative: acc.negative + parseInt(neg)
            }), { total: 0, positive: 0, neutral: 0, negative: 0 });
  
            this.addTable(doc, 'Keyword Analysis', [
              ['Keyword', 'Total Mentions', 'Positive', 'Neutral', 'Negative'],
              ...rows,
              ['', '', '', '', ''], // Empty row for spacing
              ['Totals',
               totals.total.toString(),
               totals.positive.toString(),
               totals.neutral.toString(),
               totals.negative.toString()]
            ], yPosition);
          }
          break;
    }
  }

  private addTable(doc: jsPDF, title: string, data: string[][], yPosition: number): void {
    // Add table title
    this.setFont(doc, 'heading')
    this.setTextColor(doc, BRAND_COLORS.secondary)
    doc.text(title, ExportService.MARGIN, yPosition)

    const cellPadding = 3
    const totalWidth = ExportService.CONTENT_WIDTH
    const firstColumnWidth = totalWidth * 0.4 // 40% for first column
    const otherColumnsWidth = (totalWidth - firstColumnWidth) / (data[0].length - 1) // Remaining space split evenly
    const cellHeight = 7 // Reduced from 10 to 7

    const getColumnX = (index: number) => {
      if (index === 0) return ExportService.MARGIN
      return ExportService.MARGIN + firstColumnWidth + ((index - 1) * otherColumnsWidth)
    }

    const getColumnWidth = (index: number) => index === 0 ? firstColumnWidth : otherColumnsWidth

    // Draw table border and background
    this.drawRect(
      doc,
      ExportService.MARGIN,
      yPosition + 5,
      ExportService.CONTENT_WIDTH,
      (data.length * cellHeight) + cellPadding * 2,
      this.tableStyles.rowBgColor
    )

    data.forEach((row, rowIndex) => {
      const y = yPosition + 15 + (rowIndex * cellHeight)
      
      // Draw row background
      if (rowIndex === 0) {
        // Header row
        this.drawRect(
          doc,
          ExportService.MARGIN,
          y - cellHeight + cellPadding,
          ExportService.CONTENT_WIDTH,
          cellHeight,
          this.tableStyles.headerBgColor
        )
        this.setFont(doc, 'small')
        this.setTextColor(doc, this.tableStyles.headerTextColor)
      } else {
        // Alternating row colors
        if (rowIndex % 2 === 1) {
          this.drawRect(
            doc,
            ExportService.MARGIN,
            y - cellHeight + cellPadding,
            ExportService.CONTENT_WIDTH,
            cellHeight,
            this.tableStyles.alternateRowBgColor
          )
        }
        this.setFont(doc, 'body')
        this.setTextColor(doc, this.tableStyles.textColor)
      }

      // Draw cell content
      row.forEach((cell, cellIndex) => {
        const x = getColumnX(cellIndex)
        const width = getColumnWidth(cellIndex)
        const cellText = (cell ?? 'N/A').toString()

        // Special handling for sentiment values
        if (title.includes('Sentiment') && cellIndex > 0 && rowIndex > 0) {
          if (['Positive', 'Neutral', 'Negative'].includes(row[0])) {
            this.drawBadge(
              doc,
              cellText,
              x + cellPadding,
              y,
              row[0].toLowerCase() as 'positive' | 'neutral' | 'negative'
            )
            return
          }
        }

        // Right align numbers for all columns except first
        if (cellIndex === 0) {
          doc.text(cellText, x + cellPadding, y)
        } else {
          const textWidth = doc.getTextWidth(cellText)
          doc.text(cellText, x + width - textWidth - cellPadding, y)
        }
      })
    })

    // Draw horizontal lines between rows
    data.forEach((_, index) => {
      if (index > 0) {
        const lineY = yPosition + 15 + (index * cellHeight) - (cellHeight / 2)
        const [r, g, b] = this.tableStyles.borderColor
        doc.setDrawColor(r, g, b)
        doc.setLineWidth(0.1)
        doc.line(
          ExportService.MARGIN,
          lineY,
          ExportService.MARGIN + ExportService.CONTENT_WIDTH,
          lineY
        )
      }
    })
  }
}