import { Request, Response } from 'express';
import * as farmEventService from '../../services/farm-event.service';
import { logActivity } from '../../services/audit-log.service';

export const getFarmEvents = async (_req: Request, res: Response): Promise<any> => {
    try {
        const events = await farmEventService.getFarmEvents();
        return res.json({ success: true, data: events });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const createFarmEvent = async (req: Request, res: Response): Promise<any> => {
    try {
        const event = await farmEventService.createFarmEvent(req.body);

        await logActivity(req, 'CREATE_FARM_EVENT', 'farm_events', event.id, null, req.body);

        return res.status(201).json({ success: true, data: event });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateFarmEvent = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const oldEvent = await farmEventService.getFarmEventById(id);
        const event = await farmEventService.updateFarmEvent(id, req.body);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Not found' });
        }

        await logActivity(req, 'UPDATE_FARM_EVENT', 'farm_events', id, oldEvent, req.body);

        return res.json({ success: true, data: event });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteFarmEvent = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const oldEvent = await farmEventService.getFarmEventById(id);
        const result = await farmEventService.deleteFarmEvent(id);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Not found' });
        }

        await logActivity(req, 'DELETE_FARM_EVENT', 'farm_events', id, oldEvent, null);

        return res.json({ success: true, message: 'Deleted successfully' });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
