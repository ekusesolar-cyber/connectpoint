import { Request, Response } from 'express';
import { PaymentService } from '../services/PaymentService';
import { env } from '../config/env';
import crypto from 'crypto';

export const initialize = async (req: Request, res: Response) => {
  try {
    const result = await PaymentService.initialize(req.body);
    res.json({ success: true, data: result });
  } catch {
    res.status(500).json({ success: false, error: 'Payment initialization failed' });
  }
};

export const verify = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    if (!reference) {
      res.status(400).json({ success: false, error: 'Reference is required' });
      return;
    }
    const result = await PaymentService.verify(reference);
    res.json({ success: true, data: result });
  } catch {
    res.status(500).json({ success: false, error: 'Verification failed' });
  }
};

export const handleFlutterwaveWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['verif-hash'] as string;
    if (!signature || signature !== env.FLUTTERWAVE_WEBHOOK_SECRET) {
      res.status(401).json({ status: 'error', message: 'Invalid signature' });
      return;
    }

    const result = await PaymentService.handleWebhook(req.body);
    res.json(result);
  } catch {
    res.status(500).json({ status: 'error', message: 'Webhook processing failed' });
  }
};

export const handlePaystackWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-paystack-signature'] as string;
    const payload = JSON.stringify(req.body);
    const expected = crypto
      .createHmac('sha512', env.FLUTTERWAVE_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    if (signature !== expected) {
      res.status(401).json({ status: 'error', message: 'Invalid signature' });
      return;
    }

    const event = req.body.event;
    if (event === 'charge.success') {
      const txRef = req.body.data.reference;
      await PaymentService.verify(txRef);
    }

    res.json({ status: 'success' });
  } catch {
    res.status(500).json({ status: 'error', message: 'Webhook processing failed' });
  }
};
