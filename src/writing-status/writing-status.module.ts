import { Module } from '@nestjs/common';
import { WritingStatusService } from './writing-status.service';
import { WritingStatusController } from './writing-status.controller';

@Module({
  controllers: [WritingStatusController],
  providers: [WritingStatusService]
})
export class WritingStatusModule {}
