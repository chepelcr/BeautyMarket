export interface StoreSearchFilters {
  textSearch?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const SORT_FIELD_MAP: Record<string, string> = {
  storeCode: 'storeCode',
  storeName: 'storeName',
  chain: 'chain',
  slotId: 'slotId',
};

export function buildStoreSearchString(filters: StoreSearchFilters): string {
  const parts: string[] = [];

  if (filters.textSearch) {
    const v = `*${filters.textSearch}*`;
    parts.push(`storeName:${v}`);
  }

  if (filters.sortBy) {
    const apiField = SORT_FIELD_MAP[filters.sortBy] || filters.sortBy;
    const op = filters.sortOrder === 'asc' ? '>' : '<';
    parts.push(`orderBy${op}${apiField}`);
  }

  return parts.join(',');
}
