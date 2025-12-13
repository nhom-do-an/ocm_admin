// components/InvoiceViewer.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import orderService from '@/services/order';
import Modal from 'antd/es/modal/Modal';
import { PrinterOutlined, DownloadOutlined, LoadingOutlined } from '@ant-design/icons';
import { X } from 'lucide-react';

interface InvoiceViewerProps {
    orderId: number;
    open: boolean;
    onCancel: () => void;
}

export default function InvoiceViewer({ orderId, open, onCancel }: InvoiceViewerProps) {
    const [htmlContent, setHtmlContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const invoiceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open && orderId) {
            setLoading(true);
            orderService
                .GetOrderPrint(orderId)
                .then((html) => {
                    setHtmlContent(html);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error(err);
                    alert('Không thể tải hóa đơn');
                    setLoading(false);
                });
        }
    }, [open, orderId]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        if (!invoiceRef.current || generatingPdf) return;
        setGeneratingPdf(true);

        try {
            const canvas = await html2canvas(invoiceRef.current!, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const width = pdf.internal.pageSize.getWidth();
            const height = (canvas.height * width) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, width, height);
            pdf.save(`Hoa-don-${orderId}.pdf`);
        } catch (err) {
            alert('Lỗi khi tạo PDF');
        } finally {
            setGeneratingPdf(false);
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            style={{ top: 20 }}
            className=" !w-[500px] !rounded"
            destroyOnClose
        >
            {/* Thanh công cụ cố định phía trên */}
            <div className="print:hidden sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-2 shadow-sm -mx-6 -mt-6 mb- rounded-t">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Hóa đơn #{orderId}</h2>


                </div>
            </div>

            {/* Nội dung hóa đơn */}
            <div className="invoice-print-container">
                {loading ? (
                    <div className="text-center py-12 text-gray-500">
                        <LoadingOutlined className="text-3xl mb-4" />
                        <p>Đang tải hóa đơn...</p>
                    </div>
                ) : (
                    <div
                        ref={invoiceRef}
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                        className="invoice-content bg-white mx-auto overflow-y-scroll max-h-[400px]"
                    />
                )}
            </div>

            <div className="flex justify-end gap-1 items-center  border-t border-gray-200 pt-2">
                <div className="flex items-center gap-3">


                    <button
                        onClick={handleDownloadPDF}
                        disabled={generatingPdf || loading}
                        className="secondary-button disabled:opacity-60 z-50"
                    >
                        {generatingPdf ? (
                            <div className="flex items-center gap-2">
                                <LoadingOutlined spin />
                                Đang tạo...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <DownloadOutlined />
                                Tải PDF
                            </div>
                        )}
                    </button>
                    <button
                        onClick={handlePrint}
                        className=" primary-button"
                    >
                        <div className="flex items-center gap-2">
                            <PrinterOutlined />
                            <span> In hóa đơn</span>
                        </div>


                    </button>
                </div>
            </div>

            {/* CSS In ấn - Quan trọng nhất */}
            <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-print-container,
          .invoice-print-container * {
            visibility: visible;
          }
          .invoice-print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .invoice-content {
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 20mm !important;
            margin: 0 !important;
            max-width: none !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
          /* Đảm bảo màu sắc, font, hình ảnh in đúng */
          .invoice-content * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            font-family: 'DejaVu Sans', 'Roboto', Arial, sans-serif !important;
          }
        }
      `}</style>
        </Modal>
    );
}