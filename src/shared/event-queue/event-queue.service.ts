import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PaymentEventDto } from 'src/payment-webhooks/dto/create-payment.dto';

type EventHandler = (payload: PaymentEventDto) => Promise<void>;

interface QueuedEvent {
    type: string;
    payload: PaymentEventDto;
}

@Injectable()
export class EventQueueService implements OnModuleInit {
    private readonly logger = new Logger(EventQueueService.name);

    private handlers: Record<string, EventHandler[]> = {};
    private queue: QueuedEvent[] = [];
    private isProcessing = false;

    onModuleInit() {
        this.logger.log('Event queue initiated');
        this.processQueue();
    }

    /**
     * Publish an event to the queue
     */
    async publish(type: string, payload: PaymentEventDto): Promise<void> {
        this.queue.push({ type, payload });

        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    /**
     * Subscribe a handler to an event type
     */
    subscribe(type: string, handler: EventHandler) {
        if (!this.handlers[type]) {
            this.handlers[type] = [];
        }
        this.handlers[type].push(handler);
    }

    /**
     * Remove a handler for an event type
     */
    unsubscribe(type: string, handler: EventHandler) {
        if (!this.handlers[type]) return;
        this.handlers[type] = this.handlers[type].filter(h => h !== handler);
    }

    /**
     * Process events in the queue
     */
    private async processQueue() {
        if (this.isProcessing) return;

        this.isProcessing = true;

        while (this.queue.length > 0) {
            const event = this.queue.shift();
            if (!event) continue;

            const eventHandlers = this.handlers[event.type] || [];

            if (eventHandlers.length === 0) {
                this.logger.warn(`No handlers for event type "${event.type}"`);
                continue;
            }

            this.logger.debug(`Processing event "${event.type}" with ${eventHandlers.length} handlers`);

            // Run all handlers concurrently
            await Promise.allSettled(
                eventHandlers.map(async handler => {
                    try {
                        await handler(event.payload);
                    } catch (err) {
                        this.logger.error(
                            `Error in handler for "${event.type}": ${err instanceof Error ? err.message : err}`,
                            err instanceof Error ? err.stack : undefined,
                        );
                    }
                }),
            );
        }

        this.isProcessing = false;
        this.logger.log('Finished processing event queue');
    }
}
