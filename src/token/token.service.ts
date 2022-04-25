import { sign, verify } from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTokenDto, ResultTokens } from './dto/common.token.dto';
import { Token, TokenDocument } from './schemas/token.schema';

const ACCESS_KEY = process.env.JWT_ACCESS_KEY;
const REFRESH_KEY = process.env.JWT_REFRESH_KEY;

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
  ) {}

  generateTokens = (payload: CreateTokenDto): ResultTokens => {
    try {
      const accessToken: string = sign(payload, ACCESS_KEY, {
        expiresIn: '1d',
      });
      const refreshToken: string = sign(payload, REFRESH_KEY, {
        expiresIn: '30d',
      });
      return { accessToken, refreshToken };
    } catch (err) {
      throw new Error('TokenErrorGen');
    }
  };

  saveToken = async (userId: string, token: string): Promise<Token> => {
    try {      
      const tokenExists = await this.tokenModel.findOne({ userId });
      if (tokenExists) {
        tokenExists.token = token;
        await tokenExists.save();
        return tokenExists;
      }
      const tokenNew = await this.tokenModel.create({ userId, token });
      return tokenNew;
    } catch (err) {
      throw new Error(`TokenErrorSave: ${err}`);
    }
  };

  deleteToken = async (userId: string): Promise<number> => {
    try {
      const tokenDel = await this.tokenModel.deleteOne({ where: { userId } });
      return tokenDel.deletedCount;
    } catch (err) {
      throw new Error('TokenErrorDelete');
    }
  };

  reAuth = (refreshToken: string): ResultTokens => {
    try {
      const payload = verify(refreshToken, REFRESH_KEY) as CreateTokenDto;

      const tokens = this.generateTokens({
        _id: payload._id,
        email: payload.email,
      });

      return {
        _id: payload._id,
        ...tokens,
      };
    } catch (err) {
      throw new Error('TokenErrorReAuth');
    }
  };

  existsToken = async (token: string): Promise<boolean> => {
    try {
      return this.tokenModel.findOne({ token }).then((result: Token) => {
        if (result) return true;
        return false;
      });
    } catch (err) {
      throw new Error('TokenErrorExists');
    }
  };
}
