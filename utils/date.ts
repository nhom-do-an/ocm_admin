import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// Extend dayjs với plugins
dayjs.extend(utc)
dayjs.extend(timezone)

// Timezone mặc định của hệ thống
const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh'

/**
 * Parse date string từ backend và đảm bảo hiển thị đúng giờ Việt Nam
 *
 * Backend có thể trả về:
 * - "2026-01-09T09:01:35+07:00" (có timezone offset) -> hiển thị 09:01
 * - "2026-01-09T02:01:35Z" (UTC) -> convert sang +7 -> hiển thị 09:01
 *
 * Cách làm: Luôn convert về timezone Asia/Ho_Chi_Minh để đảm bảo nhất quán
 */
export const parseDateTime = (dateString?: string): dayjs.Dayjs | null => {
    if (!dateString) return null
    // Parse và convert về timezone Việt Nam
    return dayjs(dateString).tz(DEFAULT_TIMEZONE)
}

/**
 * Format date/time đầy đủ (DD/MM/YYYY HH:mm)
 */
export const formatDateTime = (dateString?: string): string => {
    if (!dateString) return ''
    const parsed = dayjs(dateString).tz(DEFAULT_TIMEZONE)
    if (!parsed.isValid()) return ''
    return parsed.format('DD/MM/YYYY HH:mm')
}

/**
 * Format chỉ ngày (DD/MM/YYYY)
 */
export const formatDateOnly = (dateString?: string): string => {
    if (!dateString) return ''
    const parsed = dayjs(dateString).tz(DEFAULT_TIMEZONE)
    if (!parsed.isValid()) return ''
    return parsed.format('DD/MM/YYYY')
}

/**
 * Format chỉ giờ (HH:mm)
 */
export const formatTimeOnly = (dateString?: string): string => {
    if (!dateString) return ''
    const parsed = dayjs(dateString).tz(DEFAULT_TIMEZONE)
    if (!parsed.isValid()) return ''
    return parsed.format('HH:mm')
}

/**
 * Format với dayjs pattern tùy chọn
 */
export const formatWithPattern = (dateString?: string, pattern: string = 'DD/MM/YYYY HH:mm'): string => {
    if (!dateString) return ''
    const parsed = dayjs(dateString).tz(DEFAULT_TIMEZONE)
    if (!parsed.isValid()) return ''
    return parsed.format(pattern)
}
