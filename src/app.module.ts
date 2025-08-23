import { Module } from '@nestjs/common';
import { PaymentsModule } from './payment-webhooks/payments.module';

@Module({
  imports: [PaymentsModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
