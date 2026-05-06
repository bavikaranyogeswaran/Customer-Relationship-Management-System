// ==============================================================================
// CREATE USER DTO (Identity Schema)
// ==============================================================================
// Data transfer object defining the structure and security validation 
// for new user registration and onboarding.
// ==============================================================================

import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export class CreateUserDto {
  // 1. [VALIDATION] Enforce unique email format
  @IsEmail() email: string;

  // 2. [SECURITY] Enforce minimum password complexity
  @IsString() @MinLength(8) password: string;

  // 3. [VALIDATION] Enforce minimum name length
  @IsString() @MinLength(2) name: string;

  // 4. [SECURITY] Restrict role assignment to valid system levels
  @IsOptional() @IsEnum(['admin','user']) role?: string;
}
