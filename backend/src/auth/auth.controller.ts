// ==============================================================================
// AUTH CONTROLLER (Identity Management)
// ==============================================================================
// Handles authentication requests, including secure login, token issuance, 
// and protected profile retrieval.
// ==============================================================================

import { Controller, Request, Post, UseGuards, Get, Response, UnauthorizedException, Body } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { Response as Res } from 'express';

@Controller('auth')
export class AuthController {
  // CONSTRUCTOR: Injects AuthService for credential validation and token generation.
  constructor(private authService: AuthService) {}

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Response({ passthrough: true }) res: Res) {
    const { access_token, refresh_token, user } = await this.authService.login(req.user);
    
    // 1. [SECURITY] Set refresh token in HTTP-only cookie
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { access_token, user };
  }

  // REFRESH: Generates a new access token using the refresh token from cookies.
  @Post('refresh')
  async refresh(@Request() req, @Response({ passthrough: true }) res: Res) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) throw new UnauthorizedException('Refresh token missing');
    
    const { access_token, user } = await this.authService.refresh(refreshToken);
    return { access_token, user };
  }

  // LOGOUT: Clears the secure refresh token cookie and invalidates session in DB.
  @Post('logout')
  async logout(@Request() req, @Response({ passthrough: true }) res: Res) {
    const refreshToken = req.cookies?.refresh_token;
    await this.authService.logout(refreshToken);
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  // GET PROFILE: Returns the authenticated user's profile details.
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    // 1. [SECURITY] Verify JWT validity (handled by Guard)
    // 2. Return user information extracted from token payload
    return req.user;
  }

  // FORGOT PASSWORD: Initiates password reset flow.
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.generatePasswordResetToken(email);
  }

  // RESET PASSWORD: Completes password reset flow.
  @Post('reset-password')
  async resetPassword(@Body() body: any) {
    return this.authService.resetPassword(body.email, body.token, body.password);
  }
}
