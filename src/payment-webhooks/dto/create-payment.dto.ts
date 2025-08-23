import { IsUUID, IsInt, Min, IsString } from 'class-validator';

export class CreatePaymentDto {
    @IsUUID()
    event_id: string;

    @IsString()
    type: string;

    @IsUUID()
    invoice_id: string;

    @IsInt()
    @Min(1)
    amount_cents: number;
}