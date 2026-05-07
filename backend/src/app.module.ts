// ==============================================================================
// APP MODULE (Central Orchestration)
// ==============================================================================
// Root module that orchestrates all feature modules, environment 
// configurations, and global security guards.
// ==============================================================================

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LeadsModule } from './leads/leads.module';
import { NotesModule } from './notes/notes.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    // 1. [PERFORMANCE] Configuration with validation schema to ensure environment integrity
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_REFRESH_SECRET: Joi.string().min(32).required(),
        DATABASE_URL: Joi.string().required(),
        PORT: Joi.number().default(3000),
        // Mail / SMTP
        MAIL_HOST: Joi.string().required(),
        MAIL_PORT: Joi.number().default(587),
        MAIL_SECURE: Joi.boolean().default(false),
        MAIL_USER: Joi.string().required(),
        MAIL_PASS: Joi.string().required(),
        MAIL_FROM: Joi.string().required(),
      }),
    }),
    // 2. [SECURITY] Implement rate limiting to prevent brute-force attacks and abuse
    ThrottlerModule.forRoot([{
      name: 'short',
      ttl: 60000,
      limit: 10,
    }]),
    // 3. Import domain-specific modules
    DatabaseModule, 
    AuthModule, 
    UsersModule, 
    LeadsModule, 
    NotesModule, 
    DashboardModule,
    MailModule
  ],
  controllers: [AppController],
  providers: [
    // 4. Register core application services
    AppService,
    // 5. [SECURITY] Register global ThrottlerGuard for automated rate limiting
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
