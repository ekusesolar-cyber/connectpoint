import axios from 'axios';
import crypto from 'crypto';
import { env } from '../config/env';

const flwClient = axios.create({
  baseURL: 'https://api.flutterwave.com/v3',
  headers: {
    Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

export interface FlwPaymentInitPayload {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url: string;
  customer: {
    email: string;
    phone_number?: string;
    name?: string;
  };
  meta?: Record<string, string>;
  customizations?: {
    title: string;
    description?: string;
    logo?: string;
  };
}

export interface FlwPaymentResponse {
  status: string;
  message: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    link: string;
  };
}

export async function initiatePayment(payload: FlwPaymentInitPayload): Promise<FlwPaymentResponse['data']> {
  const response = await flwClient.post<FlwPaymentResponse>('/payments', payload);
  if (response.data.status !== 'success') {
    throw new Error(response.data.message || 'Payment initiation failed');
  }
  return response.data.data;
}

export async function verifyPayment(txRef: string): Promise<{
  status: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerPhone?: string;
}> {
  const response = await flwClient.get(`/transactions/${txRef}/verify`);
  const { status, amount, currency, customer } = response.data.data;
  return {
    status,
    amount,
    currency,
    customerEmail: customer.email,
    customerPhone: customer.phone_number,
  };
}

export function verifyWebhookSignature(signature: string, payload: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', env.FLUTTERWAVE_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  return signature === expectedSignature;
}

import crypto from 'crypto';
