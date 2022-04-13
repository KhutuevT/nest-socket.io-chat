import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class GoogleAuthService {
  googleLogin(req) {
    if (!req.user) {
      return 'No user from google';
    }
    console.log(req.user);
    return {
      message: 'User information from google',
      user: req.user,
    };
  }
}
