import { Request, Response } from 'express';
import * as showcaseEventService from '../../services/showcase-event.service';
import * as publicUserService from '../../services/public-user.service';

/**
 * Lấy danh sách sự kiện công khai (chỉ những sự kiện đã PUBLISHED hoặc ENDED)
 */
export const getPublicEvents = async (_req: Request, res: Response): Promise<any> => {
    try {
        const events = await showcaseEventService.getAllShowcaseEvents('PUBLISHED');

        // Lấy thêm người tham gia cho mỗi sự kiện
        const eventsWithParticipants = await Promise.all(events.map(async (event) => {
            const participants = await showcaseEventService.getParticipantsByEventId(event.id);
            return {
                ...event,
                participants
            };
        }));

        return res.json({ success: true, data: eventsWithParticipants });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Lấy chi tiết sự kiện công khai
 */
export const getPublicEventById = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const event = await showcaseEventService.getShowcaseEventById(id);

        if (!event || event.status === 'DRAFT') {
            return res.status(404).json({ success: false, message: 'Sự kiện không tồn tại hoặc chưa được công bố' });
        }

        const participants = await showcaseEventService.getParticipantsByEventId(id);
        return res.json({ success: true, data: { ...event, participants } });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Tham gia sự kiện (Dành cho user đã đăng nhập)
 */
export const joinEvent = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id: event_id } = req.params;
        const authUser = (req as any).user;

        if (!authUser) {
            return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập để tham gia sự kiện' });
        }

        // 1. Kiểm tra xem user này đã có trong bảng guests chưa
        let guest = await showcaseEventService.getGuestByUserId(authUser.id);

        // 2. Nếu chưa có, tạo mới guest từ thông thông tin user
        if (!guest) {
            // Lấy thông tin chi tiết từ DB để đảm bảo có full_name, phone, avatar_id
            const userData = await publicUserService.getPublicUserById(authUser.id);
            if (!userData) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin tài khoản' });
            }

            guest = await showcaseEventService.createGuest({
                full_name: userData.full_name || 'Khách mời',
                email: userData.email,
                phone: userData.phone || undefined,
                avatar_id: userData.avatar_id || undefined,
                user_id: userData.id,
                default_title: 'Thành viên mới'
            });
        }

        // 3. Kiểm tra xem đã tham gia sự kiện này chưa
        const alreadyJoined = await showcaseEventService.isAlreadyParticipant(event_id, guest.id);
        if (alreadyJoined) {
            return res.json({ success: true, message: 'Bạn đã tham gia sự kiện này rồi' });
        }

        // 4. Thêm vào danh sách tham gia
        await showcaseEventService.addParticipantToEvent({
            event_id,
            guest_id: guest.id,
            role_at_event: 'Thành viên',
            color_theme: 'green',
            is_vip: false,
            sort_order: 99
        });

        return res.json({ success: true, message: 'Tham gia sự kiện thành công' });
    } catch (error: any) {
        console.error('Error joining event:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
