'use client'
import React, { useEffect, useState, useRef } from 'react'
import { Modal, Button } from 'antd'
import { Download, X, Eye } from 'lucide-react'
import { TrendingItem, TrendingPrediction } from '@/types/response/trending'
import { generateTrendingReportHTML, getReportFileName } from '@/utils/trendingReportHTMLTemplate'
import html2pdf from 'html2pdf.js'

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
    const iframeRef = useRef<HTMLIFrameElement>(null)

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    const generatePreview = async () => {
        try {
            setLoading(true)
            const html = generateTrendingReportHTML({
                trending,
                predictions,
                totalPredictedSales,
                totalPredictedRevenue,
                selectedDate
            })

            // Create a hidden iframe to render HTML in complete isolation
            const iframe = document.createElement('iframe')
            iframe.style.position = 'fixed'
            iframe.style.left = '-9999px'
            iframe.style.top = '0'
            iframe.style.width = '210mm'
            iframe.style.height = '297mm'
            iframe.style.border = 'none'
            iframe.style.visibility = 'hidden'
            document.body.appendChild(iframe)

            // Wait for iframe to load
            await new Promise<void>((resolve) => {
                iframe.onload = () => resolve()
                iframe.srcdoc = html
            })

            // Wait for content to fully render
            await new Promise(resolve => setTimeout(resolve, 1000))

            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
            if (!iframeDoc || !iframeDoc.body) {
                throw new Error('Cannot access iframe document')
            }

            const bodyElement = iframeDoc.body

            // Verify content exists
            if (!bodyElement.innerHTML || bodyElement.innerHTML.trim() === '') {
                throw new Error('HTML content is empty')
            }

            // Generate PDF from iframe body
            const opt = {
                margin: [0, 0, 0, 0],
                filename: getReportFileName(),
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2, 
                    useCORS: true,
                    logging: false,
                    windowWidth: bodyElement.scrollWidth || 794,
                    windowHeight: bodyElement.scrollHeight || 1123,
                    allowTaint: true
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            }

            const pdfBlob = await html2pdf().set(opt).from(bodyElement).outputPdf('blob')
            const url = URL.createObjectURL(pdfBlob)
            setPdfUrl(url)

            // Cleanup iframe immediately
            document.body.removeChild(iframe)
        } catch (error) {
            console.error('Error generating PDF preview:', error)
            setLoading(false)
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async () => {
        try {
            setDownloading(true)
            const html = generateTrendingReportHTML({
                trending,
                predictions,
                totalPredictedSales,
                totalPredictedRevenue,
                selectedDate
            })

            // Create a hidden iframe to render HTML in complete isolation
            const iframe = document.createElement('iframe')
            iframe.style.position = 'fixed'
            iframe.style.left = '-9999px'
            iframe.style.top = '0'
            iframe.style.width = '210mm'
            iframe.style.height = '297mm'
            iframe.style.border = 'none'
            iframe.style.visibility = 'hidden'
            document.body.appendChild(iframe)

            // Wait for iframe to load
            await new Promise<void>((resolve) => {
                iframe.onload = () => resolve()
                iframe.srcdoc = html
            })

            // Wait for content to render
            await new Promise(resolve => setTimeout(resolve, 1000))

            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
            if (!iframeDoc || !iframeDoc.body) {
                throw new Error('Cannot access iframe document')
            }

            const bodyElement = iframeDoc.body

            // Verify content exists
            if (!bodyElement.innerHTML || bodyElement.innerHTML.trim() === '') {
                throw new Error('HTML content is empty')
            }

            // Generate and download PDF
            const opt = {
                margin: [0, 0, 0, 0],
                filename: getReportFileName(),
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2, 
                    useCORS: true,
                    logging: false,
                    windowWidth: bodyElement.scrollWidth || 794,
                    windowHeight: bodyElement.scrollHeight || 1123,
                    allowTaint: true
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            }

            await html2pdf().set(opt).from(bodyElement).save()

            // Cleanup iframe immediately
            document.body.removeChild(iframe)
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
                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                            <iframe
                                ref={iframeRef}
                                src={pdfUrl}
                                className="w-full h-[600px] border-0"
                                title="PDF Preview"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                icon={<X className="w-4 h-4" />}
                                onClick={onCancel}
                            >
                                Đóng
                            </Button>
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

