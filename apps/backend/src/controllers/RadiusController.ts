import { Request, Response } from 'express';
import { RadiusService } from '../services/RadiusService';

export const createUser = async (req: Request, res: Response) => {
  try {
    const result = await RadiusService.createUser(req.body);
    res.status(201).json({ success: true, data: result });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to create RADIUS user' });
  }
};

export const disconnectUser = async (req: Request, res: Response) => {
  try {
    const result = await RadiusService.disconnectUser(req.params.id);
    res.json({ success: true, data: result });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to disconnect user' });
  }
};

export const accounting = async (req: Request, res: Response) => {
  try {
    const { username, acctsessionid, acctinputoctets, acctoutputoctets, acctsessiontime, acctstatustype } = req.body;

    await RadiusService.syncAccounting({
      username,
      sessionId: acctsessionid,
      acctInputOctets: acctinputoctets ? parseInt(acctinputoctets) : undefined,
      acctOutputOctets: acctoutputoctets ? parseInt(acctoutputoctets) : undefined,
      acctSessionTime: acctsessiontime ? parseInt(acctsessiontime) : undefined,
      acctStatusType: acctstatustype,
    });

    res.json({ status: 'received' });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to process accounting' });
  }
};

export const getActiveSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await RadiusService.getActiveSessions(req.params.hotspotId);
    res.json({ success: true, data: sessions });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to fetch sessions' });
  }
};
