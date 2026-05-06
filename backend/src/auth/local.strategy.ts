// ==============================================================================
// LOCAL STRATEGY (Credential Verification)
// ==============================================================================
// Defines the Passport strategy for validating user-provided email 
// and password against the database.
// ==============================================================================

import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  // CONSTRUCTOR: Configures the local strategy to use 'email' as the username field.
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  // VALIDATE: Coordinates credential verification via AuthService.
  async validate(email: string, pass: string): Promise<any> {
    // 1. [SECURITY] Verify credentials using AuthService business logic
    const user = await this.authService.validateUser(email, pass);
    
    // 2. Raise exception if credentials are invalid
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // 3. Return authenticated user object
    return user;
  }
}
