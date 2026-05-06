// ==============================================================================
// JWT STRATEGY (Token Validation)
// ==============================================================================
// Defines the Passport strategy for validating JSON Web Tokens and 
// extracting user identity for request hydration.
// ==============================================================================

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // CONSTRUCTOR: Configures JWT extraction and secret key verification.
  constructor(private config: ConfigService) {
    super({
      // 1. [SECURITY] Extract JWT from Bearer token in Authorization header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // 2. Retrieve secret key from configuration
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // VALIDATE: Transforms verified JWT payload into a user object.
  async validate(payload: any) {
    // 1. Return structured user object for injection into request
    return { id: payload.sub, email: payload.email, name: payload.name, role: payload.role };
  }
}
