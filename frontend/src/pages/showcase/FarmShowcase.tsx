import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getMediaFiles, getFarmImages } from '../../services/media.service';
import { getMediaUrl } from '../../services/products.service';
import { getComments, createComment, addReaction, deleteComment, getCommentStats, getReactionDetails } from '../../services/comments.service';
import { incrementVisitors, getVisitorCount, toggleFavoriteCount } from '../../services/stats.service';
import ShowcaseHeader from '../../templates/ShowcaseHeader';
import { useAuth } from '@/src/contexts/AuthContext';
import { WeatherWidget } from '../../components';

interface CommentItemProps {
    comment: any;
    replyingTo: string | null;
    setReplyingTo: (id: string | null) => void;
    replyContent: string;
    setReplyContent: (content: string) => void;
    handleSubmitReply: (parentId: string) => void;
    isSubmitting: boolean;
    handleReaction: (id: string, type: string) => void;
    user: any;
    depth?: number;
    onShowReactions: (commentId: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
    comment, replyingTo, setReplyingTo, replyContent, setReplyContent,
    handleSubmitReply, isSubmitting, handleReaction, handleDelete, user, onShowReactions, depth = 0
}) => {
    const isRoot = depth === 0;
    const emojiMap: any = { like: '👍', love: '❤️', haha: '😂', wow: '😮', sad: '😢', angry: '😡' };
    const [showAllReplies, setShowAllReplies] = React.useState(false);

    const replyCount = comment.replies?.length || 0;
    const shouldHideInitially = replyCount >= 3;
    const visibleReplies = (showAllReplies || !shouldHideInitially) ? (comment.replies || []) : [];

    return (
        <div className={`flex gap-4 group ${depth > 0 ? 'mt-3' : ''}`}>
            <div className={`${isRoot ? 'size-12' : 'size-9'} rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0`}>
                <img src={comment.avatar} alt={comment.user} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex flex-col gap-2">
                <div className={`${isRoot ? 'bg-white' : 'bg-[#f0f4f1]'} p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm relative transition-all hover:border-primary/20`}>
                    <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-[#111813] text-sm">
                            {comment.user}
                            {comment.is_admin && <span className="ml-1.5 bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">Admin</span>}
                        </h4>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">{comment.time}</span>
                    </div>

                    {isRoot && (
                        <div className="flex gap-0.5 mb-2 scale-90 origin-left">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className={`material-symbols-outlined text-[16px] ${i < comment.rating ? 'text-[#f59e0b] fill-1' : 'text-gray-200'}`}>star</span>
                            ))}
                        </div>
                    )}

                    <p className={`${isRoot ? 'text-[#3c4740] text-sm' : 'text-[#4a554e] text-xs'} leading-relaxed`}>{comment.content}</p>

                    {/* Floating Reactions Display */}
                    {comment.likes > 0 && (
                        <div
                            className="absolute -bottom-3 right-4 flex bg-white px-2 py-0.5 rounded-full shadow-md border border-gray-100 gap-1 text-[11px] animate-in zoom-in duration-300 cursor-pointer hover:scale-110 hover:shadow-lg transition-all z-10"
                            onClick={() => onShowReactions(comment.id)}
                        >
                            {(comment.reactions || []).map((r: string, idx: number) => <span key={idx}>{r}</span>)}
                            <span className="text-gray-500 ml-1 font-bold">{comment.likes}</span>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-6 px-2 items-center">
                    <div className="relative group/react-recursive">
                        <button
                            onClick={() => handleReaction(comment.id, 'like')}
                            className="flex items-center gap-1.5 hover:text-primary transition-all font-bold text-[11px] text-[#61896b]"
                        >
                            <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                            Thích
                        </button>
                        <div className="absolute bottom-[100%] left-0 pb-3 hidden group-hover/react-recursive:flex animate-in zoom-in-50 duration-200 z-10">
                            <div className="bg-white shadow-2xl rounded-full p-2 border border-gray-100 flex gap-2 items-center">
                                {Object.keys(emojiMap).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => handleReaction(comment.id, type)}
                                        className="hover:scale-[1.6] transform transition-all cursor-pointer p-1 text-2xl leading-none border-none bg-transparent"
                                        title={type}
                                    >
                                        {emojiMap[type]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <button
                        className={`transition-colors font-bold text-[11px] hover:text-primary flex items-center gap-1.5 ${replyingTo === comment.id ? 'text-primary' : 'text-[#61896b]'}`}
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    >
                        <span className="material-symbols-outlined text-[16px]">reply</span>
                        Phản hồi
                    </button>

                    {shouldHideInitially && !showAllReplies && (
                        <button
                            onClick={() => setShowAllReplies(true)}
                            className="text-[10px] font-bold text-primary hover:underline ml-2"
                        >
                            Xem thêm {replyCount} phản hồi...
                        </button>
                    )}

                    {(user?.id === comment.user_id || user?.role === 'SUPER_ADMIN') && (
                        <button
                            onClick={() => {
                                if (confirm('Bạn có chắc muốn xóa bình luận này?')) {
                                    handleDelete(comment.id);
                                }
                            }}
                            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-red-400 hover:text-red-600 flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                            Xóa
                        </button>
                    )}
                </div>

                {/* Reply Input Box */}
                {replyingTo === comment.id && (
                    <div className="mt-3 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                            <span className="material-symbols-outlined text-primary text-sm">agriculture</span>
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                            <textarea
                                autoFocus
                                placeholder={`Phản hồi ${comment.user}...`}
                                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-20 shadow-inner"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                            ></textarea>
                            <div className="flex justify-end gap-3">
                                <button
                                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-gray-400 hover:bg-gray-100 transition-colors"
                                    onClick={() => setReplyingTo(null)}
                                >
                                    Hủy
                                </button>
                                <button
                                    className="bg-primary text-white px-5 py-1.5 rounded-lg text-xs font-bold hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 active:scale-95"
                                    onClick={() => handleSubmitReply(comment.id)}
                                    disabled={!replyContent.trim() || isSubmitting}
                                >
                                    {isSubmitting ? 'Đang gửi...' : 'Gửi phản hồi'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recursively Render Sub-Replies */}
                {visibleReplies.length > 0 && (
                    <div className="flex flex-col gap-4 mt-2 ml-4 md:ml-8 border-l-2 border-primary/10 pl-4 md:pl-6">
                        {visibleReplies.map((reply: any) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                replyingTo={replyingTo}
                                setReplyingTo={setReplyingTo}
                                replyContent={replyContent}
                                setReplyContent={setReplyContent}
                                handleSubmitReply={handleSubmitReply}
                                isSubmitting={isSubmitting}
                                handleReaction={handleReaction}
                                handleDelete={handleDelete}
                                user={user}
                                onShowReactions={onShowReactions}
                                depth={depth + 1}
                            />
                        ))}
                        {showAllReplies && shouldHideInitially && (
                            <button
                                onClick={() => setShowAllReplies(false)}
                                className="text-[10px] font-bold text-gray-400 hover:text-primary text-left"
                            >
                                Thu gọn phản hồi
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const FarmShowcase: React.FC = () => {
    const [recentMedia, setRecentMedia] = React.useState<any[]>([]);
    const [farmImages, setFarmImages] = React.useState<any[]>([]);
    const [totalMediaCount, setTotalMediaCount] = React.useState(0);
    const [totalFarmImagesCount, setTotalFarmImagesCount] = React.useState(0);
    const [showGalleryModal, setShowGalleryModal] = React.useState(false);
    const [selectedMediaItem, setSelectedMediaItem] = React.useState<any | null>(null);
    const [showToast, setShowToast] = React.useState(false);
    const [visibleCommentsCount, setVisibleCommentsCount] = React.useState(3);
    const [visitorCount, setVisitorCount] = React.useState<number>(0);
    const [showFullAbout, setShowFullAbout] = React.useState(false);
    const [heroIndex, setHeroIndex] = React.useState(0);
    const [isFavorited, setIsFavorited] = React.useState(() => {
        return localStorage.getItem('farm_favorited') === 'true';
    });
    const [favoriteCount, setFavoriteCount] = React.useState(0);

    const handleFavorite = async () => {
        const next = !isFavorited;
        setIsFavorited(next);
        localStorage.setItem('farm_favorited', String(next));
        try {
            const newCount = await toggleFavoriteCount(next ? 'add' : 'remove');
            setFavoriteCount(newCount);
        } catch { }
    };

    // Comments logic state
    const [comments, setComments] = React.useState<any[]>([]);
    const [commentStats, setCommentStats] = React.useState({ total_count: 0, avg_rating: 0 });
    const [newComment, setNewComment] = React.useState('');
    const [rating, setRating] = React.useState(5);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [replyingTo, setReplyingTo] = React.useState<string | null>(null);
    const [replyContent, setReplyContent] = React.useState('');
    const [reactionDetails, setReactionDetails] = React.useState<any[]>([]);
    const [showReactionModal, setShowReactionModal] = React.useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const socketRef = React.useRef<any>(null);

    const FARM_ID = 'farm-001';
    const ROOM_NAME = `farm-${FARM_ID}`;

    const fetchStats = async () => {
        try {
            const response = await import('../../services/stats.service');
            const count = await response.getVisitorCount();
            setVisitorCount(count);
            // Also fetch favorites from same endpoint
            const api = await import('../../services/api');
            const statsRes = await api.default.get('/showcase/stats');
            setFavoriteCount(statsRes.data?.favorites || 0);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleVisit = async () => {
        try {
            const sessionVisited = sessionStorage.getItem('visited');
            if (!sessionVisited) {
                const count = await incrementVisitors();
                setVisitorCount(count);
                sessionStorage.setItem('visited', 'true');
                // Luôn fetch favoriteCount dù là lần đầu hay không
                fetchStats();
            } else {
                fetchStats();
            }
        } catch (error) {
            console.error('Error handling visit:', error);
        }
    };

    React.useEffect(() => {
        handleVisit();
    }, []);

    const fetchComments = async () => {
        try {
            const [commentsResponse, statsResponse] = await Promise.all([
                getComments('FARM', FARM_ID),
                getCommentStats('FARM', FARM_ID)
            ]);

            setCommentStats(statsResponse.data);

            const rawComments = commentsResponse.data;
            const tree: any[] = [];
            const map = new Map();

            const emojiMap: any = { like: '👍', love: '❤️', haha: '😂', wow: '😮', sad: '😢', angry: '😡' };
            rawComments.forEach((c: any) => {
                map.set(c.id, {
                    ...c,
                    user: c.user_name || c.commenter_name || 'Khách',
                    avatar: c.avatar_id ? getMediaUrl(c.avatar_id) : `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user_name || 'Khách')}&background=13ec49&color=fff`,
                    time: new Date(c.created_at).toLocaleDateString('vi-VN'),
                    likes: parseInt(c.reaction_count) || 0,
                    reactions: (c.reaction_types || []).map((type: string) => emojiMap[type] || '👍'),
                    replies: []
                });
            });

            rawComments.forEach((c: any) => {
                if (c.parent_id && map.has(c.parent_id)) {
                    map.get(c.parent_id).replies.push(map.get(c.id));
                } else {
                    tree.push(map.get(c.id));
                }
            });

            setComments(tree);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const updateStats = async () => {
        try {
            const response = await getCommentStats('FARM', FARM_ID);
            setCommentStats(response.data);
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    };

    // Socket.io initialization
    React.useEffect(() => {
        // Kết nối socket
        const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : undefined;
        const socket = io(socketUrl, {
            transports: ['websocket', 'polling'],
            withCredentials: true
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('✅ Connected to Real-time server');
            socket.emit('join_comment_room', ROOM_NAME);
        });

        // Lắng nghe bình luận mới
        socket.on('new_comment', (comment: any) => {
            updateStats();
            setComments(prev => {
                // Kiểm tra xem bình luận đã tồn tại chưa (để tránh lặp khi chính người gửi nhận được socket)
                const exists = (nodes: any[]): boolean => {
                    for (const node of nodes) {
                        if (node.id === comment.id) return true;
                        if (node.replies?.length > 0 && exists(node.replies)) return true;
                    }
                    return false;
                };

                if (exists(prev)) return prev;

                const emojiMap: any = { like: '👍', love: '❤️', haha: '😂', wow: '😮', sad: '😢', angry: '😡' };
                const formatted = {
                    ...comment,
                    user: comment.user_name || 'Khách',
                    avatar: comment.avatar_id ? getMediaUrl(comment.avatar_id) : `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user_name || 'Khách')}&background=13ec49&color=fff`,
                    time: 'Vừa xong',
                    likes: 0,
                    reactions: [],
                    replies: []
                };

                if (comment.parent_id) {
                    // Cập nhật reply vào cây
                    const updateTree = (nodes: any[]): any[] => {
                        return nodes.map(node => {
                            if (node.id === comment.parent_id) {
                                // Tránh lặp trong mảng replies
                                if (node.replies.some((r: any) => r.id === comment.id)) return node;
                                return { ...node, replies: [...(node.replies || []), formatted] };
                            }
                            if (node.replies?.length > 0) {
                                return { ...node, replies: updateTree(node.replies) };
                            }
                            return node;
                        });
                    };
                    return updateTree(prev);
                }
                return [formatted, ...prev];
            });
        });

        // Lắng nghe cập nhật reaction
        socket.on('update_reaction', (data: any) => {
            const emojiMap: any = { like: '👍', love: '❤️', haha: '😂', wow: '😮', sad: '😢', angry: '😡' };
            const updateReactionInTree = (nodes: any[]): any[] => {
                return nodes.map(node => {
                    if (node.id === data.comment_id) {
                        return {
                            ...node,
                            likes: parseInt(data.reaction_count),
                            reactions: (data.reaction_types || []).map((t: string) => emojiMap[t] || '👍')
                        };
                    }
                    if (node.replies?.length > 0) {
                        return { ...node, replies: updateReactionInTree(node.replies) };
                    }
                    return node;
                });
            };
            setComments(prev => updateReactionInTree(prev));
        });

        // Lắng nghe sự kiện xóa
        socket.on('delete_comment', (data: any) => {
            updateStats();
            const deleteInTree = (nodes: any[]): any[] => {
                return nodes
                    .filter(node => node.id !== data.id)
                    .map(node => ({
                        ...node,
                        replies: node.replies ? deleteInTree(node.replies) : []
                    }));
            };
            setComments(prev => deleteInTree(prev));
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleSubmitComment = async () => {
        // Kiểm tra đăng nhập
        if (!user) {
            if (confirm('Bạn cần đăng nhập để bình luận. Chuyển đến trang đăng nhập?')) {
                navigate('/login');
            }
            return;
        }

        if (!newComment.trim()) return;
        setIsSubmitting(true);
        try {
            const response = await createComment({
                content: newComment,
                rating: rating,
                commentable_type: 'FARM',
                commentable_id: FARM_ID
            });

            // Cập nhật UI ngay lập tức cho người gửi (chỉ thêm nếu socket chưa thêm)
            setComments(prev => {
                const comment = response.data;
                // Kiểm tra xem socket đã thêm bình luận này chưa (để tránh lặp)
                const exists = (nodes: any[]): boolean => {
                    for (const node of nodes) {
                        if (node.id === comment.id) return true;
                        if (node.replies?.length > 0 && exists(node.replies)) return true;
                    }
                    return false;
                };

                if (exists(prev)) return prev;

                const formatted = {
                    ...comment,
                    user: user?.full_name || 'Tôi',
                    avatar: comment.avatar_id ? getMediaUrl(comment.avatar_id) : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'Tôi')}&background=13ec49&color=fff`,
                    time: 'Vừa xong',
                    likes: 0,
                    reactions: [],
                    replies: []
                };
                return [formatted, ...prev];
            });
            updateStats();

            setNewComment('');
            setRating(5);
        } catch (error) {
            console.error('Error posting comment:', error);
            alert('Có lỗi khi gửi bình luận. Vui lòng thử lại!');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitReply = async (parentId: string) => {
        // Kiểm tra đăng nhập
        if (!user) {
            if (confirm('Bạn cần đăng nhập để phản hồi. Chuyển đến trang đăng nhập?')) {
                navigate('/login');
            }
            return;
        }

        if (!replyContent.trim()) return;
        setIsSubmitting(true);
        try {
            const response = await createComment({
                commentable_type: 'FARM',
                commentable_id: FARM_ID,
                content: replyContent,
                parent_id: parentId,
                rating: 5
            });

            // Cập nhật UI ngay lập tức cho người gửi (chỉ thêm nếu socket chưa thêm)
            setComments(prev => {
                const comment = response.data;
                const exists = (nodes: any[]): boolean => {
                    for (const node of nodes) {
                        if (node.id === comment.id) return true;
                        if (node.replies?.length > 0 && exists(node.replies)) return true;
                    }
                    return false;
                };

                if (exists(prev)) return prev;

                const formatted = {
                    ...comment,
                    user: user?.full_name || 'Tôi',
                    avatar: comment.avatar_id ? getMediaUrl(comment.avatar_id) : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'Tôi')}&background=13ec49&color=fff`,
                    time: 'Vừa xong',
                    likes: 0,
                    reactions: [],
                    replies: []
                };

                const updateTree = (nodes: any[]): any[] => {
                    return nodes.map(node => {
                        if (node.id === parentId) {
                            if (node.replies.some((r: any) => r.id === formatted.id)) return node;
                            return { ...node, replies: [...(node.replies || []), formatted] };
                        }
                        if (node.replies?.length > 0) {
                            return { ...node, replies: updateTree(node.replies) };
                        }
                        return node;
                    });
                };
                return updateTree(prev);
            });
            updateStats();

            setReplyContent('');
            setReplyingTo(null);
        } catch (error) {
            console.error('Error posting reply:', error);
            alert('Có lỗi khi gửi phản hồi. Vui lòng thử lại!');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (id: string) => {
        try {
            await deleteComment(id);

            // Cập nhật UI ngay lập tức cho người thực hiện
            const deleteInTree = (nodes: any[]): any[] => {
                return nodes
                    .filter(node => node.id !== id)
                    .map(node => ({
                        ...node,
                        replies: node.replies ? deleteInTree(node.replies) : []
                    }));
            };

            setComments(prev => deleteInTree(prev));
            updateStats();
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('Không thể xóa bình luận này.');
        }
    };

    const handleShowReactions = async (commentId: string) => {
        try {
            const response = await getReactionDetails(commentId);
            setReactionDetails(response.data);
            setShowReactionModal(true);
        } catch (error) {
            console.error('Error fetching reaction details:', error);
        }
    };

    const handleReaction = async (commentId: string, type: string) => {
        // Kiểm tra đăng nhập
        if (!user) {
            if (confirm('Bạn cần đăng nhập để bày tỏ cảm xúc. Chuyển đến trang đăng nhập?')) {
                navigate('/login');
            }
            return;
        }

        try {
            await addReaction(commentId, type);

            // Cập nhật UI ngay lập tức
            const emojiMap: any = { like: '👍', love: '❤️', haha: '😂', wow: '😮', sad: '😢', angry: '😡' };
            const updateReactionInTree = (nodes: any[]): any[] => {
                return nodes.map(node => {
                    if (node.id === commentId) {
                        // Lưu ý: Đây là cập nhật tạm thời phía client, socket sẽ gửi về số lượng chuẩn xác nhất
                        const currentReactions = node.reactions || [];
                        const icon = emojiMap[type] || '👍';
                        return {
                            ...node,
                            likes: (node.likes || 0) + (currentReactions.includes(icon) ? 0 : 1),
                            reactions: Array.from(new Set([...currentReactions, icon]))
                        };
                    }
                    if (node.replies?.length > 0) {
                        return { ...node, replies: updateReactionInTree(node.replies) };
                    }
                    return node;
                });
            };
            setComments(prev => updateReactionInTree(prev));
        } catch (error: any) {
            console.error('Error adding reaction:', error);
            if (error.response?.status === 403) {
                alert('Bạn không có quyền bày tỏ cảm xúc. Vui lòng kiểm tra lại quyền hạn.');
            } else {
                alert('Không thể thực hiện. Vui lòng thử lại sau.');
            }
        }
    };


    const handleShare = async () => {
        const shareData = {
            title: 'Vườn Nhà Mình',
            text: 'Ghé thăm vườn mận hữu cơ chất lượng cao tại Mỹ Tho, Tiền Giang!',
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Share cancelled or failed');
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            } catch (err) {
                alert('Không thể sao chép liên kết');
            }
        }
    };

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch media - filter by 'gallery' for Hero
                const mediaResponse = await getMediaFiles({ page: 1, limit: 10, category: 'gallery' });
                if (mediaResponse?.data) {
                    setRecentMedia(mediaResponse.data);
                    setTotalMediaCount(mediaResponse.pagination?.total || 0);
                }

                // Fetch farm images specifically
                const farmResponse = await getFarmImages(4);
                if (farmResponse?.data) {
                    setFarmImages(farmResponse.data);
                    setTotalFarmImagesCount(farmResponse.total || 0);
                }

                // Fetch comments
                fetchComments();
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        };
        fetchData();
    }, []);

    const handleOpenGallery = async () => {
        setShowGalleryModal(true);
        if (farmImages.length < totalFarmImagesCount) {
            try {
                const response = await getFarmImages(100);
                setFarmImages(response.data);
            } catch (error) {
                console.error('Error fetching all gallery:', error);
            }
        }
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f8f6]">
            {/* Top Navigation Bar */}
            <ShowcaseHeader />

            <div className="layout-container flex h-full grow flex-col">
                <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-8">
                    <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 gap-8">

                        {/* Page Heading & Hero Section */}
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-wrap justify-between items-end gap-4 p-4 border-b border-gray-100 pb-6">
                                <div className="flex min-w-72 flex-col gap-2">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="bg-[#13ec49]/20 text-[#13ec49] text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Welcome</span>
                                        <span className="flex items-center gap-1 bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-full border border-gray-200 shadow-sm">
                                            <span className="material-symbols-outlined text-[14px]">visibility</span>
                                            {(visitorCount || 0).toLocaleString('vi-VN')}
                                        </span>
                                        <span className="flex items-center gap-1 bg-red-50 text-red-400 text-[10px] font-bold px-2 py-1 rounded-full border border-red-100 shadow-sm">
                                            <span className="material-symbols-outlined text-[14px]">favorite</span>
                                            {(favoriteCount || 0).toLocaleString('vi-VN')}
                                        </span>
                                        {/* Share & Favorite buttons - same row as badges */}
                                        <button
                                            onClick={handleShare}
                                            className="flex items-center gap-1 bg-white border border-gray-200 text-gray-600 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">share</span>
                                            Chia sẻ
                                        </button>
                                        <button
                                            onClick={handleFavorite}
                                            className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-sm transition-all active:scale-95 ${isFavorited
                                                ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-400'
                                                }`}
                                        >
                                            <span className={`material-symbols-outlined text-[14px] ${isFavorited ? 'fill-1' : ''}`}>favorite</span>
                                            Yêu thích
                                        </button>
                                    </div>
                                    <h1 className="text-[#111813] text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">Vườn Nhà Mình</h1>
                                    <p className="text-[#13ec49] font-bold text-lg italic -mt-1 mb-2">Đất lành, trái ngọt.</p>
                                    <div className="flex items-center gap-2 text-[#61896b]">
                                        <span className="material-symbols-outlined text-[20px]">location_on</span>
                                        <p className="text-base font-normal leading-normal">Mỹ Tho, Tiền Giang, Việt Nam</p>
                                    </div>
                                </div>
                            </div>

                            {/* Featured Image (Hero Slider) */}
                            <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden relative group">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>

                                <div className="absolute bottom-6 left-6 z-20 text-white animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h3 className="text-2xl md:text-3xl font-bold drop-shadow-lg">
                                        {recentMedia[heroIndex]?.image_name?.replace(/\.[^/.]+$/, "") || "Mùa Thu hoạch 2026"}
                                    </h3>
                                    <p className="opacity-90 font-medium drop-shadow-md">
                                        {recentMedia[heroIndex] ? "Khoảnh khắc tuyệt đẹp tại vườn mận" : "Vườn mận chín vàng rộm vào mùa hè"}
                                    </p>
                                </div>

                                {/* Navigation Arrows */}
                                {recentMedia.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setHeroIndex(prev => (prev === 0 ? recentMedia.length - 1 : prev - 1))}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
                                        >
                                            <span className="material-symbols-outlined text-3xl">chevron_left</span>
                                        </button>
                                        <button
                                            onClick={() => setHeroIndex(prev => (prev === recentMedia.length - 1 ? 0 : prev + 1))}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
                                        >
                                            <span className="material-symbols-outlined text-3xl">chevron_right</span>
                                        </button>

                                        {/* Pagination Dots */}
                                        <div className="absolute bottom-6 right-6 z-20 flex gap-1.5">
                                            {recentMedia.map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === heroIndex ? 'w-6 bg-[#13ec49]' : 'w-1.5 bg-white/40'}`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}

                                {recentMedia[heroIndex]?.mime_type?.startsWith('video/') ? (
                                    <video
                                        key={heroIndex}
                                        src={getMediaUrl(recentMedia[heroIndex].id)}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 animate-in fade-in duration-500"
                                    />
                                ) : (
                                    <div
                                        key={heroIndex}
                                        className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-700 hover:scale-105 animate-in fade-in duration-500"
                                        style={{ backgroundImage: `url("${recentMedia[heroIndex] ? getMediaUrl(recentMedia[heroIndex].id) : 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200'}")` }}
                                    ></div>
                                )}

                                <button
                                    onClick={handleOpenGallery}
                                    className="absolute top-4 right-4 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white transition-colors"
                                >
                                    <span className="material-symbols-outlined">fullscreen</span>
                                </button>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4">

                            {/* Left Column: Info & Stats */}
                            <div className="lg:col-span-2 flex flex-col gap-10">

                                {/* About Section */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-[#13ec49]/10 rounded-lg text-[#13ec49]">
                                            <span className="material-symbols-outlined">history_edu</span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-[#111813]">Hành Trình Phát Triển Của Vườn Nhà</h2>
                                    </div>

                                    <div className={`relative transition-all duration-500 overflow-hidden ${!showFullAbout ? 'max-h-[220px]' : 'max-h-[2000px]'}`}>
                                        <p className="text-[#3c4740] text-lg font-medium leading-relaxed mb-4 italic">
                                            Từ những ngày đầu khai khẩn, khu vườn của gia đình chúng tôi đã trải qua một hành trình dài hơn hai thập kỷ, gắn liền với sự thay đổi của thổ nhưỡng và tâm huyết của những người làm vườn thực thụ.
                                        </p>

                                        <div className="flex flex-col gap-6">
                                            <div className="bg-white/50 p-4 rounded-xl border-l-4 border-[#13ec49]">
                                                <h3 className="text-[#111813] font-bold text-lg mb-2">1. Những bước đi đầu tiên (2003 - 2013)</h3>
                                                <p className="text-[#3c4740] text-base leading-relaxed">
                                                    Câu chuyện bắt đầu từ năm 2003, khi những gốc táo đầu tiên được đặt xuống đất. Sau đó, gia đình quyết định chuyển đổi sang trồng vú sữa – loại cây cho bóng mát và giá trị kinh tế cao thời bấy giờ. Đến năm 2006, cây mận chính thức xuất hiện trong vườn, ban đầu chỉ là những gốc trồng xen kẽ dưới tán vú sữa.
                                                </p>
                                            </div>

                                            <div className="bg-white/50 p-4 rounded-xl border-l-4 border-blue-400">
                                                <h3 className="text-[#111813] font-bold text-lg mb-2">2. Bước ngoặt và sự chuyên canh (2014 - 2024)</h3>
                                                <p className="text-[#3c4740] text-base leading-relaxed mb-3">
                                                    Năm 2014 đánh dấu một quyết định quan trọng: Chúng tôi nhận thấy những cây vú sữa lâu năm phát triển quá cao, gây khó khăn và nguy hiểm trong khâu thu hoạch cũng như chăm sóc. Với mục tiêu tối ưu hóa năng suất, gia đình đã quyết định chặt bỏ vú sữa để tập trung toàn lực vào cây mận.
                                                </p>
                                                <p className="text-[#3c4740] text-base leading-relaxed">
                                                    Kể từ đó, mận trở thành nguồn thu nhập chính và là niềm tự hào của vườn. Để tận dụng tối đa diện tích đất và tạo hệ sinh thái đa dạng, chúng tôi còn trồng xen canh thêm hạnh (quất) và dứa (khóm). Mô hình "lấy ngắn nuôi dài" này không chỉ giúp giữ ẩm cho đất mà còn mang lại nguồn thu phụ ổn định quanh năm.
                                                </p>
                                            </div>

                                            <div className="bg-white/50 p-4 rounded-xl border-l-4 border-orange-400">
                                                <h3 className="text-[#111813] font-bold text-lg mb-2">3. Tầm nhìn mới: Kết hợp chăn nuôi bền vững (2025)</h3>
                                                <p className="text-[#3c4740] text-base leading-relaxed mb-3">
                                                    Không dừng lại ở việc canh tác cây ăn trái, giữa năm 2025, cha tôi đã tiên phong triển khai thêm mô hình nuôi ếch. Đây là bước đi chiến lược nhằm:
                                                </p>
                                                <ul className="list-none space-y-2 ml-2">
                                                    <li className="flex gap-2 text-[#3c4740] text-base">
                                                        <span className="text-[#13ec49] font-bold">•</span>
                                                        <span><strong>Tận dụng nguồn nước:</strong> Kết hợp mương vườn sẵn có để nuôi ếch.</span>
                                                    </li>
                                                    <li className="flex gap-2 text-[#3c4740] text-base">
                                                        <span className="text-[#13ec49] font-bold">•</span>
                                                        <span><strong>Tăng giá trị kinh tế:</strong> Đa dạng hóa sản phẩm cung ứng ra thị trường ngoài trái cây tươi.</span>
                                                    </li>
                                                    <li className="flex gap-2 text-[#3c4740] text-base">
                                                        <span className="text-[#13ec49] font-bold">•</span>
                                                        <span><strong>Hướng tới nông nghiệp tuần hoàn:</strong> Tận dụng phụ phẩm nông nghiệp và tạo ra nguồn phân bón hữu cơ tự nhiên từ chất thải của ếch để nuôi dưỡng ngược lại cho gốc mận.</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>

                                        {!showFullAbout && (
                                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f6f8f6] to-transparent pointer-events-none"></div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setShowFullAbout(!showFullAbout)}
                                        className="flex items-center gap-2 text-[#13ec49] font-bold text-sm w-fit hover:underline pt-2"
                                    >
                                        <span className="material-symbols-outlined">{showFullAbout ? 'expand_less' : 'expand_more'}</span>
                                        {showFullAbout ? 'Thu gọn' : 'Xem thêm'}
                                    </button>
                                </div>

                                {/* Stats Grid - horizontal scroll on mobile, grid on sm+ */}
                                <div className="flex sm:grid sm:grid-cols-3 gap-3 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                                    <div className="flex flex-col gap-3 rounded-xl border border-[#dbe6de] bg-white p-4 shadow-sm hover:border-[#13ec49]/50 transition-colors cursor-default group min-w-[160px] sm:min-w-0 shrink-0 sm:shrink">
                                        <div className="text-[#13ec49] bg-[#13ec49]/10 w-fit p-2.5 rounded-full mb-1 group-hover:bg-[#13ec49] group-hover:text-[#102215] transition-colors">
                                            <span className="material-symbols-outlined text-[24px]">verified</span>
                                        </div>
                                        <div>
                                            <h3 className="text-[#111813] text-base font-bold">Đang cập nhật</h3>
                                            <p className="text-[#61896b] text-xs">Chứng nhận VietGAP</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 rounded-xl border border-[#dbe6de] bg-white p-4 shadow-sm hover:border-[#13ec49]/50 transition-colors cursor-default group min-w-[160px] sm:min-w-0 shrink-0 sm:shrink">
                                        <div className="text-[#13ec49] bg-[#13ec49]/10 w-fit p-2.5 rounded-full mb-1 group-hover:bg-[#13ec49] group-hover:text-[#102215] transition-colors">
                                            <span className="material-symbols-outlined text-[24px]">landscape</span>
                                        </div>
                                        <div>
                                            <h3 className="text-[#111813] text-base font-bold">2.5 Hecta</h3>
                                            <p className="text-[#61896b] text-xs">Diện tích canh tác</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 rounded-xl border border-[#dbe6de] bg-white p-4 shadow-sm hover:border-[#13ec49]/50 transition-colors cursor-default group min-w-[160px] sm:min-w-0 shrink-0 sm:shrink">
                                        <div className="text-[#13ec49] bg-[#13ec49]/10 w-fit p-2.5 rounded-full mb-1 group-hover:bg-[#13ec49] group-hover:text-[#102215] transition-colors">
                                            <span className="material-symbols-outlined text-[24px]">history</span>
                                        </div>
                                        <div>
                                            <h3 className="text-[#111813] text-base font-bold">Thành lập 2003</h3>
                                            <p className="text-[#61896b] text-xs">Hành trình 23 năm</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Farm Images Gallery */}
                                <div className="flex flex-col gap-4 mt-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-[#13ec49]/10 rounded-lg text-[#13ec49]">
                                                <span className="material-symbols-outlined">photo_library</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-[#111813]">Hình ảnh của vườn {totalFarmImagesCount > 0 && `(${totalFarmImagesCount})`}</h3>
                                        </div>
                                        <button
                                            onClick={handleOpenGallery}
                                            className="text-[#13ec49] text-sm font-bold hover:underline"
                                        >
                                            Xem tất cả →
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[0, 1, 2, 3].map((index) => {
                                            const media = farmImages[index];
                                            const isLast = index === 3 && totalFarmImagesCount > 4;

                                            return (
                                                <div
                                                    key={index}
                                                    onClick={() => media && setSelectedMediaItem(media)}
                                                    className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#13ec49] transition-all relative group shadow-sm"
                                                >
                                                    {media ? (
                                                        <>
                                                            {media.mime_type?.startsWith('video/') ? (
                                                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-white">
                                                                    <span className="material-symbols-outlined text-3xl">movie</span>
                                                                    <span className="text-[10px] mt-1">VIDEO</span>
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    className="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-110"
                                                                    style={{ backgroundImage: `url("${getMediaUrl(media.id)}")` }}
                                                                ></div>
                                                            )}
                                                            {isLast && (
                                                                <div
                                                                    className="absolute inset-0 bg-black/60 flex items-center justify-center text-center z-20"
                                                                    onClick={(e) => { e.stopPropagation(); handleOpenGallery(); }}
                                                                >
                                                                    <span className="text-white font-bold text-lg">+{totalFarmImagesCount - 4}</span>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-200/50 text-gray-300">
                                                            <span className="material-symbols-outlined text-4xl">image</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Reviews & Comments Section */}
                                <div className="flex flex-col gap-6 mt-6 pb-10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-[#13ec49]/10 rounded-lg text-[#13ec49]">
                                                <span className="material-symbols-outlined">reviews</span>
                                            </div>
                                            <h2 className="text-lg md:text-2xl font-bold text-[#111813] whitespace-nowrap">Đánh giá & Bình luận</h2>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                                            <span className="text-[#f59e0b] material-symbols-outlined fill-1">star</span>
                                            <span className="font-bold text-[#111813]">{commentStats.avg_rating || '0.0'}</span>
                                            <span className="text-gray-400 text-xs">({commentStats.total_count} đánh giá)</span>
                                        </div>
                                    </div>

                                    {/* Add Comment Input */}
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4">
                                        <div className="size-10 rounded-full bg-gray-100 shrink-0 overflow-hidden border">
                                            <img
                                                src={user?.avatar_id ? getMediaUrl(user.avatar_id) : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'Me')}&background=13ec49&color=fff`}
                                                alt="Me"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col gap-3">
                                            <textarea
                                                placeholder="Chia sẻ cảm nghĩ của bạn về vườn..."
                                                className="w-full bg-[#f8faf8] border-none rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#13ec49] focus:bg-white transition-all resize-none h-20"
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                disabled={isSubmitting}
                                            ></textarea>
                                            <div className="flex justify-between items-center">
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <span
                                                            key={s}
                                                            onClick={() => setRating(s)}
                                                            className={`material-symbols-outlined cursor-pointer hover:text-[#f59e0b] transition-colors text-xl ${s <= rating ? 'text-[#f59e0b] fill-1' : 'text-gray-300'}`}
                                                        >
                                                            star
                                                        </span>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={handleSubmitComment}
                                                    disabled={isSubmitting || !newComment.trim()}
                                                    className="bg-[#13ec49] text-[#102215] px-6 py-2 rounded-lg font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* List of Comments */}
                                    <div className="flex flex-col gap-8">
                                        {comments.slice(0, visibleCommentsCount).map((comment) => (
                                            <CommentItem
                                                key={comment.id}
                                                comment={comment}
                                                replyingTo={replyingTo}
                                                setReplyingTo={setReplyingTo}
                                                replyContent={replyContent}
                                                setReplyContent={setReplyContent}
                                                handleSubmitReply={handleSubmitReply}
                                                isSubmitting={isSubmitting}
                                                handleReaction={handleReaction}
                                                handleDelete={handleDeleteComment}
                                                onShowReactions={handleShowReactions}
                                                user={user}
                                            />
                                        ))}
                                    </div>

                                    {/* Reactions Details Modal */}
                                    {showReactionModal && (
                                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                                            <div
                                                className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#f8faf8]">
                                                    <h3 className="text-lg font-bold text-[#111813] flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-primary">favorite</span>
                                                        Cảm xúc dữ liệu
                                                    </h3>
                                                    <button
                                                        onClick={() => setShowReactionModal(false)}
                                                        className="size-8 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-gray-400">close</span>
                                                    </button>
                                                </div>
                                                <div className="max-h-[60vh] overflow-y-auto p-2">
                                                    {reactionDetails.length > 0 ? (
                                                        <div className="flex flex-col">
                                                            {reactionDetails.map((react, i) => (
                                                                <div key={i} className="flex items-center gap-4 p-3 hover:bg-[#f0f4f1] rounded-2xl transition-colors">
                                                                    <div className="size-10 rounded-full bg-gray-200 shrink-0 overflow-hidden border-2 border-white shadow-sm">
                                                                        <img
                                                                            src={react.avatar_id ? getMediaUrl(react.avatar_id) : `https://ui-avatars.com/api/?name=${encodeURIComponent(react.user_name)}&background=13ec49&color=fff`}
                                                                            alt={react.user_name}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="font-bold text-sm text-[#111813]">{react.user_name}</p>
                                                                    </div>
                                                                    <div className="text-2xl drop-shadow-sm transform hover:scale-125 transition-transform">
                                                                        {react.reaction_type === 'like' && '👍'}
                                                                        {react.reaction_type === 'love' && '❤️'}
                                                                        {react.reaction_type === 'haha' && '😂'}
                                                                        {react.reaction_type === 'wow' && '😮'}
                                                                        {react.reaction_type === 'sad' && '😢'}
                                                                        {react.reaction_type === 'angry' && '😡'}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="py-10 text-center text-gray-400">
                                                            <span className="material-symbols-outlined text-4xl mb-2 opacity-20">sentiment_neutral</span>
                                                            <p className="text-sm font-medium">Chưa có cảm xúc nào</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-4 bg-[#f8faf8] border-t border-gray-100 flex justify-center">
                                                    <button
                                                        onClick={() => setShowReactionModal(false)}
                                                        className="px-8 py-2 bg-primary text-white rounded-full font-bold text-sm shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all"
                                                    >
                                                        Đóng
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="absolute inset-0 -z-10" onClick={() => setShowReactionModal(false)}></div>
                                        </div>
                                    )}

                                    {comments.length > visibleCommentsCount && (
                                        <button
                                            onClick={() => setVisibleCommentsCount(prev => prev + 5)}
                                            className="w-full py-3 bg-white border border-gray-100 rounded-xl text-primary font-bold text-sm hover:bg-primary/5 transition-all shadow-sm flex items-center justify-center gap-2 mt-4"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">expand_more</span>
                                            Xem thêm {comments.length - visibleCommentsCount} bình luận...
                                        </button>
                                    )}

                                    {visibleCommentsCount > 3 && (
                                        <button
                                            onClick={() => setVisibleCommentsCount(3)}
                                            className="text-center text-xs text-gray-400 hover:text-primary transition-colors py-2"
                                        >
                                            Thu gọn bình luận
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Gallery Grid & Contact */}
                            <div className="flex flex-col gap-6">



                                <WeatherWidget />

                                {/* Location & Contact */}
                                <div className="bg-white p-0 rounded-2xl border border-[#dbe6de] shadow-sm overflow-hidden flex flex-col">
                                    <div className="h-64 bg-gray-200 relative">
                                        <iframe
                                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d981.1265571161107!2d106.2545571274932!3d10.38130837899188!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310abb777529f873%3A0x5cb1dc2a4a25519e!2zTG9uZyDEkOG7i25oLCBUaMOgbmggcGjhu5EgTeG7uSBUaG8sIFRp4buBbiBHaWFuZywgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1768016922481!5m2!1svi!2s"
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen={true}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            title="Bản đồ vườn"
                                        ></iframe>
                                    </div>
                                    <div className="p-5 flex flex-col gap-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-[#111813] mb-1">Ghé thăm chúng tôi</h3>
                                            <p className="text-[#61896b] text-sm">Đông Hòa, Thành phố Mỹ Tho, Tiền Giang, Việt Nam</p>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="material-symbols-outlined text-[#13ec49]">call</span>
                                                <span className="text-[#111813]">0384 396 100</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="material-symbols-outlined text-[#13ec49]">mail</span>
                                                <span className="text-[#111813]">lmtuan21082003@gmail.com</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="material-symbols-outlined text-[#13ec49]">schedule</span>
                                                <span className="text-[#111813]">T2 - T7: 8:00 - 17:00</span>
                                            </div>
                                        </div>
                                        <button className="w-full mt-2 py-2 rounded-lg bg-[#f0f4f1] text-[#111813] font-bold text-sm hover:bg-gray-200 transition-colors">
                                            Chỉ đường
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Copyright */}
                <footer className="mt-auto border-t border-[#e5e9e6] bg-white py-8 px-10">
                    <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[#61896b] text-sm">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#13ec49]">agriculture</span>
                            <span className="font-bold text-[#111813]">GreenAcres</span>
                            <span className="mx-2">|</span>
                            <span>© {new Date().getFullYear()} Vườn Mận Lê Minh Tuấn. All rights reserved.</span>
                        </div>
                        <div className="flex gap-6">
                            <Link to="/showcase/privacy-policy" className="hover:text-[#13ec49] transition-colors">Chính sách bảo mật</Link>
                            <Link to="/showcase/terms-of-service" className="hover:text-[#13ec49] transition-colors">Điều khoản dịch vụ</Link>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Full Gallery Modal */}
            {showGalleryModal && (
                <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl w-full max-w-6xl max-h-full flex flex-col overflow-hidden shadow-2xl">
                        <div className="p-6 border-b flex items-center justify-between bg-white sticky top-0 z-10">
                            <h3 className="text-2xl font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#13ec49]">photo_library</span>
                                Bộ sưu tập ảnh vườn
                            </h3>
                            <button
                                onClick={() => setShowGalleryModal(false)}
                                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {farmImages.map((media) => (
                                    <div
                                        key={media.id}
                                        onClick={() => setSelectedMediaItem(media)}
                                        className="aspect-square bg-white rounded-xl overflow-hidden cursor-pointer hover:ring-4 hover:ring-[#13ec49] hover:scale-[1.02] transition-all shadow-sm group relative"
                                    >
                                        {media.mime_type?.startsWith('video/') ? (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-white">
                                                <span className="material-symbols-outlined text-4xl mb-1">movie</span>
                                                <span className="text-[10px] opacity-70 font-bold tracking-widest">VIDEO</span>
                                            </div>
                                        ) : (
                                            <img
                                                src={getMediaUrl(media.id)}
                                                className="w-full h-full object-cover"
                                                alt={media.image_name}
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                                            <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 scale-150 transition-all">
                                                {media.mime_type?.startsWith('video/') ? 'play_circle' : 'zoom_in'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Media Lightbox (Fullscreen view) */}
            {selectedMediaItem && (
                <div
                    className="fixed inset-0 bg-black/95 z-[110] flex items-center justify-center animate-in zoom-in duration-200 cursor-zoom-out"
                    onClick={() => setSelectedMediaItem(null)}
                >
                    <button className="absolute top-6 right-6 text-white text-4xl z-20">
                        <span className="material-symbols-outlined scale-150">close</span>
                    </button>

                    <div className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        {selectedMediaItem.mime_type?.startsWith('video/') ? (
                            <video
                                src={getMediaUrl(selectedMediaItem.id)}
                                controls
                                autoPlay
                                className="max-w-full max-h-[90vh] shadow-2xl rounded-lg"
                            />
                        ) : (
                            <img
                                src={getMediaUrl(selectedMediaItem.id)}
                                className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded-lg"
                                alt="Zoomed"
                            />
                        )}
                        <div className="absolute -bottom-10 left-0 right-0 text-center text-white/70 text-sm">
                            {selectedMediaItem.image_name}
                        </div>
                    </div>
                </div>
            )}

            {/* Share Toast Notification */}
            {showToast && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#111813] text-white px-6 py-3 rounded-full shadow-2xl z-[200] flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
                    <span className="material-symbols-outlined text-[#13ec49]">check_circle</span>
                    <span className="font-medium text-sm">Đã sao chép liên kết vào bộ nhớ tạm!</span>
                </div>
            )}

        </div>
    );
};

export default FarmShowcase;
