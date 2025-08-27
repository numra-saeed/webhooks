import { Module } from '@nestjs/common';
import { PaymentsModule } from './payment-webhooks/payments.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoices } from './payment-webhooks/entities/invoice.entity';
import { PaymentEvents } from './payment-webhooks/entities/payment-event.entity';

@Module({
  imports: [
    PaymentsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'nestuser',
      password: 'root',
      database: 'nestdb',
      synchronize: true,
      entities: [Invoices, PaymentEvents]
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
