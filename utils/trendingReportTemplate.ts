import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { TrendingItem, TrendingPrediction } from '@/types/response/trending'

interface TrendingReportData {
    trending: TrendingItem[]
    predictions: TrendingPrediction[]
    totalPredictedSales: number
    totalPredictedRevenue: number
}

const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(num))
}

const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(num)
}

// Helper to add text with proper encoding
interface TextOptions {
    maxWidth?: number;
    lineHeight?: number;
    align?: 'left' | 'center' | 'right';
}

const addText = (doc: jsPDF, text: string, x: number, y: number, options?: TextOptions) => {
    // Use splitTextToSize to handle long text
    const lines = doc.splitTextToSize(text, options?.maxWidth || 200)
    doc.text(lines, x, y, options)
    return lines.length * (options?.lineHeight || 5)
}

export const generateTrendingReportPDF = (data: TrendingReportData): jsPDF => {
    const { trending, predictions, totalPredictedSales, totalPredictedRevenue } = data
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    let yPosition = margin

    // Header line
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 5

    // Title
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    const title = 'BAO CAO TRENDING SAN PHAM'
    doc.text(title, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 8

    // Date
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    const currentDate = new Date().toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
    doc.text(`Ngay xuat bao cao: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 10

    // Summary Section - Professional table format
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('I. TONG QUAN', margin, yPosition)
    yPosition += 8

    // Summary table
    const summaryData = [
        ['Chi tieu', 'Gia tri'],
        ['Tong du bao ban (san pham)', formatNumber(totalPredictedSales)],
        ['Tong du bao doanh thu (VND)', formatCurrency(totalPredictedRevenue).replace('₫', 'VND')],
        ['So san pham trending', trending.length.toString()]
    ]

    autoTable(doc, {
        startY: yPosition,
        head: [summaryData[0]],
        body: summaryData.slice(1),
        theme: 'plain',
        headStyles: {
            fillColor: [240, 240, 240],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            lineWidth: 0.5
        },
        bodyStyles: {
            textColor: [0, 0, 0],
            lineWidth: 0.5
        },
        styles: {
            fontSize: 9,
            cellPadding: 3,
            lineColor: [0, 0, 0],
            lineWidth: 0.5
        },
        columnStyles: {
            0: { cellWidth: 100, fontStyle: 'bold' },
            1: { cellWidth: 80, halign: 'right' }
        },
        margin: { left: margin, right: margin },
        tableWidth: 'wrap'
    })

    const lastTable = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable
    if (lastTable?.finalY !== undefined) {
        yPosition = lastTable.finalY + 10
    }

    // Trending Products Section
    if (trending.length > 0) {
        // Check if we need a new page
        if (yPosition > pageHeight - 80) {
            doc.addPage()
            yPosition = margin
        }

        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('II. SAN PHAM DANG TRENDING', margin, yPosition)
        yPosition += 8

        const trendingTableData = trending.map((item, index) => [
            (index + 1).toString(),
            item.product_name || `San pham #${item.item_id}`,
            formatNumber(item.predicted_sales),
            item.price ? formatCurrency(item.price).replace('₫', 'VND') : '-',
            `${item.growth_rate > 0 ? '+' : ''}${item.growth_rate.toFixed(1)}%`,
            item.trend_score.toFixed(2)
        ])

        autoTable(doc, {
            startY: yPosition,
            head: [['STT', 'Ten san pham', 'Du bao ban', 'Gia', 'Tang truong', 'Trend Score']],
            body: trendingTableData,
            theme: 'plain',
            headStyles: {
                fillColor: [240, 240, 240],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                lineWidth: 0.5
            },
            bodyStyles: {
                textColor: [0, 0, 0],
                lineWidth: 0.5
            },
            alternateRowStyles: {
                fillColor: [250, 250, 250]
            },
            styles: {
                fontSize: 8,
                cellPadding: 2.5,
                lineColor: [0, 0, 0],
                lineWidth: 0.5
            },
            columnStyles: {
                0: { cellWidth: 12, halign: 'center' },
                1: { cellWidth: 70 },
                2: { cellWidth: 25, halign: 'right' },
                3: { cellWidth: 30, halign: 'right' },
                4: { cellWidth: 25, halign: 'right' },
                5: { cellWidth: 20, halign: 'right' }
            },
            margin: { left: margin, right: margin },
            pageBreak: 'auto'
        })

        const lastTable = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable
        if (lastTable?.finalY !== undefined) {
            yPosition = lastTable.finalY + 10
        }
    }

    // Predictions Table Section
    if (predictions.length > 0) {
        // Check if we need a new page
        if (yPosition > pageHeight - 80) {
            doc.addPage()
            yPosition = margin
        }

        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('III. DU BAO DOANH SO CHI TIET', margin, yPosition)
        yPosition += 8

        const predictionsTableData = predictions.map((pred) => {
            const difference = pred.actual_sales !== undefined
                ? pred.actual_sales - pred.predicted_sales
                : null
            const differenceText = difference !== null
                ? `${difference > 0 ? '+' : ''}${formatNumber(difference)}`
                : '-'

            return [
                pred.product_name,
                pred.variant_title || '-',
                formatNumber(pred.predicted_sales),
                pred.actual_sales !== undefined ? formatNumber(pred.actual_sales) : 'Chua co',
                differenceText,
                formatCurrency(pred.predicted_revenue).replace('₫', 'VND'),
                formatCurrency(pred.price).replace('₫', 'VND')
            ]
        })

        autoTable(doc, {
            startY: yPosition,
            head: [['San pham', 'Variant', 'Du bao ban', 'Thuc te', 'Chenh lech', 'Du bao doanh thu', 'Gia']],
            body: predictionsTableData,
            theme: 'plain',
            headStyles: {
                fillColor: [240, 240, 240],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                lineWidth: 0.5
            },
            bodyStyles: {
                textColor: [0, 0, 0],
                lineWidth: 0.5
            },
            alternateRowStyles: {
                fillColor: [250, 250, 250]
            },
            styles: {
                fontSize: 7,
                cellPadding: 2,
                lineColor: [0, 0, 0],
                lineWidth: 0.5
            },
            columnStyles: {
                0: { cellWidth: 45 },
                1: { cellWidth: 30 },
                2: { cellWidth: 20, halign: 'right' },
                3: { cellWidth: 20, halign: 'right' },
                4: { cellWidth: 20, halign: 'right' },
                5: { cellWidth: 30, halign: 'right' },
                6: { cellWidth: 25, halign: 'right' }
            },
            margin: { left: margin, right: margin },
            pageBreak: 'auto'
        })
    }

    // Footer
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(
            `Trang ${i} / ${totalPages}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        )
    }

    return doc
}

export const getReportFileName = (): string => {
    return `BaoCaoTrending_${new Date().toISOString().split('T')[0]}.pdf`
}
