import nodemailer from 'nodemailer';
import { env } from '../config/env';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    if (env.SENDGRID_API_KEY) {
      transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: { user: 'apikey', pass: env.SENDGRID_API_KEY },
      });
    } else {
      transporter = nodemailer.createTransport({
        host: 'localhost',
        port: 1025,
        ignoreTLS: true,
      });
    }
  }
  return transporter;
}

export class EmailService {
  static async sendWelcomeEmail(email: string, name: string) {
    await getTransporter().sendMail({
      from: `"${env.SENDGRID_FROM_NAME}" <${env.SENDGRID_FROM_EMAIL}>`,
      to: email,
      subject: 'Welcome to ConnectPoint',
      html: `
        <h1>Welcome to ConnectPoint, ${name}!</h1>
        <p>Thank you for joining ConnectPoint. Start monetizing your hotspot today.</p>
        <p><a href="${env.FRONTEND_URL}/auth/login">Login to your dashboard</a></p>
      `,
    });
  }

  static async sendPasswordResetEmail(email: string, resetUrl: string) {
    await getTransporter().sendMail({
      from: `"${env.SENDGRID_FROM_NAME}" <${env.SENDGRID_FROM_EMAIL}>`,
      to: email,
      subject: 'Reset your ConnectPoint password',
      html: `
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password (valid for 1 hour):</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
  }

  static async sendKYCApprovedEmail(email: string, name: string) {
    await getTransporter().sendMail({
      from: `"${env.SENDGRID_FROM_NAME}" <${env.SENDGRID_FROM_EMAIL}>`,
      to: email,
      subject: 'KYC Approved - ConnectPoint',
      html: `
        <h1>KYC Approved!</h1>
        <p>Dear ${name}, your KYC verification has been approved.</p>
        <p>You can now create hotspots and start selling Wi-Fi packages.</p>
        <p><a href="${env.FRONTEND_URL}/dashboard/hotspots">Go to Dashboard</a></p>
      `,
    });
  }

  static async sendKYCRejectedEmail(email: string, name: string, reason: string) {
    await getTransporter().sendMail({
      from: `"${env.SENDGRID_FROM_NAME}" <${env.SENDGRID_FROM_EMAIL}>`,
      to: email,
      subject: 'KYC Update - ConnectPoint',
      html: `
        <h1>KYC Update</h1>
        <p>Dear ${name}, your KYC verification was not approved.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please resubmit with correct documents.</p>
        <p><a href="${env.FRONTEND_URL}/dashboard/kyc">Resubmit KYC</a></p>
      `,
    });
  }

  static async sendWithdrawalProcessedEmail(email: string, name: string, amount: number, status: string) {
    await getTransporter().sendMail({
      from: `"${env.SENDGRID_FROM_NAME}" <${env.SENDGRID_FROM_EMAIL}>`,
      to: email,
      subject: `Withdrawal ${status} - ConnectPoint`,
      html: `
        <h1>Withdrawal ${status}</h1>
        <p>Dear ${name}, your withdrawal request for <strong>${amount.toLocaleString()} XAF</strong> has been <strong>${status}</strong>.</p>
        <p><a href="${env.FRONTEND_URL}/dashboard/withdrawals">View Details</a></p>
      `,
    });
  }
}
