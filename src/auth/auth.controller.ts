import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegAuthDto } from './dto/reg-auth.dto';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registration')
  registration(@Body() dto: RegAuthDto, @Res() res: Response) {
    const { email, password, firstName, lastName } = dto;
    return this.authService.registration(
      email,
      password,
      firstName,
      lastName,
      res,
    );
  }

  @Post('authorization')
  create(@Body() dto: AuthDto, @Res() res: Response) {
    const { email, password } = dto;
    return this.authService.authorization(email, password, res);
  }

  // TODO: add guards and decorator for token
  // @Post('logout')
  // logout() {
  //   return this.authService.logout();
  // }

  @Post('reAuth')
  reAuth(@Req() req: Request, @Res() res: Response) {
    return this.authService.reAuth(req, res);
  }
}
