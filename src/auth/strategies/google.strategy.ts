import { config } from 'dotenv';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

config();

import { GoogleAuthService } from '../services/google-auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: GoogleAuthService) {
    let googleCallbackURL = process.env.DEV_GOOGLE_CALLBACK_URL;
    let googleClientID = process.env.DEV_GOOGLE_CLIENT_ID;
    let googleSecret = process.env.DEV_GOOGLE_SECRET;
    if (process.env.ENVIRONMENT === 'PROD'){
      googleCallbackURL = process.env.PROD_GOOGLE_CALLBACK_URL;
      googleClientID = process.env.PROD_GOOGLE_CLIENT_ID;
      googleSecret = process.env.PROD_GOOGLE_SECRET;
    } 
    super({
      clientID: googleClientID,
      clientSecret: googleSecret,
      callbackURL: googleCallbackURL,
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

    done(null, user);
  }
}
