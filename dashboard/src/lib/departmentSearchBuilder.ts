export interface DepartmentSearchFilters {
  textSearch?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const SORT_FIELD_MAP: Record<string, string> = {
  departmentCode: 'departmentCode',
  name: 'name',
  supplierCode: 'supplierCode',
  createdOn: 'createdOn',
  updatedOn: 'updatedOn',
};

export function buildDepartmentSearchString(filters: DepartmentSearchFilters): string {
  const parts: string[] = [];

  if (filters.textSearch) {
    const v = `*${filters.textSearch}*`;
    parts.push(`name:${v}`);
  }

  if (filters.sortBy) {
    const apiField = SORT_FIELD_MAP[filters.sortBy] || filters.sortBy;
    const op = filters.sortOrder === 'asc' ? '>' : '<';
    parts.push(`orderBy${op}${apiField}`);
  }

  return parts.join(',');
}
