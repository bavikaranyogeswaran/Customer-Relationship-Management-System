// ==============================================================================
// JWT AUTH GUARD (Bearer Security)
// ==============================================================================
// Enforces JWT-based authentication by intercepting requests and 
// validating the presence and integrity of a Bearer token.
// ==============================================================================

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// 1. [SECURITY] Extend Passport AuthGuard for JWT validation
export class JwtAuthGuard extends AuthGuard('jwt') {}
