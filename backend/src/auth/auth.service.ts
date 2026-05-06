// ==============================================================================
// AUTH SERVICE (Authentication Logic)
// ==============================================================================
// Provides core business logic for user credential validation, 
// password hashing verification, and secure JWT issuance.
// ==============================================================================

import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  // CONSTRUCTOR: Injects UsersService for DB lookups and JwtService for token signing.
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // VALIDATE USER: Checks if the provided email and password match a database record.
  async validateUser(email: string, pass: string): Promise<any> {
    // 1. [DB] Fetch user by email to retrieve hashed password
    const user = await this.usersService.findByEmail(email);
    
    // 2. [SECURITY] Compare provided password with stored hash using bcrypt
    if (user && await bcrypt.compare(pass, user.password_hash)) {
      // 3. Extract sensitive data before returning user object
      const { password_hash, ...result } = user;
      return result;
    }
    // 4. Return null if authentication fails
    return null;
  }

  // LOGIN: Generates a signed JWT access token for an authenticated user.
  async login(user: any) {
    // 1. Define JWT payload containing user identity and role
    const payload = { email: user.email, sub: user.id, name: user.name, role: user.role };
    
    // 2. [SIDE EFFECT] Sign payload and return access token
    return {
      access_token: this.jwtService.sign(payload),
      user: payload,
    };
  }

}
