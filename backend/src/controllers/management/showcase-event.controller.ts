import { Request, Response } from 'express';
import * as showcaseEventService from '../../services/showcase-event.service';
import * as notificationService from '../../services/notification.service';

// --- Events ---
export const getEvents = async (req: Request, res: Response): Promise<any> => {
    try {
        const { status } = req.query;
        const events = await showcaseEventService.getAllShowcaseEvents(status as string);
        return res.json({ success: true, data: events });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getEventById = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const event = await showcaseEventService.getShowcaseEventById(id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        const participants = await showcaseEventService.getParticipantsByEventId(id);
        return res.json({ success: true, data: { ...event, participants } });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const createEvent = async (req: Request, res: Response): Promise<any> => {
    try {
        const event = await showcaseEventService.createShowcaseEvent(req.body);
        return res.status(201).json({ success: true, data: event });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateEvent = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const event = await showcaseEventService.updateShowcaseEvent(id, req.body);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
        return res.json({ success: true, data: event });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteEvent = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const deleted = await showcaseEventService.deleteShowcaseEvent(id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Event not found' });
        return res.json({ success: true, message: 'Event deleted successfully' });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// --- Guests ---
export const getGuests = async (_req: Request, res: Response): Promise<any> => {
    try {
        const guests = await showcaseEventService.getAllGuests();
        return res.json({ success: true, data: guests });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const createGuest = async (req: Request, res: Response): Promise<any> => {
    try {
        const guest = await showcaseEventService.createGuest(req.body);
        return res.status(201).json({ success: true, data: guest });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateGuest = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const guest = await showcaseEventService.updateGuest(id, req.body);
        if (!guest) return res.status(404).json({ success: false, message: 'Guest not found' });
        return res.json({ success: true, data: guest });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteGuest = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const deleted = await showcaseEventService.deleteGuest(id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Guest not found' });
        return res.json({ success: true, message: 'Guest deleted successfully' });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// --- Participants ---
export const addParticipant = async (req: Request, res: Response): Promise<any> => {
    try {
        const participant = await showcaseEventService.addParticipantToEvent(req.body);
        return res.status(201).json({ success: true, data: participant });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const removeParticipant = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const deleted = await showcaseEventService.removeParticipantFromEvent(id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Participant not found' });
        return res.json({ success: true, message: 'Participant removed successfully' });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateParticipantPermission = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const { can_upload_gallery } = req.body;
        const updated = await showcaseEventService.updateParticipantPermission(id, can_upload_gallery);
        if (!updated) return res.status(404).json({ success: false, message: 'Participant not found' });
        return res.json({ success: true, message: 'Permission updated successfully' });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// --- Greetings ---
export const getGreetings = async (req: Request, res: Response): Promise<any> => {
    try {
        const { eventId } = req.params;
        const greetings = await showcaseEventService.getGreetingsByEventId(eventId);
        return res.json({ success: true, data: greetings });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const upsertGreeting = async (req: Request, res: Response): Promise<any> => {
    try {
        const greeting = await showcaseEventService.createOrUpdateGreeting(req.body);
        return res.status(200).json({ success: true, data: greeting });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteGreeting = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const deleted = await showcaseEventService.deleteGreeting(id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Greeting not found' });
        return res.json({ success: true, message: 'Greeting deleted successfully' });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const sendGreetingNotification = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const greeting = await showcaseEventService.getGreetingById(id);
        if (!greeting) return res.status(404).json({ success: false, message: 'Greeting not found' });

        const event = await showcaseEventService.getShowcaseEventById(greeting.event_id);

        await notificationService.sendNotification({
            title: `Lời chúc từ sự kiện: ${event?.title || 'Sự kiện'}`,
            content: greeting.greeting_message,
            type: 'SUCCESS',
            category: 'EVENT',
            recipient_ids: [greeting.public_user_id],
            link: `/showcase/events/${greeting.event_id}`
        });

        return res.json({ success: true, message: 'Notification sent successfully' });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
