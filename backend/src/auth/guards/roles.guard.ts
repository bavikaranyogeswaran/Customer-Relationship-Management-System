// ==============================================================================
// ROLES GUARD (Authorization Layer)
// ==============================================================================
// Protects endpoints by verifying that the authenticated user possesses 
// the necessary roles defined in route metadata.
// ==============================================================================

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  // CONSTRUCTOR: Injects Reflector to retrieve role metadata from handlers and classes.
  constructor(private reflector: Reflector) {}

  // CAN ACTIVATE: Evaluates if the current request is authorized based on user role.
  canActivate(context: ExecutionContext): boolean {
    // 1. [SECURITY] Retrieve required roles from handler or class metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // 2. Allow access if no specific roles are required
    if (!requiredRoles) return true;
    
    // 3. [SECURITY] Verify user role from request against required roles
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user?.role);
  }
}
