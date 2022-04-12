import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  async registration(
    email: string,
    firstName: string,
    lastName: string,
    photo: string,
  ) {
    // pass
  }

  async authorization(email: string) {
    // pass
  }
}
