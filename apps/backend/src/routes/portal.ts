import { Router } from 'express';
import * as PortalController from '../controllers/PortalController';

const router = Router();

router.get('/:hotspotId/info', PortalController.getHotspotInfo);
router.get('/:hotspotId/packages', PortalController.getPackages);
router.post('/:hotspotId/login/voucher', PortalController.voucherLogin);
router.post('/:hotspotId/purchase', PortalController.initiatePurchase);
router.get('/:hotspotId/sessions/:sessionId', PortalController.getSessionStatus);
router.post('/:hotspotId/terms', PortalController.submitTermsConsent);
router.get('/:hotspotId/ad', PortalController.getAd);

export default router;
