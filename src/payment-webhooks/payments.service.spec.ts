import { BadRequestException } from '@nestjs/common/exceptions';
import { Test, TestingModule } from '@nestjs/testing';
import { EventType, PaymentEventDto } from './dto/create-payment.dto';
import { InvoiceStatus } from './entities/invoice.entity';
import { PaymentsService } from './payments.service';
import { DataSource, InsertResult } from 'typeorm';
import { PaymentsRepository } from './payment.repository';
import { Logger } from '@nestjs/common';
import { UpdateResult } from 'typeorm/browser';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentsRepository: jest.Mocked<PaymentsRepository>;
  let dataSourceMock: Partial<DataSource>;

  beforeEach(async () => {
    paymentsRepository = {
      findInvoice: jest.fn(),
      insertPaymentEvent: jest.fn(),
      updateInvoice: jest.fn(),
    } as unknown as jest.Mocked<PaymentsRepository>;

    dataSourceMock = {
      transaction: jest.fn().mockImplementation(async (callback) => {
        return callback({});
      }),
    };

    const loggerMock: Partial<Logger> = {
      log: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PaymentsRepository, useValue: paymentsRepository },
        { provide: DataSource, useValue: dataSourceMock },
        { provide: Logger, useValue: loggerMock },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw BadRequestException if invoice not found', async () => {
    paymentsRepository.findInvoice.mockResolvedValue(null);

    const dto: PaymentEventDto = {
      event_id: 'event-1',
      type: EventType.INVOICE_PAYMENT,
      invoice_id: 'invoice-1',
      amount_cents: 100,
    };

    await expect(service.processPayment(dto)).rejects.toThrow(BadRequestException);
  });

  it('should insert payment and update invoice as partially paid', async () => {
    const invoice = {
      id: 'invoice-1',
      totalCents: 500,
      paidCents: 100,
      status: InvoiceStatus.SENT,
      payments: [],
    };

    paymentsRepository.findInvoice.mockResolvedValue(invoice);
    paymentsRepository.insertPaymentEvent.mockResolvedValue(undefined as unknown as InsertResult);
    paymentsRepository.updateInvoice.mockResolvedValue(undefined as unknown as UpdateResult);

    const dto: PaymentEventDto = {
      event_id: 'event-1',
      type: EventType.INVOICE_PAYMENT,
      invoice_id: 'invoice-1',
      amount_cents: 200,
    };

    const result = await service.processPayment(dto);

    expect(paymentsRepository.insertPaymentEvent).toHaveBeenCalledWith({}, dto, invoice);
    expect(paymentsRepository.updateInvoice).toHaveBeenCalledWith({}, 'invoice-1', {
      paidCents: 300,
      status: InvoiceStatus.PARTIALLY_PAID,
    });
    expect(result).toEqual({
      status: InvoiceStatus.PARTIALLY_PAID,
      invoiceId: 'invoice-1',
      updatedPaidCents: 300,
    });
  });

  it('should mark invoice as fully paid if paid_cents reaches total', async () => {
    const invoice = {
      id: 'invoice-2',
      totalCents: 300,
      paidCents: 200,
      status: InvoiceStatus.PARTIALLY_PAID,
      payments: [],
    };

    paymentsRepository.findInvoice.mockResolvedValue(invoice);
    paymentsRepository.insertPaymentEvent.mockResolvedValue(undefined as unknown as InsertResult);
    paymentsRepository.updateInvoice.mockResolvedValue(undefined as unknown as UpdateResult);

    const dto: PaymentEventDto = {
      event_id: 'event-2',
      type: EventType.INVOICE_PAYMENT,
      invoice_id: 'invoice-2',
      amount_cents: 100,
    };

    const result = await service.processPayment(dto);

    expect(paymentsRepository.updateInvoice).toHaveBeenCalledWith({}, 'invoice-2', {
      paidCents: 300,
      status: InvoiceStatus.PAID,
    });
    expect(result.status).toBe(InvoiceStatus.PAID);
  });

  it('should throw BadRequestException for negative payment amount', async () => {
    const dto: PaymentEventDto = {
      event_id: 'event-3',
      type: EventType.INVOICE_PAYMENT,
      invoice_id: 'invoice-3',
      amount_cents: -50,
    };

    await expect(service.processPayment(dto)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException for zero payment amount', async () => {
    const dto: PaymentEventDto = {
      event_id: 'event-4',
      type: EventType.INVOICE_PAYMENT,
      invoice_id: 'invoice-4',
      amount_cents: 0,
    };

    await expect(service.processPayment(dto)).rejects.toThrow(BadRequestException);
  });
});
