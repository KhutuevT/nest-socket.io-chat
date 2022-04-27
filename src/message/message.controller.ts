import { Controller, Delete, Get, Patch, Post, Res } from '@nestjs/common';
import { Response } from 'express';

import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}
  @Get('roomMessages')
  async getAllRoomMessage(@Res() res: Response) {
    return res.send(
      await this.messageService.getAllRoomMessage('626696098f5928e2635222b9'),
    );
  }

  @Post('add')
  async add(@Res() res: Response) {
    return res.send(
      await this.messageService.add(
        '625fdff2d718055dc4ee6ad9',
        '626696098f5928e2635222b9',
        '11111111',
      ),
    );
  }

  @Patch('change')
  async change(@Res() res: Response) {
    return res.send(
      await this.messageService.change(
        '626696f91e6ec4bd322e117d',
        '625fdff2d718055dc4ee6ad9',
        'test2',
      ),
    );
  }

  @Delete('delete')
  async delete(@Res() res: Response) {
    return res.send(
      await this.messageService.delete(
        '626696f91e6ec4bd322e117d',
        '625fdff2d718055dc4ee6ad9',
      ),
    );
  }
}
