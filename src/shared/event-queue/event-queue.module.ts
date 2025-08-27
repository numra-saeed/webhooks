import { Module } from '@nestjs/common';
import { EventQueueService } from './event-queue.service';

@Module({
  controllers: [],
  providers: [EventQueueService],
  exports: [EventQueueService]
})
export class EventQueueModule { }
