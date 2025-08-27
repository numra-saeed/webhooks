import { IsEnum, IsInt, IsPositive, IsString, IsUUID } from 'class-validator';

export enum EventType {
    INVOICE_PAYMENT = 'INVOICE_PAYMENT'
}

export class PaymentEventDto {
    @IsString()
    event_id: string;

    @IsEnum(EventType, { message: 'type must be a valid EventType' })
    type: EventType;

    @IsUUID()
    invoice_id: string;

    @IsInt()
    @IsPositive()
    amount_cents: number;
}