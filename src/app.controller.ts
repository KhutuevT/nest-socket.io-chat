import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/auth')
  auth(): string {
    return this.appService.auth();
  }

  @Get('/environment')
  environment(): string {
    return `ENVIRONMENT: ${process.env.ENVIRONMENT}`;
  }
}
