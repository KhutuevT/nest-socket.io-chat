import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/authGuards/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('get-me')
  async findOneByToken(@Req() req: any) {
    return await this.userService.findOne(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.userService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('patch-me')
  update(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(req.user._id, updateUserDto);
  }
}
