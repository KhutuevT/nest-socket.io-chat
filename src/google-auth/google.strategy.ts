import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { config } from 'dotenv';
import { Injectable } from '@nestjs/common';

import { GoogleAuthService } from './google-auth.service';

config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: GoogleAuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: 'http://localhost:3000/google-auth/redirect',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _: unknown,
    __: unknown,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;

    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      avatar: photos[0].value,
    };

    const { refreshToken } = await this.authService.googleLogin(user);
    console.log(refreshToken);

    done(null, refreshToken);
  }
}
