// ==============================================================================
// AUTH SERVICE (Authentication Logic)
// ==============================================================================
// Provides core business logic for user credential validation, 
// password hashing verification, and secure JWT issuance.
// ==============================================================================

import { Injectable, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';
import { Inject } from '@nestjs/common';

@Injectable()
export class AuthService {
  // CONSTRUCTOR: Injects UsersService for DB lookups and JwtService for token signing.
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    @Inject(PG_POOL) private pool: Pool,
  ) {}

  // HASH TOKEN: Utility to hash tokens before DB storage
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // VALIDATE USER: Checks if the provided email and password match a database record.
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    // 1. [SECURITY] Check if account is currently locked or deactivated
    if (user && user.is_active === false) {
      throw new UnauthorizedException('Account has been deactivated.');
    }
    if (user && user.locked_until && new Date(user.locked_until) > new Date()) {
      throw new HttpException('Account is temporarily locked. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }

    // 2. [SECURITY] Compare provided password with stored hash using bcrypt
    if (user && await bcrypt.compare(pass, user.password_hash)) {
      // 3. [SIDE EFFECT] Reset failed attempts on successful login
      if (user.failed_login_attempts > 0) {
        await this.usersService.resetFailedAttempts(user.id);
      }
      const { password_hash, ...result } = user;
      return result;
    }

    // 4. [SECURITY] Increment failed attempts on failure
    if (user) {
      await this.usersService.incrementFailedAttempts(user.id);
    }
    
    return null;
  }

  // LOGIN: Generates signed JWT access and refresh tokens.
  async login(user: any) {
    const payload = { email: user.email, sub: user.id, name: user.name, role: user.role };
    
    const accessToken = this.jwtService.sign(payload);
    
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { 
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d' 
      }
    );

    // 1. [SECURITY] Store refresh token hash in sessions table
    await this.pool.query(
      'INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, this.hashToken(refreshToken), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: payload,
    };
  }

  // REFRESH: Validates refresh token and issues a new access token.
  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      
      // 1. [SECURITY] Verify session exists in DB
      const sessionRes = await this.pool.query(
        'SELECT id FROM sessions WHERE token_hash = $1 AND user_id = $2 AND expires_at > NOW()',
        [this.hashToken(refreshToken), payload.sub]
      );
      if (sessionRes.rows.length === 0) throw new UnauthorizedException('Session expired or revoked');

      const user = await this.usersService.findById(payload.sub);
      if (!user || user.is_active === false) throw new UnauthorizedException('Invalid or deactivated account');

      const newPayload = { email: user.email, sub: user.id, name: user.name, role: user.role };
      return {
        access_token: this.jwtService.sign(newPayload),
        user: newPayload,
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // LOGOUT: Invalidates a specific refresh token session
  async logout(refreshToken: string) {
    if (refreshToken) {
      await this.pool.query('DELETE FROM sessions WHERE token_hash = $1', [this.hashToken(refreshToken)]);
    }
  }

  // FORGOT PASSWORD: Generates a temporary token for password resets
  async generatePasswordResetToken(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.is_active === false) {
      // Return a successful response even if user doesn't exist to prevent email enumeration
      return { message: 'If an account exists with that email, a reset link has been sent.' };
    }

    // 1. [SECURITY] Honor account lockouts for password reset flow
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      throw new HttpException('Account is temporarily locked. Please wait for the lockout to expire before resetting.', HttpStatus.TOO_MANY_REQUESTS);
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id, purpose: 'reset-password' },
      { 
        secret: this.configService.get<string>('JWT_SECRET') + user.password_hash,
        expiresIn: '15m' 
      }
    );

    // REAL EMAIL SENDING
    const resetLink = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    await this.mailService.sendPasswordReset(email, resetLink);

    return { message: 'If an account exists with that email, a reset link has been sent.' };
  }

  // RESET PASSWORD: Validates token and updates password
  async resetPassword(email: string, token: string, newPassword: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.is_active === false) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET') + user.password_hash,
      });

      if (payload.purpose !== 'reset-password' && payload.purpose !== 'onboarding') {
        throw new UnauthorizedException('Invalid token purpose');
      }

      const hash = await bcrypt.hash(newPassword, 10);
      await this.usersService.updatePassword(user.id, hash);

      // 1. [SECURITY] Invalidate all active sessions for this user globally
      await this.pool.query('DELETE FROM sessions WHERE user_id = $1', [user.id]);

      return { message: 'Password has been successfully reset' };
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }

  // GENERATE INVITATION TOKEN: Generates a temporary token for onboarding new users
  async generateInvitationToken(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.is_active === false) {
      throw new UnauthorizedException('User does not exist or is inactive');
    }

    const inviteToken = this.jwtService.sign(
      { sub: user.id, purpose: 'onboarding' },
      { 
        secret: this.configService.get<string>('JWT_SECRET') + user.password_hash,
        expiresIn: '24h' 
      }
    );

    const setupLink = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${inviteToken}&email=${encodeURIComponent(email)}`;
    await this.mailService.sendInvitationEmail(email, user.name, setupLink);

    return { message: 'Invitation email has been sent.' };
  }

}
