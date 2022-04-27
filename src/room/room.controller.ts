import { Body, Controller, Post, Req } from '@nestjs/common';

import { RoomDto } from './room.dto';
import { RoomService } from './room.service';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('/create')
  async auth(@Body() dto: RoomDto, @Req() req: any) {
    //return await this.roomService.create();
  }
}
