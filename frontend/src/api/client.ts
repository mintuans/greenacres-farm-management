/**
 * API Configuration và Helper Functions
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 30000;

/**
 * Custom Error cho API
 */
export class APIError extends Error {
    constructor(
        message: string,
        public status?: number,
        public data?: any
    ) {
        super(message);
        this.name = 'APIError';
    }
}

/**
 * Request options interface
 */
interface RequestOptions extends RequestInit {
    timeout?: number;
}

/**
 * Hàm fetch với timeout
 */
const fetchWithTimeout = async (
    url: string,
    options: RequestOptions = {}
): Promise<Response> => {
    const { timeout = API_TIMEOUT, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            throw new APIError('Request timeout', 408);
        }
        throw error;
    }
};

/**
 * API Client chính
 */
class APIClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    /**
     * GET request
     */
    async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        const response = await fetchWithTimeout(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            ...options,
        });

        return this.handleResponse<T>(response);
    }

    /**
     * POST request
     */
    async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        const response = await fetchWithTimeout(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            ...options,
        });

        return this.handleResponse<T>(response);
    }

    /**
     * PUT request
     */
    async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        const response = await fetchWithTimeout(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            ...options,
        });

        return this.handleResponse<T>(response);
    }

    /**
     * DELETE request
     */
    async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        const response = await fetchWithTimeout(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            ...options,
        });

        return this.handleResponse<T>(response);
    }

    /**
     * Xử lý response
     */
    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new APIError(
                errorData.message || `HTTP Error ${response.status}`,
                response.status,
                errorData
            );
        }

        const data = await response.json();
        return data as T;
    }
}

/**
 * Export API client instance
 */
export const apiClient = new APIClient(API_BASE_URL);

/**
 * Export các helper functions
 */
export const api = {
    get: <T>(endpoint: string, options?: RequestOptions) => apiClient.get<T>(endpoint, options),
    post: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
        apiClient.post<T>(endpoint, data, options),
    put: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
        apiClient.put<T>(endpoint, data, options),
    delete: <T>(endpoint: string, options?: RequestOptions) =>
        apiClient.delete<T>(endpoint, options),
};
