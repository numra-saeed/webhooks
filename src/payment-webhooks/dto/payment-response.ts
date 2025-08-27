import { InvoiceStatus } from '../entities/invoice.entity';

export class PaymentEventResponse {
    status: InvoiceStatus;
    invoiceId: string;
}