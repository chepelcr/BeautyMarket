export interface OrderSearchFilters {
  textSearch?: string;
  status?: string;
  startDate?: string;          // delivery date range start (YYYY-MM-DD)
  endDate?: string;            // delivery date range end (YYYY-MM-DD)
  creationStartDate?: string;  // creation date range start (YYYY-MM-DD)
  creationEndDate?: string;    // creation date range end (YYYY-MM-DD)
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const SORT_FIELD_MAP: Record<string, string> = {
  createdAt: 'createdOn',
  customerName: 'clientName',
  deliveryDate: 'deliveryDate',
  documentNumber: 'documentNumber',
};

function toApiDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

export function buildOrderSearchString(filters: OrderSearchFilters): string {
  const parts: string[] = [];

  // Text search → OR across multiple fields
  if (filters.textSearch) {
    const v = filters.textSearch;
    parts.push(`(documentNumber:${v},clientName:${v},deliverToName:${v},deliverToCode:${v},confirmationNumber:${v})`);
  }

  if (filters.status) {
    parts.push(`orderStatus:${filters.status}`);
  }

  // Delivery date range
  if (filters.startDate && filters.endDate) {
    parts.push(`deliveryDate:${toApiDate(filters.startDate)}~${toApiDate(filters.endDate)}`);
  } else if (filters.startDate) {
    parts.push(`deliveryDate>${toApiDate(filters.startDate)}`);
  } else if (filters.endDate) {
    parts.push(`deliveryDate<${toApiDate(filters.endDate)}`);
  }

  // Creation date range
  if (filters.creationStartDate && filters.creationEndDate) {
    parts.push(`creationDate:${toApiDate(filters.creationStartDate)}~${toApiDate(filters.creationEndDate)}`);
  } else if (filters.creationStartDate) {
    parts.push(`creationDate>${toApiDate(filters.creationStartDate)}`);
  } else if (filters.creationEndDate) {
    parts.push(`creationDate<${toApiDate(filters.creationEndDate)}`);
  }

  if (filters.sortBy) {
    const apiField = SORT_FIELD_MAP[filters.sortBy] || filters.sortBy;
    const op = filters.sortOrder === 'asc' ? '>' : '<';
    parts.push(`orderBy${op}${apiField}`);
  }

  return parts.join(',');
}
