export interface HomePageContent {
  id: string;
  section: string;
  key: string;
  value: string;
  type: string;
  displayName: string;
  description: string | null;
  sortOrder: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface InsertHomePageContent {
  section: string;
  key: string;
  value: string;
  type?: string;
  displayName: string;
  description?: string | null;
  sortOrder?: number | null;
}
