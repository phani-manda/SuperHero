import { Resend } from 'resend';

type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || null;
}

async function sendEmail(payload: EmailPayload) {
  const resend = getResendClient();
  const from = getFromEmail();

  if (!resend || !from) {
    return { sent: false, reason: 'Email not configured' as const };
  }

  await resend.emails.send({
    from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });

  return { sent: true as const };
}

export async function sendSubscriptionActivatedEmail({
  email,
  fullName,
  planType,
  renewalDate,
}: {
  email: string;
  fullName?: string | null;
  planType: string;
  renewalDate: string;
}) {
  const name = fullName || 'there';
  return sendEmail({
    to: email,
    subject: 'Your GolfGives subscription is active',
    text: `Hi ${name}, your ${planType} subscription is active. Your renewal date is ${renewalDate}.`,
  });
}

export async function sendSubscriptionCanceledEmail({
  email,
  fullName,
  endDate,
}: {
  email: string;
  fullName?: string | null;
  endDate: string;
}) {
  const name = fullName || 'there';
  return sendEmail({
    to: email,
    subject: 'Your GolfGives subscription has been scheduled to cancel',
    text: `Hi ${name}, your subscription will remain active until ${endDate}, then it will cancel automatically.`,
  });
}

export async function sendWinnerStatusEmail({
  email,
  fullName,
  subject,
  message,
}: {
  email: string;
  fullName?: string | null;
  subject: string;
  message: string;
}) {
  const name = fullName || 'there';
  return sendEmail({
    to: email,
    subject,
    text: `Hi ${name}, ${message}`,
  });
}

export async function sendDrawWinnerEmail({
  email,
  fullName,
  drawMonth,
  prizeAmount,
  matchType,
}: {
  email: string;
  fullName?: string | null;
  drawMonth: string;
  prizeAmount: string;
  matchType: string;
}) {
  const name = fullName || 'there';
  return sendEmail({
    to: email,
    subject: `You won in the ${drawMonth} draw`,
    text: `Hi ${name}, congratulations. You won ${prizeAmount} in the ${drawMonth} draw with a ${matchType} result. Please upload your proof in the dashboard so the team can review your payout.`,
  });
}
