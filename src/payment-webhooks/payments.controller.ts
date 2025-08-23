import { Body, Controller, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('webhooks/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Post()
  async create(@Body() createPayment: CreatePaymentDto) {
    const invoice = await this.paymentsService.processPayment(createPayment);
    return { invoice };
  }


}