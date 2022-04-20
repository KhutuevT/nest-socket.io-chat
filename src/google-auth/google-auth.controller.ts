import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAuthService } from './google-auth.service';
import { Request, Response } from 'express';

interface RequestNew extends Request {
  user: string;
}
@Controller('google-auth')
export class GoogleAuthController {
  constructor(private readonly authService: GoogleAuthService) {}

  @Get()
  @UseGuards(AuthGuard('google'))
  googleAuth(@Req() req: RequestNew, @Res() res: Response): void {
    console.log('------', req.user);

    res.send(req.user);
    // pass
  }

  @Get('redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req: RequestNew, @Res() res: Response) {
    res.send(req.user);
  }
}
