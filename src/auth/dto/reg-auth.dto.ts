import { IsEmail, Length } from 'class-validator'

export class RegAuthDto {

  @IsEmail()  
  email: string;
  @Length(3)
  firstName: string;
  @Length(3)
  lastName: string;
  @Length(6)
  password: string;
  //avatar: string,
}
