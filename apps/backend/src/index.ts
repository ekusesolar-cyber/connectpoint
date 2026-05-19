import app from './app';
import { env } from './config/env';
import cron from 'node-cron';
import { RadiusService } from './services/RadiusService';

app.listen(env.PORT, () => {
  console.log(`[ConnectPoint] Backend running on port ${env.PORT}`);
  console.log(`[ConnectPoint] Environment: ${env.NODE_ENV}`);
  console.log(`[ConnectPoint] Frontend URL: ${env.FRONTEND_URL}`);
});

cron.schedule('*/1 * * * *', async () => {
  try {
    await RadiusService.checkAndExpireSessions();
  } catch (err) {
    console.error('[ConnectPoint] Session expiry check failed:', err);
  }
});

process.on('unhandledRejection', (reason) => {
  console.error('[ConnectPoint] Unhandled rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[ConnectPoint] Uncaught exception:', error);
  process.exit(1);
});
