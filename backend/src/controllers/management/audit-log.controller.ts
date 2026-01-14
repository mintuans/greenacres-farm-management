import { Request, Response } from 'express';
import * as auditLogService from '../../services/audit-log.service';

export const getAuditLogs = async (req: Request, res: Response) => {
    try {
        const logs = await auditLogService.getAuditLogs();
        res.json({
            success: true,
            data: logs
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
