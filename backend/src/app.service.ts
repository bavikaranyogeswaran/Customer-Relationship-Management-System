// ==============================================================================
// APP SERVICE (Core Logic)
// ==============================================================================
// Core business logic provider for the root application endpoints, 
// primarily used for system health validation.
// ==============================================================================

import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // GET HELLO: Simple string retrieval for initial endpoint verification.
  getHello(): string {
    // 1. Return greeting message
    return 'Hello World!';
  }
}
