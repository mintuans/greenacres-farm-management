/**
 * Định dạng số thành tiền tệ VND
 * @param amount - Số tiền cần định dạng
 * @returns Chuỗi tiền tệ đã định dạng
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

/**
 * Định dạng ngày tháng theo format Việt Nam
 * @param date - Ngày cần định dạng (Date object hoặc string)
 * @param format - Format mong muốn: 'short' | 'long' | 'full'
 * @returns Chuỗi ngày đã định dạng
 */
export const formatDate = (
    date: Date | string,
    format: 'short' | 'long' | 'full' = 'short'
): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
        short: { day: '2-digit', month: '2-digit', year: 'numeric' },
        long: { day: '2-digit', month: 'long', year: 'numeric' },
        full: { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' },
    };

    const options = formatOptions[format];

    return new Intl.DateTimeFormat('vi-VN', options).format(dateObj);
};

/**
 * Định dạng số với dấu phân cách hàng nghìn
 * @param num - Số cần định dạng
 * @returns Chuỗi số đã định dạng
 */
export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('vi-VN').format(num);
};

/**
 * Tính phần trăm
 * @param value - Giá trị
 * @param total - Tổng
 * @returns Phần trăm (0-100)
 */
export const calculatePercentage = (value: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
};

/**
 * Làm tròn số đến n chữ số thập phân
 * @param num - Số cần làm tròn
 * @param decimals - Số chữ số thập phân
 * @returns Số đã làm tròn
 */
export const roundNumber = (num: number, decimals: number = 2): number => {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * Chuyển đổi chuỗi thành slug (URL-friendly)
 * @param str - Chuỗi cần chuyển đổi
 * @returns Slug
 */
export const slugify = (str: string): string => {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
};

/**
 * Debounce function
 * @param func - Function cần debounce
 * @param wait - Thời gian chờ (ms)
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};
