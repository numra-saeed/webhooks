import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {

    constructor() { }

    async processPayment(payment: CreatePaymentDto) {
    }
}
