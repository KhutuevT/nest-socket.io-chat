import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from 'src/auth/authGuards/jwt-auth.guard';

@Controller('upload')
export class UploadController {
  @UseGuards(JwtAuthGuard)
  @Post('voice')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(__dirname, '..', '..', 'uploads', 'voices'),
        filename: (req, file, cb) => {
          const uploadedFileName =
            file.originalname.split('.')[0] + Date.now().toString();
          cb(null, `${uploadedFileName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_, file, cb) => {
        if (file.mimetype === 'audio/webm') {
          cb(null, true);
        } else {
          cb(null, false);
        }
      },
    }),
  )
  uploadVoice(@UploadedFile() file: Express.Multer.File) {
    //write to db
    if (!file) throw new BadRequestException(`file not uploaded (wrong type)`);
    return file.filename;
  }

  @UseGuards(JwtAuthGuard)
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(__dirname, '..', '..', 'uploads', 'images'),
        filename: (req, file, cb) => {
          const uploadedFileName =
            file.originalname.split('.')[0] + Date.now().toString();
          cb(null, `${uploadedFileName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_, file, cb) => {
        if (
          file.mimetype === 'image/png' ||
          file.mimetype === 'image/jpg' ||
          file.mimetype === 'image/jpeg'
        ) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    //write to db
    if (!file) throw new BadRequestException(`file not uploaded (wrong type)`);
    return file.filename;
  }
}
