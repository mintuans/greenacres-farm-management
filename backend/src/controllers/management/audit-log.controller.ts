import { Request, Response } from 'express';
import * as auditLogService from '../../services/audit-log.service';

export const getAuditLogs = async (_req: Request, res: Response): Promise<any> => {
    try {
        const logs = await auditLogService.getAuditLogs();
        return res.json({
            success: true,
            data: logs
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
