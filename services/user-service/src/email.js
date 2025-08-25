import nodemailer from 'nodemailer';
import pino from 'pino';
const logger = pino();
/**
 * We read SMTP_* from envs (in AKS, they come from Key Vault via CSI -> K8s Secret -> env).
 */
const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || 587);
const user = process.env.SMTP_USERNAME;
const pass = process.env.SMTP_PASSWORD;
const from = process.env.SMTP_FROM;
export const smtpConfigured = Boolean(host) && Boolean(user) && Boolean(pass) && Boolean(from);
const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = SMTPS
    auth: { user, pass }
});
export async function sendTestEmail(to) {
    if (!smtpConfigured) {
        throw new Error('SMTP is not configured. Please set SMTP_* env vars.');
    }
    const info = await transporter.sendMail({
        from,
        to,
        subject: 'HRMS user-service: test email',
        text: 'This is a test email sent from the HRMS user-service.'
    });
    logger.info({ messageId: info.messageId }, 'Test email sent');
    return info.messageId;
}
