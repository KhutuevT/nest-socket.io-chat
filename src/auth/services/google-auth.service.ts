import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TokenService } from 'src/token/token.service';
import { User, UserDocument } from 'src/user/user.schema';
import { Response } from 'express';

type TUser = {
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
};

@Injectable()
export class GoogleAuthService {
  constructor(
    private readonly tokenService: TokenService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async googleLogin(user: TUser, res: Response) {
    try {
      if (!user) throw new Error('No user from google');

      let candidate = await this.userModel.findOne({ email: user.email });

      if (!candidate) {
        candidate = await this.userModel.create({
          ...user,
        });
      }

      const { refreshToken, accessToken } = this.tokenService.generateTokens({
        _id: candidate._id,
        email: candidate.email,
      });

      await this.tokenService.saveToken(candidate._id, refreshToken);

      res.cookie('refreshToken', refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      return res.send({
        _id: `${candidate._id}`,
        email: candidate.email,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        avatar: candidate.avatar,
        status: candidate.status,
        accessToken,
      });
    } catch (err) {
      return res.send({ message: 'ErrorGoogleLogin' });
    }
  }
}
