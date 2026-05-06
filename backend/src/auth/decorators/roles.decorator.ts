// ==============================================================================
// ROLES DECORATOR (Access Metadata)
// ==============================================================================
// Custom decorator used to assign required authority levels to specific 
// API endpoints for role-based access control.
// ==============================================================================

import { SetMetadata } from '@nestjs/common';

// 1. Define metadata key for role-based access control
export const ROLES_KEY = 'roles';

// 2. [SECURITY] Create Roles decorator to facilitate RBAC in controllers
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
