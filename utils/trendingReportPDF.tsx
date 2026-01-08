import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { TrendingItem, TrendingPrediction } from '@/types/response/trending'

// Register fonts that support Vietnamese
Font.register({
    family: 'Roboto',
    fonts: [
        {
            src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
            fontWeight: 'normal'
        },
        {
            src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
            fontWeight: 'bold'
        }
    ]
})

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

const formatDate = (date?: string): string => {
    if (!date) return 'Mới nhất'
    return new Date(date).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

const getCurrentDateTime = (): string => {
    return new Date().toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// Define styles
const styles = StyleSheet.create({
    page: {
        backgroundColor: '#ffffff',
        padding: 30,
        fontFamily: 'Roboto'
    },
    header: {
        textAlign: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: '#000000'
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    subtitle: {
        fontSize: 11,
        marginTop: 5,
        color: '#000000'
    },
    section: {
        marginBottom: 20
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 1.5,
        borderBottomColor: '#000000',
        textTransform: 'uppercase'
    },
    table: {
        width: '100%',
        borderWidth: 2,
        borderColor: '#000000',
        marginBottom: 15
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
        minHeight: 25
    },
    tableHeader: {
        backgroundColor: '#ffffff',
        fontWeight: 'bold',
        borderBottomWidth: 1,
        borderBottomColor: '#000000'
    },
    tableCell: {
        padding: 8,
        fontSize: 10,
        borderRightWidth: 1,
        borderRightColor: '#000000',
        justifyContent: 'center',
        backgroundColor: '#ffffff'
    },
    tableCellLast: {
        borderRightWidth: 0
    },
    tableCellBold: {
        fontWeight: 'bold'
    },
    textRight: {
        textAlign: 'right'
    },
    textCenter: {
        textAlign: 'center'
    },
    summaryTable: {
        width: '70%',
        borderWidth: 2,
        borderColor: '#000000'
    },
    summaryRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
        minHeight: 30
    },
    summaryLabel: {
        width: '65%',
        padding: 10,
        fontWeight: 'bold',
        borderRightWidth: 1,
        borderRightColor: '#000000',
        fontSize: 10,
        justifyContent: 'center',
        backgroundColor: '#ffffff'
    },
    summaryValue: {
        width: '35%',
        padding: 10,
        textAlign: 'right',
        fontWeight: 'bold',
        fontSize: 10,
        justifyContent: 'center',
        backgroundColor: '#ffffff'
    },
    footer: {
        marginTop: 30,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#000000',
        textAlign: 'center',
        fontSize: 9
    }
})

const TrendingReportPDF: React.FC<TrendingReportData> = ({
    trending,
    predictions,
    totalPredictedSales,
    totalPredictedRevenue,
    selectedDate
}) => {
    const reportDate = formatDate(selectedDate)
    const currentDate = getCurrentDateTime()

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>BÁO CÁO TRENDING SẢN PHẨM</Text>
                    <Text style={styles.subtitle}>Thời gian báo cáo: {reportDate}</Text>
                    <Text style={styles.subtitle}>Ngày xuất báo cáo: {currentDate}</Text>
                </View>

                {/* Summary Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>I. TỔNG QUAN</Text>
                    <View style={styles.summaryTable}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tổng dự báo bán (sản phẩm)</Text>
                            <Text style={styles.summaryValue}>{formatNumber(totalPredictedSales)}</Text>
                        </View>
                        <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
                            <Text style={styles.summaryLabel}>Tổng dự báo doanh thu (VND)</Text>
                            <Text style={styles.summaryValue}>{formatCurrency(totalPredictedRevenue)}</Text>
                        </View>
                    </View>
                </View>

                {/* Predictions Table */}
                {predictions.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>II. DỰ BÁO DOANH SỐ CHI TIẾT</Text>
                        <View style={styles.table}>
                            {/* Table Header */}
                            <View style={[styles.tableRow, styles.tableHeader]}>
                                <Text style={[styles.tableCell, styles.tableCellBold, { width: '22%' }]}>
                                    Sản phẩm
                                </Text>
                                <Text style={[styles.tableCell, styles.tableCellBold, { width: '13%' }]}>
                                    Variant
                                </Text>
                                <Text style={[styles.tableCell, styles.tableCellBold, styles.textRight, { width: '11%' }]}>
                                    Dự báo bán
                                </Text>
                                <Text style={[styles.tableCell, styles.tableCellBold, styles.textRight, { width: '11%' }]}>
                                    Thực tế
                                </Text>
                                <Text style={[styles.tableCell, styles.tableCellBold, styles.textRight, { width: '11%' }]}>
                                    Chênh lệch
                                </Text>
                                <Text style={[styles.tableCell, styles.tableCellBold, styles.textRight, { width: '16%' }]}>
                                    Dự báo DT
                                </Text>
                                <Text style={[styles.tableCell, styles.tableCellBold, styles.tableCellLast, styles.textRight, { width: '16%' }]}>
                                    Giá bán
                                </Text>
                            </View>

                            {/* Table Body */}
                            {predictions.map((pred, index) => {
                                const difference = pred.actual_sales !== undefined
                                    ? pred.actual_sales - pred.predicted_sales
                                    : null
                                const differenceText = difference !== null
                                    ? `${difference > 0 ? '+' : ''}${formatNumber(difference)}`
                                    : '-'

                                const isLast = index === predictions.length - 1
                                const rowStyle = isLast 
                                    ? [styles.tableRow, { borderBottomWidth: 0 }]
                                    : styles.tableRow

                                return (
                                    <View key={index} style={rowStyle}>
                                        <Text style={[styles.tableCell, styles.tableCellBold, { width: '22%' }]}>
                                            {pred.product_name}
                                        </Text>
                                        <Text style={[styles.tableCell, { width: '13%', color: '#6b7280' }]}>
                                            {pred.variant_title || '-'}
                                        </Text>
                                        <Text style={[styles.tableCell, styles.tableCellBold, styles.textRight, { width: '11%' }]}>
                                            {formatNumber(pred.predicted_sales)}
                                        </Text>
                                        <Text style={[styles.tableCell, styles.textRight, { width: '11%' }]}>
                                            {pred.actual_sales !== undefined ? formatNumber(pred.actual_sales) : 'Chưa có'}
                                        </Text>
                                        <Text style={[styles.tableCell, styles.textRight, { width: '11%' }]}>
                                            {differenceText}
                                        </Text>
                                        <Text style={[styles.tableCell, styles.tableCellBold, styles.textRight, { width: '16%' }]}>
                                            {formatCurrency(pred.predicted_revenue)}
                                        </Text>
                                        <Text style={[styles.tableCell, styles.tableCellLast, styles.textRight, { width: '16%' }]}>
                                            {formatCurrency(pred.price)}
                                        </Text>
                                    </View>
                                )
                            })}
                        </View>
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Báo cáo được tạo tự động bởi hệ thống OCM - {new Date().getFullYear()}</Text>
                </View>
            </Page>
        </Document>
    )
}

export default TrendingReportPDF

export const getReportFileName = (): string => {
    return `BaoCaoTrending_${new Date().toISOString().split('T')[0]}.pdf`
}
