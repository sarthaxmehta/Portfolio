import nodemailer from 'nodemailer';
import { prisma } from './prisma';

export interface EmailAlertOptions {
  type: 'SUCCESS' | 'FAILED' | '2FA_FAILED' | 'PASSCODE_CHANGED' | '2FA_ENABLED' | '2FA_DISABLED';
  ip?: string;
  userAgent?: string;
  details?: string;
}

/**
 * Get active SMTP configuration from DB or process.env
 */
export async function getSmtpConfig() {
  try {
    const settings = await prisma.adminSetting.findMany({
      where: {
        key: {
          in: ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'alert_email_to'],
        },
      },
    });

    const configMap: Record<string, string> = {};
    settings.forEach((s) => {
      configMap[s.key] = s.value;
    });

    return {
      host: configMap['smtp_host'] || process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(configMap['smtp_port'] || process.env.SMTP_PORT || '465', 10),
      user: configMap['smtp_user'] || process.env.SMTP_USER || '',
      pass: configMap['smtp_pass'] || process.env.SMTP_PASS || '',
      to: configMap['alert_email_to'] || process.env.ALERT_EMAIL_TO || configMap['smtp_user'] || process.env.SMTP_USER || 'sarthakm.cs.24@nitj.ac.in',
    };
  } catch (err) {
    console.error('Error loading SMTP config:', err);
    return {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '465', 10),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
      to: process.env.ALERT_EMAIL_TO || 'sarthakm.cs.24@nitj.ac.in',
    };
  }
}

/**
 * Save custom SMTP credentials to DB (e.g. Gmail address & App Password)
 */
export async function updateSmtpConfig(config: {
  host: string;
  port: number;
  user: string;
  pass: string;
  to: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const entries = [
      { key: 'smtp_host', value: config.host },
      { key: 'smtp_port', value: String(config.port) },
      { key: 'smtp_user', value: config.user },
      { key: 'smtp_pass', value: config.pass },
      { key: 'alert_email_to', value: config.to },
    ];

    for (const entry of entries) {
      await prisma.adminSetting.upsert({
        where: { key: entry.key },
        update: { value: entry.value },
        create: { key: entry.key, value: entry.value },
      });
    }

    return { success: true, message: 'Email notification credentials updated.' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update SMTP settings.' };
  }
}


/**
 * Send an email alert for login attempts or security changes
 */
export async function sendSecurityAlertEmail(options: EmailAlertOptions) {
  const timestamp = new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: 'Asia/Kolkata',
  });

  const ip = options.ip || 'Localhost / Unknown IP';
  const userAgent = options.userAgent || 'Unknown Device / Browser';
  const config = await getSmtpConfig();

  const isSuccess = options.type === 'SUCCESS';
  const isFailed = options.type === 'FAILED' || options.type === '2FA_FAILED';

  const badgeBg = isSuccess ? '#4ADE80' : isFailed ? '#EF4444' : '#FF4C24';
  const badgeText = isSuccess ? 'SUCCESSFUL LOGIN' : isFailed ? 'SECURITY ALERT: FAILED LOGIN' : 'SECURITY NOTICE';

  const subject = isFailed
    ? `🚨 [FAILED LOGIN ALERT] Admin Platform Access Attempt`
    : isSuccess
    ? `🟢 [SECURITY NOTICE] Successful Admin Login`
    : `🛡 [SECURITY NOTICE] Admin Security Updated (${options.type})`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0c0c10; color: #f2f2f0; margin: 0; padding: 24px; }
        .container { max-width: 580px; margin: 0 auto; background: #14141e; border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; overflow: hidden; padding: 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); }
        .badge { display: inline-block; background: ${badgeBg}; color: #000; font-weight: 800; font-size: 11px; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
        h2 { font-size: 22px; margin: 0 0 12px 0; color: #ffffff; }
        p { font-size: 14px; line-height: 1.6; color: rgba(242,242,240,0.8); margin: 0 0 20px 0; }
        .details-box { background: #07070a; border: 1px solid rgba(255,76,36,0.3); border-radius: 12px; padding: 18px; margin-bottom: 24px; font-family: monospace; font-size: 13px; }
        .detail-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: rgba(242,242,240,0.5); }
        .detail-value { color: #FF4C24; font-weight: bold; }
        .footer { font-size: 12px; color: rgba(242,242,240,0.4); text-align: center; margin-top: 28px; padding-top: 18px; border-top: 1px solid rgba(255,255,255,0.08); }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="badge">${badgeText}</div>
        <h2>${subject}</h2>
        <p>A login event occurred on your <strong>Sarthak Mehta Admin Command Center</strong>. Here are the security telemetry details:</p>
        
        <div class="details-box">
          <div class="detail-row">
            <span class="detail-label">Event Type</span>
            <span class="detail-value" style="color: ${badgeBg};">${options.type}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Timestamp</span>
            <span class="detail-value">${timestamp}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">IP Address</span>
            <span class="detail-value">${ip}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Details</span>
            <span class="detail-value">${options.details || 'Standard Session'}</span>
          </div>
        </div>

        <p style="font-size: 12px; color: rgba(242,242,240,0.5);">If this wasn't you, please log into your server immediately and change your master passcode.</p>

        <div class="footer">
          Sarthak Mehta Admin Security System · Autonomous Alert Engine
        </div>
      </div>
    </body>
    </html>
  `;

  // Always record event in DB audit logs
  try {
    await prisma.adminSetting.create({
      data: {
        key: `audit_log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        value: JSON.stringify({
          type: options.type,
          timestamp,
          ip,
          details: options.details,
        }),
      },
    });
  } catch (err) {
    console.error('Audit log write error:', err);
  }

  // Send SMTP Email if user & pass are configured
  if (!config.user || !config.pass) {
    console.warn(`[Security Alert Email Skipped - SMTP Not Configured]: ${subject}`);
    return { success: false, reason: 'SMTP_NOT_CONFIGURED', message: 'Email alert recorded to audit log. Add Gmail SMTP details in Admin Security tab to receive instant inbox notifications.' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465, // true for 465, false for 587
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    await transporter.sendMail({
      from: `"Admin Security Alert" <${config.user}>`,
      to: config.to,
      subject,
      html: htmlContent,
    });

    console.log(`[Security Alert Email Sent Successfully to ${config.to}]`);
    return { success: true };
  } catch (err: any) {
    console.error('Failed to send security alert email:', err?.message || err);
    return { success: false, error: err?.message || 'SMTP send failed' };
  }
}
