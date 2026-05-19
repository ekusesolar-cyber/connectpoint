import { Router } from 'express';
import * as PaymentController from '../controllers/PaymentController';

const router = Router();

router.post('/initialize', PaymentController.initialize);
router.get('/verify/:reference', PaymentController.verify);
router.post('/webhook/flutterwave', PaymentController.handleFlutterwaveWebhook);
router.post('/webhook/paystack', PaymentController.handlePaystackWebhook);

export default router;
