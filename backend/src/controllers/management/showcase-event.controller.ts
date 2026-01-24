import { Request, Response } from 'express';
import * as showcaseEventService from '../../services/showcase-event.service';

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
