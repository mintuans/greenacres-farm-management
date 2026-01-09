import { useState, useEffect } from 'react';

/**
 * Custom hook để quản lý LocalStorage
 * @param key - Key trong localStorage
 * @param initialValue - Giá trị khởi tạo
 * @returns [value, setValue] tuple
 */
export const useLocalStorage = <T,>(key: string, initialValue: T) => {
    // Lấy giá trị từ localStorage hoặc dùng initialValue
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error loading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Cập nhật localStorage khi value thay đổi
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue] as const;
};
