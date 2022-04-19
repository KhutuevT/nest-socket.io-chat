import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TokenService } from 'src/token/token.service';
import { User, UserDocument } from 'src/user/user.schema';

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

  async googleLogin(user: TUser) {
    try {
      if (!user) {
        throw new Error('No user from google');
      }

      const candidate = await this.userModel.findOne({ email: user.email });

      if (candidate) {
        const { refreshToken } = this.tokenService.generateTokens({
          _id: candidate._id,
          email: candidate.email,
        });

        await this.tokenService.saveToken(candidate._id, refreshToken);

        // res.cookie('refreshToken', refreshToken, {
        //   maxAge: 30 * 24 * 60 * 60 * 1000,
        //   httpOnly: true,
        // });

        return {
          refreshToken,
        };
      }

      const userNew = await this.userModel.create({
        ...user,
      });

      const { refreshToken } = this.tokenService.generateTokens({
        _id: userNew._id,
        email: userNew.email,
      });

      await this.tokenService.saveToken(userNew._id, refreshToken);

      // res.cookie('refreshToken', refreshToken, {
      //   maxAge: 30 * 24 * 60 * 60 * 1000,
      //   httpOnly: true,
      // });

      return {
        refreshToken,
      };
    } catch (err) {
      return { message: 'ErrorGoogleLogin' };
    }
  }
}
