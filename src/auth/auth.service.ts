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
    try {
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

      await this.tokenService.saveToken(user._id, refreshToken);

      res.cookie('refreshToken', refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      res.send({
        _id: `${user._id}`,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        status: user.status,
        accessToken,
      });
    } catch (err) {
      res.send({ message: err.message });
    }
  }

  async authorization(email: string, password: string, res: Response) {
    try {
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

      await this.tokenService.saveToken(user._id, refreshToken);

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
    } catch (err) {
      res.send({ message: err.message });
    }
  }

  async logout(userId: string, res: Response) {
    try {
      await this.tokenService.deleteToken(userId);
      res.clearCookie('refreshToken');
      res.send({ message: 'Logout' });
    } catch (err) {
      res.send({ message: err.message });
    }
  }

  async reAuth(req: Request, res: Response) {
    try {
      const cookie = this.cookieInObject(req.headers.cookie);
      const token = cookie.refreshToken;

      const { _id, accessToken, refreshToken } =
        this.tokenService.reAuth(token);

      res.cookie('refreshToken', refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      await this.tokenService.saveToken(_id, refreshToken);

      res.send({ accessToken });
    } catch (err) {
      res.send({ message: err.message });
    }
  }

  async authGoogle(token: string, res: Response) {
    try {
      const check = await this.tokenService.existsToken(token);

      if (!check) {
        throw new Error('TokenNotExists');
      }

      const { _id, accessToken, refreshToken } =
        this.tokenService.reAuth(token);

      res.cookie('refreshToken', refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      await this.tokenService.saveToken(_id, refreshToken);

      const user = await this.userModel.findOne({ _id });

      res.send({
        _id: `${user._id}`,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        status: user.status,
        accessToken,
      });
    } catch (err) {
      res.send({ message: err.message });
    }
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
