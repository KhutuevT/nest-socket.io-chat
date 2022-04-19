import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAuthService } from './google-auth.service';
import { Request } from 'express';

interface RequestNew extends Request {
  user: {
    email: string;
    firstName: string;
    lastName: string;
    avatar: string;
  };
}
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
  googleAuthRedirect(@Req() req: RequestNew) {
    return this.authService.googleLogin(req.user);
  }
}
