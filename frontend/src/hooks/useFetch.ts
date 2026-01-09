import { useState, useEffect } from 'react';

/**
 * Custom hook để fetch data từ API
 * @param url - URL endpoint
 * @returns Object chứa data, loading, error, và refetch function
 */
export const useFetch = <T,>(url: string) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [url]);

    return {
        data,
        loading,
        error,
        refetch: fetchData
    };
};
