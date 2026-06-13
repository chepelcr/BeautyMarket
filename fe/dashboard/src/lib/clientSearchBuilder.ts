export interface ClientSearchFilters {
  textSearch?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const SORT_FIELD_MAP: Record<string, string> = {
  client_name: 'client_name',
  client_gln: 'client_gln',
  created_at: 'created_on',
  updated_at: 'updated_on',
};

export function buildClientSearchString(filters: ClientSearchFilters): string {
  const parts: string[] = [];

  if (filters.textSearch) {
    const v = `*${filters.textSearch}*`;
    parts.push(`client_name:${v}`);
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
