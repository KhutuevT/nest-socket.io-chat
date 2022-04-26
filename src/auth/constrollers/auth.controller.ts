import { Controller, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { RegAuthDto } from '../dto/reg-auth.dto';
import { AuthDto } from '../dto/auth.dto';
import { JWTGuard } from 'src/common/guards/auth.guard';
import { Token } from 'src/common/decorators/token.decorator';
import { LocalAuthGuard } from '../authGuards/local-auth.guard';
import { JwtAuthGuard } from '../authGuards/jwt-auth.guard';

interface RequestNew extends Request {
  user: {
    _id: string;
    email: string;
  };
}
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

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.authorization(req.user, res);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req: RequestNew, @Res() res: Response) {
    return this.authService.logout(req.user._id, res);
  }

  @Post('reAuth')
  reAuth(@Req() req: Request, @Res() res: Response) {
    return this.authService.reAuth(req, res);
  }
}
