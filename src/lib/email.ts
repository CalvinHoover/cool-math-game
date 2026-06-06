import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? 'Cool Math Game <onboarding@resend.dev>';

export async function sendVerificationCode(
  to: string,
  code: string,
  type: 'password_reset' | 'two_factor'
) {
  const subject =
    type === 'password_reset'
      ? 'Reset your Cool Math Game password'
      : 'Your Cool Math Game login code';

  const body =
    type === 'password_reset'
      ? `Your password reset code is: ${code}\n\nThis code expires in 15 minutes.\nIf you didn't request this, ignore this email.`
      : `Your login verification code is: ${code}\n\nThis code expires in 5 minutes.\nIf you didn't request this, someone may have your password, change it immediately.`;

  await resend.emails.send({ from: FROM, to, subject, text: body });
}
