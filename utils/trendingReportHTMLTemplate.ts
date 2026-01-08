import { TrendingItem, TrendingPrediction } from '@/types/response/trending'

interface TrendingReportData {
    trending: TrendingItem[]
    predictions: TrendingPrediction[]
    totalPredictedSales: number
    totalPredictedRevenue: number
    selectedDate?: string
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

export const generateTrendingReportHTML = (data: TrendingReportData): string => {
    const { trending, predictions, totalPredictedSales, totalPredictedRevenue, selectedDate } = data
    const currentDate = new Date().toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
    
    // Format selected date for report
    const reportDate = selectedDate 
        ? new Date(selectedDate).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : 'Mới nhất'

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            size: A4;
            margin: 20mm 20mm 20mm 20mm;
            }

            html, body {
            background: #ffffff !important;
            }

            body {
            margin: 0 !important;
            padding: 0 !important;
            font-family: "Times New Roman", Times, serif;
            font-size: 11pt;
            line-height: 1.45;
            color: #000;
            }
        .header {
            text-align: center;
            margin-bottom: 24px;
        }

        .header h1 {
            font-size: 18pt;
            font-weight: 700;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }

        .header .date {
            font-size: 10.5pt;
            line-height: 1.5;
        }
        .section {
            margin-bottom: 24px;
        }

        .section p, .section div {
            font-family: 'Times New Roman', Times, serif !important;
            line-height: 1.3 !important;
            margin-bottom: 6px;
        }
        .section-title {
            font-size: 13pt;
            font-weight: 700;
            margin-bottom: 12px;
            padding-bottom: 4px;
            border-bottom: 2px solid #000;
        }
        table {
            width: 100%;
            border-collapse: collapse !important;
            margin-bottom: 15px;
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 10pt !important;
            border: 2px solid #000000 !important;
            background: #ffffff !important;
        }
        table.summary {
            width: 70%;
            margin-left: 0;
            border: 2px solid #000000 !important;
            background: #ffffff !important;
        }
        table.summary td {
            padding: 8px 12px !important;
            border: 1px solid #000000 !important;
            line-height: 1.3 !important;
            font-family: 'Times New Roman', Times, serif !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
        }
        table.summary td:first-child {
            font-weight: 600 !important;
            width: 65%;
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #000000 !important;
        }
        table.summary td:last-child {
            text-align: right !important;
            font-weight: 600 !important;
            color: #000000 !important;
            font-size: 10pt !important;
            background: #ffffff !important;
        }
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 10pt;
        }

        table.data-table thead {
            border-bottom: 2px solid #000;
        }

        table.data-table th,
        table.data-table td {
            border: 1px solid #000;
            padding: 6px 6px;
            vertical-align: middle;
        }

        table.data-table thead th {
            font-weight: 700;
            text-align: center;
        }

        table.data-table td {
            text-align: left;
        }

            table.data-table td.text-right {
            text-align: right;
            }
        table.data-table tbody tr {
            background: #ffffff !important;
            background-color: #ffffff !important;
        }
        table.data-table tbody tr:nth-child(even) {
            background: #ffffff !important;
            background-color: #ffffff !important;
        }
        .text-right {
            text-align: right !important;
        }
        .text-center {
            text-align: center !important;
        }
        .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #000000;
            text-align: center !important;
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 9pt !important;
            color: #000000 !important;
            line-height: 1.3 !important;
        }
        .highlight {
            font-weight: 600 !important;
            color: #000000 !important;
        }
        .page {
            background: #ffffff !important;
            min-height: 297mm;
        }
        p, div, span, td, th {
            font-family: 'Times New Roman', Times, serif !important;
        }
    </style>
</head>
<body>
  <div class="page">
        <div class="header">
            <h1>BÁO CÁO TRENDING SẢN PHẨM</h1>
            <div class="date">Thời gian báo cáo: ${reportDate}</div>
            <div class="date">Ngày xuất báo cáo: ${currentDate}</div>
        </div>

        <div class="section">
            <div class="section-title">I. TỔNG QUAN</div>
            <table class="summary">
                <tr>
                    <td>Tổng dự báo bán (sản phẩm)</td>
                    <td>${formatNumber(totalPredictedSales)}</td>
                </tr>
                <tr>
                    <td>Tổng dự báo doanh thu (VND)</td>
                    <td>${formatCurrency(totalPredictedRevenue)}</td>
                </tr>
            </table>
        </div>

        ${predictions.length > 0 ? `
        <div class="section">
            <div class="section-title">II. DỰ BÁO DOANH SỐ CHI TIẾT</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 22%;">Sản phẩm</th>
                        <th style="width: 13%;">Variant</th>
                        <th style="width: 11%;" class="text-right">Dự báo bán</th>
                        <th style="width: 11%;" class="text-right">Thực tế</th>
                        <th style="width: 11%;" class="text-right">Chênh lệch</th>
                        <th style="width: 16%;" class="text-right">Dự báo doanh thu</th>
                        <th style="width: 16%;" class="text-right">Giá bán</th>
                    </tr>
                </thead>
                <tbody>
                    ${predictions.map((pred) => {
                        const difference = pred.actual_sales !== undefined 
                            ? pred.actual_sales - pred.predicted_sales 
                            : null
                        const differenceText = difference !== null 
                            ? `${difference > 0 ? '+' : ''}${formatNumber(difference)}`
                            : '-'
                        const diffColor = difference !== null 
                            ? (difference > 0 ? '#10b981' : difference < 0 ? '#ef4444' : '#6b7280')
                            : '#9ca3af'
                        
                        return `
                    <tr>
                        <td><strong>${pred.product_name}</strong></td>
                        <td style="color: #6b7280;">${pred.variant_title || '-'}</td>
                        <td class="text-right highlight">${formatNumber(pred.predicted_sales)}</td>
                        <td class="text-right">${pred.actual_sales !== undefined ? formatNumber(pred.actual_sales) : '<span style="color: #9ca3af;">Chưa có</span>'}</td>
                        <td class="text-right" style="color: ${diffColor}; font-weight: 600;">${differenceText}</td>
                        <td class="text-right highlight">${formatCurrency(pred.predicted_revenue)}</td>
                        <td class="text-right">${formatCurrency(pred.price)}</td>
                    </tr>
                        `
                    }).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}
        
        <div class="footer">
            <p>Báo cáo được tạo tự động bởi hệ thống OCM - ${new Date().getFullYear()}</p>
        </div>
    </div>
</body>
</html>
    `

    return html
}

export const getReportFileName = (): string => {
    return `BaoCaoTrending_${new Date().toISOString().split('T')[0]}.pdf`
}

