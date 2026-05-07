// ==============================================================================
// BOOTSTRAP (Main Entry Point)
// ==============================================================================
// Primary lifecycle management for the NestJS application. 
// Configures global middleware, CORS, validation pipes, and starts the server.
// ==============================================================================

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

process.env.TZ = 'Asia/Colombo';

async function bootstrap() {
  // 1. [PERFORMANCE] Initialize Nest application using the root AppModule
  const app = await NestFactory.create(AppModule);

  // 1.1 [SECURITY] Use cookie-parser for secure HTTP-only refresh tokens
  app.use(cookieParser());

  // 2. [SECURITY] Configure Cross-Origin Resource Sharing (CORS)
  // Restricts API access to the trusted frontend origin to prevent unauthorized cross-site requests
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // 3. [VALIDATION] Enable global validation pipes
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  // 3.1 [SECURITY] Register global exception filter to sanitize internal errors
  app.useGlobalFilters(new AllExceptionsFilter());

  // 4. [SIDE EFFECT] Start listening for incoming HTTP requests
  await app.listen(process.env.PORT ?? 3000);
}

// 5. [SIDE EFFECT] Execute bootstrap sequence
bootstrap();
