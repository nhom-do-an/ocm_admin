import * as XLSX from 'xlsx'

interface ExportData {
    [key: string]: string | number
}

interface Column {
    key: string
    label: string
}

export const exportToExcel = (
    data: ExportData[],
    columns: Column[],
    filename: string = 'report.xlsx'
) => {
    // Create worksheet data
    const worksheetData = [
        // Header row
        columns.map(col => col.label),
        // Data rows
        ...data.map(row => columns.map(col => row[col.key] || '')),
    ]

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    // Set column widths
    const columnWidths = columns.map(() => ({ wch: 20 }))
    worksheet['!cols'] = columnWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Báo cáo')

    // Generate Excel file and download
    XLSX.writeFile(workbook, filename)
}

