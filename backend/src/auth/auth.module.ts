// ==============================================================================
// AUTH MODULE (Security Engine)
// ==============================================================================
// Orchestrates authentication logic, including multi-strategy verification, 
// security guards, and dynamic JWT configuration.
// ==============================================================================

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { DatabaseModule } from '../database/database.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    // 1. Integrate DatabaseModule for session persistence
    DatabaseModule,
    // 2. Integrate UsersModule for credential verification against database
    UsersModule,
    // 3. Integrate MailModule for sending emails
    MailModule,
    // 3. Register Passport for strategy-based authentication
    PassportModule,
    // 3. [SECURITY] Configure JWT module with dynamic secret and expiration
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '8h' },
      }),
    }),
  ],
  providers: [
    // 4. Register core auth services and strategies
    AuthService, 
    LocalStrategy, 
    JwtStrategy, 
    RolesGuard
  ],
  controllers: [AuthController],
  exports: [
    // 5. Export AuthService and RolesGuard for use in other modules
    AuthService, 
    RolesGuard
  ],
})
export class AuthModule {}
