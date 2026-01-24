import api from './api';

export interface PostCommentDTO {
    commentable_type: 'FARM' | 'PRODUCT' | 'BLOG';
    commentable_id: string;
    content: string;
    rating: number;
    parent_id?: string | null;
}

export const getComments = async (type: string, id: string) => {
    const response = await api.get('/showcase/comments', {
        params: { commentable_type: type, commentable_id: id }
    });
    return response.data;
};

export const createComment = async (data: PostCommentDTO) => {
    const response = await api.post('/showcase/comments', data);
    return response.data;
};

export const addReaction = async (commentId: string, reactionType: string) => {
    const response = await api.post(`/showcase/comments/${commentId}/reactions`, {
        reaction_type: reactionType
    });
    return response.data;
};

export const deleteComment = async (commentId: string) => {
    const response = await api.delete(`/showcase/comments/${commentId}`);
    return response.data;
};

export const getCommentStats = async (type: string, id: string) => {
    const response = await api.get('/showcase/comments/stats', {
        params: { commentable_type: type, commentable_id: id }
    });
    return response.data;
};

export const getReactionDetails = async (commentId: string) => {
    const response = await api.get(`/showcase/comments/${commentId}/reactions`);
    return response.data;
};
