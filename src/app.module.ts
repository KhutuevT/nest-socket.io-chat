import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoogleAuthModule } from './google-auth/google-auth.module';
@Module({
  imports: [GoogleAuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
