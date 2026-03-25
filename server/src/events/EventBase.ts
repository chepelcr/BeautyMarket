/**
 * Abstract base class for all domain events published to SNS/SQS.
 *
 * Serializes to the canonical event JSON contract:
 *   { id, date, eventType, _type, data }
 */
export abstract class EventBase<T> {
  readonly id: string;
  readonly date: string;
  readonly eventType: string;
  readonly data: T | null;
  abstract readonly _type: string;

  constructor(eventType: string, data: T | null = null) {
    this.id = crypto.randomUUID();
    this.date = new Date().toISOString();
    this.eventType = eventType;
    this.data = data;
  }

  /** Serialize to SNS/SQS message body object. */
  toSqsMessage(): Record<string, unknown> {
    const msg: Record<string, unknown> = {
      id: this.id,
      date: this.date,
      eventType: this.eventType,
      _type: this._type,
    };
    if (this.data !== null && this.data !== undefined) {
      msg.data = this.data;
    }
    return msg;
  }
}
