import { Observable } from 'rxjs';
import { verify } from 'jsonwebtoken';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

const ACCESS_KEY = process.env.JWT_ACCESS_KEY || '';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.handshake.headers.authorization;
    if (authHeader) {
      const token = authHeader.split('Bearer ')[1];

      if (token) {
        try {
          verify(token, ACCESS_KEY);
          return true;
        } catch (err) {
          throw new Error('Invalid Token');
        }
      } else {
        throw new Error('Incorrect Token');
      }
    } else {
      throw new Error('Not Header Auth');
    }
    return true;
  }
}
