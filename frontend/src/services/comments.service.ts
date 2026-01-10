import api from './api';

export interface PostCommentDTO {
    commentable_type: 'FARM' | 'PRODUCT' | 'BLOG';
    commentable_id: string;
    content: string;
    rating: number;
    parent_id?: number | null;
    commenter_name: string;
    commenter_email: string;
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

export const addReaction = async (commentId: number, reactionType: string, sessionId: string) => {
    const response = await api.post(`/showcase/comments/${commentId}/reactions`, {
        reaction_type: reactionType,
        session_id: sessionId
    });
    return response.data;
};
