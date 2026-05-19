import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import * as AdminController from '../controllers/AdminController';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/dashboard', AdminController.getDashboard);

router.get('/owners', AdminController.listOwners);
router.get('/owners/:id', AdminController.getOwnerDetail);
router.put('/owners/:id/suspend', AdminController.suspendOwner);

router.get('/kyc/pending', AdminController.getPendingKYC);
router.put('/kyc/:id/approve', AdminController.approveKYC);
router.put('/kyc/:id/reject', AdminController.rejectKYC);

router.get('/hotspots', AdminController.listAllHotspots);

router.get('/transactions', AdminController.listAllTransactions);

router.get('/commission', AdminController.getCommissionSettings);
router.put('/commission', AdminController.setCommission);

router.get('/subscriptions', AdminController.listSubscriptions);
router.put('/subscriptions/:id', AdminController.updateSubscription);

router.get('/analytics', AdminController.getAnalytics);

router.get('/audit-logs', AdminController.listAuditLogs);

export default router;
