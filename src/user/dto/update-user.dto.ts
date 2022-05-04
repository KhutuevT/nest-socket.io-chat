import { IsEmail, Length } from 'class-validator';

export class UpdateUserDto {
  @Length(3)
  firstName: string;
  @Length(3)
  lastName: string;
  @IsEmail()
  email: string;
  @Length(1)
  avatar: string;
}
