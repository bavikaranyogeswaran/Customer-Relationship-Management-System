// ==============================================================================
// LOCAL AUTH GUARD (Credential Challenge)
// ==============================================================================
// Enforces email/password authentication by triggering the local 
// passport strategy during the initial login phase.
// ==============================================================================

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// 1. [SECURITY] Extend Passport AuthGuard for initial email/password validation
export class LocalAuthGuard extends AuthGuard('local') {}
