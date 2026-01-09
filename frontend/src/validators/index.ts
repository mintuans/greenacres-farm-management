/**
 * Validators cho form inputs
 */

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

/**
 * Validate email
 */
export const validateEmail = (email: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
        return { isValid: false, error: 'Email không được để trống' };
    }

    if (!emailRegex.test(email)) {
        return { isValid: false, error: 'Email không hợp lệ' };
    }

    return { isValid: true };
};

/**
 * Validate số điện thoại Việt Nam
 */
export const validatePhone = (phone: string): ValidationResult => {
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;

    if (!phone) {
        return { isValid: false, error: 'Số điện thoại không được để trống' };
    }

    if (!phoneRegex.test(phone)) {
        return { isValid: false, error: 'Số điện thoại không hợp lệ' };
    }

    return { isValid: true };
};

/**
 * Validate mật khẩu
 */
export const validatePassword = (password: string, minLength: number = 8): ValidationResult => {
    if (!password) {
        return { isValid: false, error: 'Mật khẩu không được để trống' };
    }

    if (password.length < minLength) {
        return { isValid: false, error: `Mật khẩu phải có ít nhất ${minLength} ký tự` };
    }

    if (!/[A-Z]/.test(password)) {
        return { isValid: false, error: 'Mật khẩu phải có ít nhất 1 chữ hoa' };
    }

    if (!/[a-z]/.test(password)) {
        return { isValid: false, error: 'Mật khẩu phải có ít nhất 1 chữ thường' };
    }

    if (!/[0-9]/.test(password)) {
        return { isValid: false, error: 'Mật khẩu phải có ít nhất 1 số' };
    }

    return { isValid: true };
};

/**
 * Validate required field
 */
export const validateRequired = (value: string, fieldName: string = 'Trường này'): ValidationResult => {
    if (!value || value.trim() === '') {
        return { isValid: false, error: `${fieldName} không được để trống` };
    }

    return { isValid: true };
};

/**
 * Validate số tiền
 */
export const validateAmount = (amount: number | string, min: number = 0): ValidationResult => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount)) {
        return { isValid: false, error: 'Số tiền không hợp lệ' };
    }

    if (numAmount < min) {
        return { isValid: false, error: `Số tiền phải lớn hơn hoặc bằng ${min}` };
    }

    return { isValid: true };
};

/**
 * Validate độ dài chuỗi
 */
export const validateLength = (
    value: string,
    min: number,
    max: number,
    fieldName: string = 'Trường này'
): ValidationResult => {
    if (value.length < min) {
        return { isValid: false, error: `${fieldName} phải có ít nhất ${min} ký tự` };
    }

    if (value.length > max) {
        return { isValid: false, error: `${fieldName} không được vượt quá ${max} ký tự` };
    }

    return { isValid: true };
};
