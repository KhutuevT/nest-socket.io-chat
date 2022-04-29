import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TokenModule } from 'src/token/token.module';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { AuthController } from './controllers/auth.controller';
import { GoogleAuthService } from './services/google-auth.service';
import { GoogleAuthController } from './controllers/google-auth.controller';
import { User, UserSchema } from 'src/user/user.schema';

@Module({
  imports: [
    TokenModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController, GoogleAuthController],
  providers: [
    AuthService,
    GoogleAuthService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
  ],
})
export class AuthModule {}
