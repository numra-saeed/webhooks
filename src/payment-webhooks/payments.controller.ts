import { Body, Controller, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentEventDto } from './dto/create-payment.dto';
import { EventQueueService } from '../shared/event-queue/event-queue.service';
import { PaymentEventResponse } from './dto/payment-response';

@Controller('webhooks')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly eventQueue: EventQueueService,
  ) { }

  @Post('/payments')
  async createPayment(@Body() createPayment: PaymentEventDto): Promise<PaymentEventResponse> {
    return this.paymentsService.processPayment(createPayment);
  }

  @Post('/payment-events')
  async createPaymentEvent(@Body() createPayment: PaymentEventDto): Promise<{ status: string }> {
    await this.eventQueue.publish('paymentEvent', createPayment);
    return { status: 'Message received successfully' };
  }


}