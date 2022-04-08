import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  auth(): string {
    return '<a href ="/google-auth">Google auth</a>';
  }
}
