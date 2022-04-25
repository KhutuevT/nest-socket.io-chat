import { Controller, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegAuthDto } from './dto/reg-auth.dto';
import { AuthDto } from './dto/auth.dto';
import { JWTGuard } from 'src/common/guards/auth.guard';
import { Token } from 'src/common/decorators/token.decorator';

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

  @UseGuards(JWTGuard)
  @Post('logout')
  logout(@Token() token: string, @Res() res: Response) {
    return this.authService.logout(token, res);
  }

  @Post('reAuth')
  reAuth(@Req() req: Request, @Res() res: Response) {
    return this.authService.reAuth(req, res);
  }
}
