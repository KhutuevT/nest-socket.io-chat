import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAuthService } from './google-auth.service';
import { Request, Response } from 'express';

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
  @UseGuards(AuthGuard('google'))
  googleAuth(): void {
    // pass
  }

  @Get('redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: RequestNew, @Res() res: Response) {
    return await this.googleAuthService.googleLogin(req.user, res);
  }
}
