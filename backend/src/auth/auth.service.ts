import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.password_hash)) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, name: user.name, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: payload,
    };
  }

  async register(email: string, pass: string, name: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new Error('User already exists');
    }
    const hash = await bcrypt.hash(pass, 10);
    const user = await this.usersService.create({ email, password_hash: hash, name });
    const { password_hash, ...result } = user;
    return result;
  }
}
