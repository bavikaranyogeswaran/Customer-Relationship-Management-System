// ==============================================================================
// APP CONTROLLER (Core Entry)
// ==============================================================================
// Root controller responsible for basic application health checks and 
// general system entry points.
// ==============================================================================

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  // CONSTRUCTOR: Handles dependency injection for core application services.
  constructor(private readonly appService: AppService) {}

  // GET HELLO: Basic health check endpoint returning a welcome message.
  @Get()
  getHello(): string {
    // 1. [SIDE EFFECT] Delegate call to appService logic
    return this.appService.getHello();
  }
}
