/**
 * Utility functions for calendar operations
 */

export interface CalendarDay {
    date: Date;
    dayOfMonth: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isWeekend: boolean;
}

/**
 * Lấy số ngày trong tháng
 */
export function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

/**
 * Lấy ngày đầu tiên của tháng (0 = Sunday, 1 = Monday, ...)
 */
export function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

/**
 * Kiểm tra xem có phải ngày hôm nay không
 */
export function isToday(date: Date): boolean {
    const today = new Date();
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
}

/**
 * Kiểm tra xem có phải cuối tuần không
 */
export function isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
}

/**
 * Tạo mảng các ngày trong tháng để hiển thị trên lịch
 * Bao gồm cả các ngày của tháng trước và tháng sau để lấp đầy lưới 7x6
 */
export function generateCalendarDays(year: number, month: number): CalendarDay[] {
    const days: CalendarDay[] = [];

    // Số ngày trong tháng hiện tại
    const daysInMonth = getDaysInMonth(year, month);

    // Ngày đầu tiên của tháng là thứ mấy (0 = CN, 1 = T2, ...)
    const firstDayOfMonth = getFirstDayOfMonth(year, month);

    // Số ngày của tháng trước cần hiển thị
    const daysFromPrevMonth = firstDayOfMonth;

    // Tháng trước
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);

    // Thêm các ngày của tháng trước
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
        const dayOfMonth = daysInPrevMonth - i;
        const date = new Date(prevMonthYear, prevMonth, dayOfMonth);
        days.push({
            date,
            dayOfMonth,
            isCurrentMonth: false,
            isToday: isToday(date),
            isWeekend: isWeekend(date),
        });
    }

    // Thêm các ngày của tháng hiện tại
    for (let dayOfMonth = 1; dayOfMonth <= daysInMonth; dayOfMonth++) {
        const date = new Date(year, month, dayOfMonth);
        days.push({
            date,
            dayOfMonth,
            isCurrentMonth: true,
            isToday: isToday(date),
            isWeekend: isWeekend(date),
        });
    }

    // Thêm các ngày của tháng sau để lấp đầy lưới (tối đa 42 ô = 6 tuần)
    const remainingDays = 42 - days.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;

    for (let dayOfMonth = 1; dayOfMonth <= remainingDays; dayOfMonth++) {
        const date = new Date(nextMonthYear, nextMonth, dayOfMonth);
        days.push({
            date,
            dayOfMonth,
            isCurrentMonth: false,
            isToday: isToday(date),
            isWeekend: isWeekend(date),
        });
    }

    return days;
}

/**
 * Lấy tên tháng theo tiếng Việt
 */
export function getMonthName(month: number): string {
    const monthNames = [
        'Tháng 1',
        'Tháng 2',
        'Tháng 3',
        'Tháng 4',
        'Tháng 5',
        'Tháng 6',
        'Tháng 7',
        'Tháng 8',
        'Tháng 9',
        'Tháng 10',
        'Tháng 11',
        'Tháng 12',
    ];
    return monthNames[month];
}

/**
 * Format ngày tháng năm
 */
export function formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * So sánh hai ngày (chỉ ngày, không tính giờ)
 */
export function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    );
}

/**
 * Lấy ngày đầu tiên của tháng
 */
export function getFirstDayOfMonthDate(year: number, month: number): Date {
    return new Date(year, month, 1);
}

/**
 * Lấy ngày cuối cùng của tháng
 */
export function getLastDayOfMonthDate(year: number, month: number): Date {
    return new Date(year, month + 1, 0);
}
