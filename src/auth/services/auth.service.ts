import { Model } from 'mongoose';
import { Request, Response } from 'express';
import { hash, compareSync } from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';

import { TokenService } from 'src/token/token.service';
import { User, UserDocument } from 'src/user/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async validateUser(email: string, password: string) {
    const result = await this.userModel.findOne({ email });

    if (!result)
      throw new NotFoundException(`user with login: ${email} not found`);

    if (result.status === 'delete') throw new Error('User deleted!');

    const hash = result.password;

    const isMatch = await compareSync(password, hash);

    const user = {
      _id: result.id,
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName,
      avatar: result.avatar,
      status: result.status,
    };

    if (isMatch) return user;

    return null;
  }

  //TODO: add avatar
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

      if (candidate) throw new Error('User already exists error!');

      //const nameFile: string = await this.saveAvatar(avatar);

      const saltRound = 10;

      const hashPassword: string = await hash(password, saltRound);

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

      return res.send({
        _id: `${user._id}`,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        status: user.status,
        accessToken,
      });
    } catch (err) {
      return res.send({ message: err.message });
    }
  }

  async authorization(user: { [key: string]: string }, res: Response) {
    try {
      const { _id, email, firstName, lastName, avatar, status } = user;

      const { accessToken, refreshToken } = this.tokenService.generateTokens({
        _id,
        email,
      });

      await this.tokenService.saveToken(_id, refreshToken);

      res.cookie('refreshToken', refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      return res.send({
        _id,
        email,
        firstName,
        lastName,
        avatar,
        status,
        accessToken,
      });
    } catch (err) {
      return res.send({ message: err.message });
    }
  }

  async logout(userId: string, res: Response) {
    try {
      await this.tokenService.deleteToken(userId);
      res.clearCookie('refreshToken');
      return res.send({ message: 'Logout' });
    } catch (err) {
      return res.send({ message: err.message });
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

      return res.send({ accessToken });
    } catch (err) {
      return res.send({ message: err.message });
    }
  }

  async authGoogle(token: string, res: Response) {
    try {
      const check = await this.tokenService.existsToken(token);

      if (!check) throw new Error('TokenNotExists');

      const { _id, accessToken, refreshToken } =
        this.tokenService.reAuth(token);

      res.cookie('refreshToken', refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      await this.tokenService.saveToken(_id, refreshToken);

      const user = await this.userModel.findOne({ _id });

      return res.send({
        _id: `${user._id}`,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        status: user.status,
        accessToken,
      });
    } catch (err) {
      return res.send({ message: err.message });
    }
  }

  private cookieInObject(cookie: string | undefined) {
    if (!cookie) return undefined;
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
