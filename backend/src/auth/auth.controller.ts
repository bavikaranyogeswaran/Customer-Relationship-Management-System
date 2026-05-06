// ==============================================================================
// AUTH CONTROLLER (Identity Management)
// ==============================================================================
// Handles authentication requests, including secure login, token issuance, 
// and protected profile retrieval.
// ==============================================================================

import { Controller, Request, Post, UseGuards, Get, BadRequestException } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  // CONSTRUCTOR: Injects AuthService for credential validation and token generation.
  constructor(private authService: AuthService) {}

  // LOGIN: Authenticates user credentials and issues a JWT token.
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    // 1. [SECURITY] Authenticate via LocalStrategy (handled by Guard)
    // 2. [SIDE EFFECT] Generate and return JWT access token
    return this.authService.login(req.user);
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
}
