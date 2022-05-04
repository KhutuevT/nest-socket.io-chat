import { IsEmail, Length } from "class-validator";

export class AuthDto {
  @IsEmail()
  email: string;
  @Length(6)
  password: string;
}
