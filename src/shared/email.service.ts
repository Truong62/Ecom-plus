import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class EmailService {
  private resend: Resend;
  private otpTemplate: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.otpTemplate = readFileSync(join(__dirname, 'templates', 'email.template.html'), 'utf-8');
  }

  async sendOTP(data: { email: string; code: string; expiryTime?: string }) {
    const html = this.otpTemplate
      .replace('{{OTP_CODE}}', data.code)
      .replace('{{EXPIRY_TIME}}', data.expiryTime ?? '5 minutes');

    return await this.resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'gamingnnt@gmail.com',
      subject: 'Code verify OTP - SaRuss',
      html,
    });
  }
}
