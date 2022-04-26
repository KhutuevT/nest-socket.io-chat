import { Request, Response } from 'express';
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';

import { GoogleAuthGuard } from '../authGuards/google-auth.guard';
import { GoogleAuthService } from '../services/google-auth.service';

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
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  @Get()
  @UseGuards(GoogleAuthGuard)
  googleAuth(): void {
    // pass
  }

  @Get('redirect')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: RequestNew, @Res() res: Response) {
    return await this.googleAuthService.googleLogin(req.user, res);
  }
}
