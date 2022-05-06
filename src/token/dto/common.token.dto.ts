import { IsEmail, IsString, Length } from 'class-validator';

export class CreateTokenDto {
  @Length(1)
  _id: string;
  @IsEmail()
  email: string;
}

export class ResultTokens {
  @IsString()
  _id?: string;
  @IsString()
  accessToken: string;
  @IsString()
  refreshToken: string;
}
