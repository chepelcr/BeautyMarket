import { EventBase } from './EventBase';
import { EventCodes } from './EventCodes';

export interface OrganizationRegisteredData {
  id: string;
  name: string;
  slug: string;
  domain?: string;     // Organization.customDomain — present only when set
  subdomain?: string;  // Organization.subdomain — present only when set
}

export class OrganizationRegisteredEvent extends EventBase<OrganizationRegisteredData> {
  readonly _type = 'OrganizationRegisteredEvent' as const;

  constructor(data: OrganizationRegisteredData) {
    super(EventCodes.ORGANIZATION_REGISTERED, data);
  }
}
