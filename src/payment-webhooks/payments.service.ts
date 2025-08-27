import { DataSource } from "typeorm";
import { InvoiceStatus } from "./entities/invoice.entity";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { PaymentsRepository } from "./payment.repository";
import { PaymentEventDto } from "./dto/create-payment.dto";

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);

    constructor(
        private dataSource: DataSource,
        private paymentsRepository: PaymentsRepository
    ) { }

    public async processPayment(payment: PaymentEventDto) {
        return this.dataSource.transaction(async (transactionManager) => {
            this.logger.debug(`Processing payment event: ${payment.event_id}`);

            const invoice = await this.paymentsRepository.findInvoice(transactionManager, payment.invoice_id);
            if (!invoice) throw new BadRequestException(`Invoice not found: ${payment.invoice_id}`);

            try {
                await this.paymentsRepository.insertPaymentEvent(transactionManager, payment, invoice);
            } catch (err: any) {
                if (err.code === '23505') { // error code for duplication key error

                    this.logger.warn(`Duplicate payment event exist in database: ${payment.event_id}`);
                    throw new BadRequestException(`Duplicate payment event exist in database: ${payment.event_id}`)
                }
                throw err;
            }
            const updatedPaidCents = invoice.paidCents + payment.amount_cents;
            const newStatus = this.calculateStatus(updatedPaidCents, invoice.totalCents);

            if (newStatus !== invoice.status) {
                await this.paymentsRepository.updateInvoice(transactionManager, invoice.id, {
                    status: newStatus,
                    paidCents: updatedPaidCents,
                });
                this.logger.log(`Invoice ${invoice.id} status updated from ${invoice.status} to ${newStatus}`);
            }

            return { status: newStatus, invoiceId: invoice.id, updatedPaidCents };
        });
    }

    private calculateStatus(paidCents: number, totalCents: number): InvoiceStatus {
        if (paidCents <= 0) return InvoiceStatus.SENT;
        if (paidCents < totalCents) return InvoiceStatus.PARTIALLY_PAID;
        return InvoiceStatus.PAID;
    }
}
