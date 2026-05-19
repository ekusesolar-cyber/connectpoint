import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import * as RadiusController from '../controllers/RadiusController';

const router = Router();

router.post('/user', authenticate, authorize('admin', 'hotspot_owner'), RadiusController.createUser);
router.post('/user/disconnect', authenticate, authorize('admin', 'hotspot_owner'), RadiusController.disconnectUser);
router.post('/accounting', RadiusController.accounting);
router.get('/sessions/:hotspotId', authenticate, authorize('admin', 'hotspot_owner'), RadiusController.getActiveSessions);

export default router;
