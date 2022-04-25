import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './constrollers/auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/user.schema';
import { TokenModule } from 'src/token/token.module';
import { GoogleAuthController } from './constrollers/google-auth.controller';
import { GoogleAuthService } from './services/google-auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TokenModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController, GoogleAuthController],
  providers: [AuthService, GoogleAuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
