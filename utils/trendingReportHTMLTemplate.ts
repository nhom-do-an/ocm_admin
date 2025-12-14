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

export const generateTrendingReportHTML = (data: TrendingReportData): string => {
    const { trending, predictions, totalPredictedSales, totalPredictedRevenue } = data
    const currentDate = new Date().toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            margin: 15mm 20mm;
            size: A4;
        }
        * {
            box-sizing: border-box;
        }
        html, body {
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 12pt !important;
            line-height: 1.8 !important;
            color: #000 !important;
            margin: 0 !important;
            padding: 20mm !important;
            background-color: #fff !important;
            text-align: justify;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
            margin-bottom: 30px;
            padding-top: 0;
        }
        .header h1 {
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 18pt;
            font-weight: bold;
            margin: 0 0 12px 0;
            color: #000;
            letter-spacing: 0.5px;
            line-height: 1.5;
            text-transform: uppercase;
        }
        .header .date {
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 11pt;
            color: #000;
            margin-top: 8px;
            line-height: 1.6;
        }
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        .section p, .section div {
            font-family: 'Times New Roman', Times, serif !important;
            line-height: 1.8;
            margin-bottom: 10px;
        }
        .section-title {
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 15px;
            margin-top: 10px;
            color: #000;
            padding-bottom: 8px;
            border-bottom: 1px solid #000;
            line-height: 1.6;
            text-transform: uppercase;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 11pt;
            border: 2px solid #000 !important;
        }
        table.summary {
            width: 70%;
            margin-left: 0;
            border: 2px solid #000 !important;
        }
        table.summary td {
            padding: 10px 15px;
            border: 1px solid #000 !important;
            line-height: 1.8;
            font-family: 'Times New Roman', Times, serif !important;
        }
        table.summary td:first-child {
            font-weight: bold;
            width: 65%;
            background-color: #f5f5f5;
            color: #000;
        }
        table.summary td:last-child {
            text-align: right;
            font-weight: bold;
            color: #000;
            font-size: 11pt;
        }
        table.data-table {
            width: 100%;
            border: 2px solid #000 !important;
            border-collapse: collapse;
        }
        table.data-table thead {
            background-color: #e5e5e5;
        }
        table.data-table th {
            border: 1px solid #000 !important;
            padding: 10px 8px;
            text-align: left;
            font-weight: bold;
            font-size: 11pt;
            font-family: 'Times New Roman', Times, serif !important;
            white-space: nowrap;
            line-height: 1.6;
            color: #000;
        }
        table.data-table th.text-center {
            text-align: center;
        }
        table.data-table th.text-right {
            text-align: right;
        }
        table.data-table td {
            border: 1px solid #000 !important;
            padding: 10px 8px;
            font-size: 11pt;
            font-family: 'Times New Roman', Times, serif !important;
            color: #000;
            line-height: 1.8;
            vertical-align: top;
        }
        table.data-table tbody tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .text-right {
            text-align: right !important;
        }
        .text-center {
            text-align: center !important;
        }
        .footer {
            margin-top: 40px;
            padding-top: 15px;
            border-top: 1px solid #000;
            text-align: center;
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 10pt;
            color: #000;
            line-height: 1.6;
        }
        .highlight {
            font-weight: bold;
            color: #000;
        }
        p, div, span, td, th {
            font-family: 'Times New Roman', Times, serif !important;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>BÁO CÁO TRENDING SẢN PHẨM</h1>
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
            <tr>
                <td>Số sản phẩm trending</td>
                <td>${trending.length}</td>
            </tr>
        </table>
    </div>

    ${trending.length > 0 ? `
    <div class="section">
        <div class="section-title">II. SẢN PHẨM ĐANG TRENDING</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 6%;" class="text-center">STT</th>
                    <th style="width: 38%;">Tên sản phẩm</th>
                    <th style="width: 14%;" class="text-right">Dự báo bán</th>
                    <th style="width: 16%;" class="text-right">Giá bán</th>
                    <th style="width: 13%;" class="text-right">Tăng trưởng</th>
                    <th style="width: 13%;" class="text-right">Trend Score</th>
                </tr>
            </thead>
            <tbody>
                ${trending.map((item, index) => {
                    const growthColor = item.growth_rate > 0 ? '#10b981' : item.growth_rate < 0 ? '#ef4444' : '#6b7280'
                    return `
                <tr>
                    <td class="text-center highlight">${index + 1}</td>
                    <td><strong>${item.product_name || `Sản phẩm #${item.item_id}`}</strong></td>
                    <td class="text-right highlight">${formatNumber(item.predicted_sales)}</td>
                    <td class="text-right">${item.price ? formatCurrency(item.price) : '-'}</td>
                    <td class="text-right" style="color: ${growthColor}; font-weight: 600;">${item.growth_rate > 0 ? '+' : ''}${item.growth_rate.toFixed(1)}%</td>
                    <td class="text-right highlight">${item.trend_score.toFixed(2)}</td>
                </tr>
                `
                }).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    ${predictions.length > 0 ? `
    <div class="section">
        <div class="section-title">III. DỰ BÁO DOANH SỐ CHI TIẾT</div>
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
</body>
</html>
    `

    return html
}

export const getReportFileName = (): string => {
    return `BaoCaoTrending_${new Date().toISOString().split('T')[0]}.pdf`
}

