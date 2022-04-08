import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAuthService } from './google-auth.service';
import { Request } from 'express';

@Controller('google-auth')
export class GoogleAuthController {
  constructor(private readonly authService: GoogleAuthService) {}

  @Get()
  @UseGuards(AuthGuard('google'))
  googleAuth(): void {
    // pass
  }

  @Get('redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req: Request) {
    return this.authService.googleLogin(req);
  }
}
