import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/authGuards/jwt-auth.guard';
import { WritingStatusService } from './writing-status.service';

@Controller('writing-status')
export class WritingStatusController {
  constructor(private readonly writingStatusService: WritingStatusService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req) {
    const id = req.user._id;
    return this.writingStatusService.create(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.writingStatusService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  remove(@Req() req) {
    const id = req.user._id;
    return this.writingStatusService.remove(id);
  }
}
