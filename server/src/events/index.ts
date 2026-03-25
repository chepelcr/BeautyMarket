export { EventBase } from './EventBase';
export { EventCodes } from './EventCodes';
export { OrganizationRegisteredEvent } from './OrganizationRegisteredEvent';
export type { OrganizationRegisteredData } from './OrganizationRegisteredEvent';

import type { EventBase } from './EventBase';
import { OrganizationRegisteredEvent } from './OrganizationRegisteredEvent';

type EventConstructor = new (data: any) => EventBase<unknown>;

const EVENT_REGISTRY: Record<string, EventConstructor> = {
  OrganizationRegisteredEvent: OrganizationRegisteredEvent as unknown as EventConstructor,
};

/**
 * Parse an SNS/SQS message body using the _type discriminator.
 * Throws if _type is missing or unknown.
 */
export function parseEvent(body: Record<string, unknown>): EventBase<unknown> {
  const type = body['_type'] as string | undefined;
  if (!type) throw new Error("Event body missing '_type' field");
  const EventClass = EVENT_REGISTRY[type];
  if (!EventClass) {
    throw new Error(
      `Unknown event type: ${type}. Known: ${Object.keys(EVENT_REGISTRY).join(', ')}`
    );
  }
  return Object.assign(new EventClass(body['data']), body) as EventBase<unknown>;
}
