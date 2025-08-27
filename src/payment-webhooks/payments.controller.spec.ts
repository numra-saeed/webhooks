import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { EventQueueService } from '../shared/event-queue/event-queue.service';
import { EventType, PaymentEventDto } from './dto/create-payment.dto';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let paymentsService: jest.Mocked<Record<keyof PaymentsService, jest.Mock>>;
  let eventQueue: Partial<Record<keyof EventQueueService, jest.Mock>>;

  beforeEach(async () => {
    paymentsService = {
      processPayment: jest.fn(),
    };

    eventQueue = {
      publish: jest.fn(),
      subscribe: jest.fn(), // mock subscribe to avoid calling real queue
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        { provide: PaymentsService, useValue: paymentsService },
        { provide: EventQueueService, useValue: eventQueue },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPayment', () => {
    it('should call paymentsService.processPayment with correct DTO and return its result', async () => {
      const dto: PaymentEventDto = {
        event_id: 'event-1',
        type: EventType.INVOICE_PAYMENT,
        invoice_id: 'invoice-1',
        amount_cents: 100,
      };

      const mockResult = {
        status: 'PAID',
        invoiceId: 'invoice-1',
        updatedPaidCents: 100,
      };

      paymentsService.processPayment!.mockResolvedValue(mockResult);

      const result = await controller.createPayment(dto);

      expect(paymentsService.processPayment).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResult);
    });

    it('should propagate errors from paymentsService', async () => {
      const dto: PaymentEventDto = {
        event_id: 'event-2',
        type: EventType.INVOICE_PAYMENT,
        invoice_id: 'invoice-2',
        amount_cents: 50,
      };

      const error = new Error('Some error');
      paymentsService.processPayment!.mockRejectedValue(error);

      await expect(controller.createPayment(dto)).rejects.toThrow(error);
    });
  });

  describe('createPaymentEvent', () => {
    it('should call eventQueue.publish and return success message', async () => {
      const dto: PaymentEventDto = {
        event_id: 'event-3',
        type: EventType.INVOICE_PAYMENT,
        invoice_id: 'invoice-3',
        amount_cents: 200,
      };

      eventQueue.publish!.mockResolvedValue(undefined);

      const result = await controller.createPaymentEvent(dto);

      expect(eventQueue.publish).toHaveBeenCalledWith('paymentEvent', dto);
      expect(result).toEqual({ status: 'Message received successfully' });
    });
  });

  describe('constructor subscription', () => {
    it('should subscribe to paymentEvent queue on initialization', () => {
      expect(eventQueue.subscribe).toHaveBeenCalledWith(
        'paymentEvent',
        expect.any(Function),
      );
    });
  });
});
