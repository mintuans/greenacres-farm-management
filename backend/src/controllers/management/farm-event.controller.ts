import { Request, Response } from 'express';
import * as farmEventService from '../../services/farm-event.service';

export const getFarmEvents = async (_req: Request, res: Response) => {
    try {
        const events = await farmEventService.getFarmEvents();
        res.json({ success: true, data: events });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createFarmEvent = async (req: Request, res: Response) => {
    try {
        const event = await farmEventService.createFarmEvent(req.body);
        res.status(201).json({ success: true, data: event });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateFarmEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const event = await farmEventService.updateFarmEvent(id, req.body);
        if (!event) {
            res.status(404).json({ success: false, message: 'Not found' });
            return;
        }
        res.json({ success: true, data: event });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteFarmEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await farmEventService.deleteFarmEvent(id);
        if (!result) {
            res.status(404).json({ success: false, message: 'Not found' });
            return;
        }
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
