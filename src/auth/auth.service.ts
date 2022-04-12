import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TokenService } from 'src/token/token.service';
import { User, UserDocument } from 'src/user/user.schema';
import { Request, Response } from 'express';
import { Model } from 'mongoose';
import { hash, compareSync } from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async registration(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    //avatar: string,
    res: Response,
  ) {
    const candidate = await this.userModel.findOne({ email });

    if (candidate) {
      throw new Error('User already exists error!');
    }

    //const nameFile: string = await this.saveAvatar(avatar);

    const hashPassword: string = await hash(password, 3);

    const user = await this.userModel.create({
      email,
      firstName,
      lastName,
      //avatar: `${nameFile}`,
      password: hashPassword,
    });

    const { accessToken, refreshToken } = this.tokenService.generateTokens({
      _id: user._id,
      email,
    });

    this.tokenService.saveToken(user._id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return {
      _id: `${user._id}`,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      status: user.status,
      accessToken,
    };
  }

  async authorization(email: string, password: string, res: Response) {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new Error('User not found error!');
    }

    if (user.status === 'delete') {
      throw new Error('User deleted!');
    }

    const validPassword = compareSync(password, user.password);
    if (!validPassword) {
      throw new Error('User authorization error!');
    }

    const { accessToken, refreshToken } = this.tokenService.generateTokens({
      _id: user._id,
      email,
    });

    this.tokenService.saveToken(user._id, refreshToken);
    res.cookie('refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return {
      _id: `${user._id}`,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      status: user.status,
      accessToken,
    };
    // return { typename: 'UserAuthorizationResultSuccess', user: returnUser };
  }

  async logout(userId: string, res: Response) {
    const tokenDot = await this.tokenService.deleteToken(userId);
    res.clearCookie('refreshToken');
    return { typename: 'UserLogoutResultSuccess', message: `${tokenDot}` };
  }

  async reAuth(req: Request, res: Response) {
    const cookie = this.cookieInObject(req.headers.cookie);
    const token = cookie.refreshToken;

    const { _id, accessToken, refreshToken } = this.tokenService.reAuth(token);
    res.cookie('refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    await this.tokenService.saveToken(_id, refreshToken);

    return { accessToken };
  }

  private cookieInObject(cookie: string | undefined) {
    if (!cookie) {
      return undefined;
    }
    return cookie
      .split(';')
      .map((item: string) => item.split('='))
      .reduce((acc: { [key: string]: string }, item: string[]) => {
        acc[decodeURIComponent(item[0].trim())] = decodeURIComponent(
          item[1].trim(),
        );
        return acc;
      }, {});
  }
}
