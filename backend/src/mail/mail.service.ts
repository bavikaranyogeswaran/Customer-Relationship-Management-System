// ==============================================================================
// MAIL SERVICE (Email Delivery)
// ==============================================================================
// Wraps @nestjs-modules/mailer to send transactional emails such as
// password resets and welcome messages via Gmail SMTP.
// ==============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  // SEND PASSWORD RESET: Delivers a reset link to the user's inbox.
  async sendPasswordReset(to: string, resetLink: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'CRM — Password Reset Request',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;">
            <div style="text-align:center;margin-bottom:24px;">
              <h1 style="color:#1d4ed8;font-size:24px;margin:0;">CRM System</h1>
            </div>
            <h2 style="color:#111827;font-size:20px;">Password Reset Request</h2>
            <p style="color:#374151;line-height:1.6;">
              We received a request to reset the password for your CRM account. 
              Click the button below to choose a new password:
            </p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${resetLink}"
                 style="display:inline-block;background:#1d4ed8;color:#ffffff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;">
                Reset My Password
              </a>
            </div>
            <p style="color:#6b7280;font-size:14px;line-height:1.6;">
              ⏱ This link will expire in <strong>15 minutes</strong>.<br/>
              If you did not request a password reset, you can safely ignore this email.
            </p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
            <p style="color:#9ca3af;font-size:12px;text-align:center;">
              CRM System &mdash; Automated notification, please do not reply.
            </p>
          </div>
        `,
      });
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}`, error);
      throw error;
    }
  }

  // SEND INVITATION EMAIL: Invites new salespersons to join the platform.
  async sendInvitationEmail(to: string, name: string, setupLink: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Welcome to the Team! — Invitation to CRM',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;">
            <div style="text-align:center;margin-bottom:24px;">
              <h1 style="color:#1d4ed8;font-size:24px;margin:0;">CRM System</h1>
            </div>
            <h2 style="color:#111827;font-size:20px;">Welcome to the Team, ${name}! 👋</h2>
            <p style="color:#374151;line-height:1.6;">
              You have been invited to join our CRM platform as a salesperson. 
              To get started, click the button below to set up your password and access your account:
            </p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${setupLink}"
                 style="display:inline-block;background:#1d4ed8;color:#ffffff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;">
                Complete My Setup
              </a>
            </div>
            <p style="color:#6b7280;font-size:14px;line-height:1.6;">
              ⏱ This link will expire in <strong>24 hours</strong>.<br/>
              If you have any questions, please contact your administrator.
            </p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
            <p style="color:#9ca3af;font-size:12px;text-align:center;">
              CRM System &mdash; Automated notification, please do not reply.
            </p>
          </div>
        `,
      });
      this.logger.log(`Invitation email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send invitation email to ${to}`, error);
      throw error;
    }
  }

  // SEND WELCOME EMAIL: Notifies new users that their account is ready.
  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Welcome to the CRM System 🎉',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;">
            <div style="text-align:center;margin-bottom:24px;">
              <h1 style="color:#1d4ed8;font-size:24px;margin:0;">CRM System</h1>
            </div>
            <h2 style="color:#111827;font-size:20px;">Welcome, ${name}! 👋</h2>
            <p style="color:#374151;line-height:1.6;">
              Your CRM account has been successfully created. 
              You can now log in and start managing your leads and customers.
            </p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
            <p style="color:#9ca3af;font-size:12px;text-align:center;">
              CRM System &mdash; Automated notification, please do not reply.
            </p>
          </div>
        `,
      });
      this.logger.log(`Welcome email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}`, error);
      throw error;
    }
  }
}
