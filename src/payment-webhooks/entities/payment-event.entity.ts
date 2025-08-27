import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';
import { Invoices } from './invoice.entity';

@Entity('payment_events')
export class PaymentEvents {

    @PrimaryColumn({ type: 'varchar' })
    eventId: string;

    @Column({ type: 'varchar' })
    type: string;

    @Column({ type: 'int' })
    amountCents: number;

    @ManyToOne(() => Invoices, (invoice) => invoice.payments)
    invoice: Invoices;
}
