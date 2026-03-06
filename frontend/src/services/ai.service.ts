import api from './api';

export const chatWithAI = async (message: string) => {
    try {
        const response = await api.post('/showcase/ai/chat', { message });
        return response.data;
    } catch (error) {
        console.error('Error chatting with AI:', error);
        throw error;
    }
};
