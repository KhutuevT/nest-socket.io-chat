import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { RoomDto } from './room.dto';
import { RoomService } from './room.service';

const ownerId = '6267fd30aa12046c135ecb9b';
const roomId = '627376b652dd887e8100a521';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('/create')
  async create(@Res() res: Response) {
    const users = ['6267fd30aa12046c135ecb9b', '6267fd71aa12046c135ecbad'];
    return res.send(await this.roomService.create(ownerId, 'ABOBA', users));
  }

  @Delete('/delete')
  async delete(@Res() res: Response) {
    return res.send(await this.roomService.delete(ownerId, roomId));
  }

  @Patch('/addUsers')
  async addUsers(@Res() res: Response) {
    const users = ['6267fd0aaa12046c135ecb83'];
    return res.send(await this.roomService.addUsers(ownerId, roomId, users));
  }

  @Patch('/deleteUser')
  async deleteUser(@Res() res: Response) {
    const user = '6267fd0aaa12046c135ecb83';
    return res.send(await this.roomService.deleteUser(ownerId, roomId, user));
  }

  @Patch('/leaveRoom')
  async leaveRoom(@Res() res: Response) {
    const user = '6267fd0aaa12046c135ecb83';
    return res.send(await this.roomService.leaveRoom(ownerId, roomId));
  }

  @Patch('/changeName')
  async changeName(@Res() res: Response) {
    return res.send(
      await this.roomService.changeName(ownerId, roomId, 'ABOBA228'),
    );
  }

  @Patch('/changeAvatar')
  async changeAvatar(@Res() res: Response) {
    return res.send(
      await this.roomService.changeAvatar(
        ownerId,
        roomId,
        'https://www.iguides.ru/upload/medialibrary/9f8/9f8fdff471b7d281f81f694c100b5adc.png',
      ),
    );
  }

  @Get('/getRoomsUser')
  async getRoomsUser(@Res() res: Response) {
    return res.send(await this.roomService.getRoomsUser(ownerId));
  }
}
