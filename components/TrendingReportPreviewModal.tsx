'use client'
import React, { useEffect, useState } from 'react'
import { Modal, Button } from 'antd'
import { Download, Eye } from 'lucide-react'
import { TrendingItem, TrendingPrediction } from '@/types/response/trending'
import { pdf } from '@react-pdf/renderer'
import TrendingReportPDF, { getReportFileName } from '@/utils/trendingReportPDF'

interface TrendingReportPreviewModalProps {
    open: boolean
    trending: TrendingItem[]
    predictions: TrendingPrediction[]
    totalPredictedSales: number
    totalPredictedRevenue: number
    selectedDate?: string
    onCancel: () => void
    onDownload: () => void
}

const TrendingReportPreviewModal: React.FC<TrendingReportPreviewModalProps> = ({
    open,
    trending,
    predictions,
    totalPredictedSales,
    totalPredictedRevenue,
    selectedDate,
    onCancel,
    onDownload
}) => {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [downloading, setDownloading] = useState(false)

    useEffect(() => {
        if (open) {
            generatePreview()
        } else {
            // Cleanup URL when modal closes
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl)
                setPdfUrl(null)
            }
        }
    }, [open])

    const generatePreview = async () => {
        try {
            setLoading(true)
            
            // Generate PDF blob using @react-pdf/renderer
            const blob = await pdf(
                <TrendingReportPDF
                    trending={trending}
                    predictions={predictions}
                    totalPredictedSales={totalPredictedSales}
                    totalPredictedRevenue={totalPredictedRevenue}
                    selectedDate={selectedDate}
                />
            ).toBlob()

            // Create URL for preview
            const url = URL.createObjectURL(blob)
            setPdfUrl(url)
        } catch (error) {
            console.error('Error generating PDF preview:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async () => {
        try {
            setDownloading(true)
            
            // Generate PDF blob
            const blob = await pdf(
                <TrendingReportPDF
                    trending={trending}
                    predictions={predictions}
                    totalPredictedSales={totalPredictedSales}
                    totalPredictedRevenue={totalPredictedRevenue}
                    selectedDate={selectedDate}
                />
            ).toBlob()

            // Create download link
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = getReportFileName()
            link.click()

            // Cleanup
            URL.revokeObjectURL(url)
            onDownload()
        } catch (error) {
            console.error('Error downloading PDF:', error)
        } finally {
            setDownloading(false)
        }
    }

    return (
        <Modal
            open={open}
            title={
                <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <span>Xem trước báo cáo PDF</span>
                </div>
            }
            onCancel={onCancel}
            footer={null}
            width={900}
            centered
            destroyOnClose
            className="trending-report-preview-modal"
            style={{ top: 20 }}
            styles={{
                body: { padding: '24px' },
                content: { borderRadius: '8px' }
            }}
        >
            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-[600px]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Đang tạo báo cáo...</p>
                        </div>
                    </div>
                ) : pdfUrl ? (
                    <>
                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                            <iframe
                                src={pdfUrl}
                                className="w-full h-[70vh] border-0"
                                title="PDF Preview"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="primary"
                                icon={<Download className="w-4 h-4" />}
                                onClick={handleDownload}
                                loading={downloading}
                                disabled={downloading}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {downloading ? 'Đang tải...' : 'Tải về PDF'}
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-[600px]">
                        <p className="text-gray-500">Không thể tạo báo cáo</p>
                    </div>
                )}
            </div>
        </Modal>
    )
}

export default TrendingReportPreviewModal
