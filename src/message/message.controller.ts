import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
  // constructor(private readonly messageService: MessageService) {}
  // @Get('roomMessages')
  // getAllRoomMessage(@Res() res: Response) {
  //   return this.messageService.getAllRoomMessage(
  //     '626696098f5928e2635222b9',
  //     res,
  //   );
  // }
  // @Post('add')
  // add(@Res() res: Response) {
  //   return this.messageService.add(
  //     '625fdff2d718055dc4ee6ad9',
  //     '626696098f5928e2635222b9',
  //     '11111111',
  //     res,
  //   );
  // }
  // @Patch('change')
  // change(@Res() res: Response) {
  //   return this.messageService.change(
  //     '626696f91e6ec4bd322e117d',
  //     '625fdff2d718055dc4ee6ad9',
  //     'test2',
  //     res,
  //   );
  // }
  // @Delete('delete')
  // delete(@Res() res: Response) {
  //   return this.messageService.delete(
  //     '626696f91e6ec4bd322e117d',
  //     '625fdff2d718055dc4ee6ad9',
  //     res,
  //   );
  // }
}
