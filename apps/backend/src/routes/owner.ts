import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as OwnerController from '../controllers/OwnerController';

const router = Router();

router.use(authenticate);

router.get('/dashboard', OwnerController.getDashboard);
router.put('/profile', OwnerController.updateProfile);

router.get('/kyc', OwnerController.getKYC);
router.post('/kyc', OwnerController.submitKYC);

router.get('/hotspots', OwnerController.listHotspots);
router.post('/hotspots', OwnerController.createHotspot);
router.get('/hotspots/:id', OwnerController.getHotspot);
router.put('/hotspots/:id', OwnerController.updateHotspot);
router.delete('/hotspots/:id', OwnerController.deleteHotspot);

router.get('/packages', OwnerController.listPackages);
router.post('/packages', OwnerController.createPackage);
router.put('/packages/:id', OwnerController.updatePackage);
router.delete('/packages/:id', OwnerController.deletePackage);

router.post('/vouchers/generate', OwnerController.generateVoucher);
router.get('/vouchers', OwnerController.listVouchers);

router.get('/sessions/active', OwnerController.getActiveUsers);
router.post('/sessions/:id/disconnect', OwnerController.disconnectUser);
router.post('/customers/block', OwnerController.blockCustomer);

router.get('/revenue', OwnerController.getRevenue);
router.get('/transactions', OwnerController.getTransactions);
router.get('/reports/usage', OwnerController.getUsageReports);

router.get('/withdrawals', OwnerController.listWithdrawals);
router.post('/withdrawals', OwnerController.requestWithdrawal);

export default router;
