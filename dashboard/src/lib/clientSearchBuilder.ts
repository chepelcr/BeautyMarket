export interface ClientSearchFilters {
  textSearch?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const SORT_FIELD_MAP: Record<string, string> = {
  clientName: 'clientName',
  clientGln: 'clientGln',
  createdAt: 'createdOn',
  updatedAt: 'updatedOn',
};

export function buildClientSearchString(filters: ClientSearchFilters): string {
  const parts: string[] = [];

  if (filters.textSearch) {
    const v = `*${filters.textSearch}*`;
    parts.push(`clientName:${v}`);
  }

  if (filters.status) {
    parts.push(`status:${filters.status}`);
  }

  if (filters.sortBy) {
    const apiField = SORT_FIELD_MAP[filters.sortBy] || filters.sortBy;
    const op = filters.sortOrder === 'asc' ? '>' : '<';
    parts.push(`orderBy${op}${apiField}`);
  }

  return parts.join(',');
}
