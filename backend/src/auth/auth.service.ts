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

@Injectable()
export class AuthService {
  // CONSTRUCTOR: Injects UsersService for DB lookups and JwtService for token signing.
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

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

  // FORGOT PASSWORD: Generates a temporary token for password resets
  async generatePasswordResetToken(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.is_active === false) {
      // Return a successful response even if user doesn't exist to prevent email enumeration
      return { message: 'If an account exists with that email, a reset link has been sent.' };
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
      this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET') + user.password_hash,
      });

      const hash = await bcrypt.hash(newPassword, 10);
      await this.usersService.updatePassword(user.id, hash);
      return { message: 'Password has been successfully reset' };
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }

}
