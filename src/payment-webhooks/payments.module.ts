import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { EventQueueModule } from 'src/shared/event-queue/event-queue.module';
import { PaymentsRepository } from './payment.repository';

@Module({
  imports: [EventQueueModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsRepository],
})
export class PaymentsModule { }
