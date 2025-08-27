import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { PaymentEvents } from './payment-event.entity';

export enum InvoiceStatus {
    SENT = 'sent',
    PARTIALLY_PAID = 'partially_paid',
    PAID = 'paid',
}

@Entity('invoices')
export class Invoices {
    @PrimaryColumn({ type: 'varchar' })
    id: string;

    @Column({ type: 'varchar', default: InvoiceStatus.SENT })
    status: InvoiceStatus;

    @Column({ type: 'int' })
    totalCents: number;

    @Column({ type: 'int' })
    paidCents: number;

    @OneToMany(() => PaymentEvents, (event) => event.invoice)
    payments: PaymentEvents[];

}