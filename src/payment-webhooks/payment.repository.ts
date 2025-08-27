import { Injectable } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { Invoices } from "./entities/invoice.entity";
import { PaymentEventDto } from "./dto/create-payment.dto";
import { PaymentEvents } from "./entities/payment-event.entity";

@Injectable()
export class PaymentsRepository {
    constructor() { }

    async findInvoice(transactionManager: EntityManager, invoiceId: string) {
        return transactionManager.findOne(Invoices, {
            where: { id: invoiceId },
            relations: ['payments'],
        });
    }

    async insertPaymentEvent(transactionManager: EntityManager, payment: PaymentEventDto, invoice: Invoices) {
        return transactionManager.insert(PaymentEvents, {
            eventId: payment.event_id,
            type: payment.type,
            amountCents: payment.amount_cents,
            invoice,
        });
    }

    async updateInvoice(transactionManager: EntityManager, invoiceId: string, update: Partial<Invoices>) {
        return transactionManager.update(Invoices, { id: invoiceId }, update);
    }
}
