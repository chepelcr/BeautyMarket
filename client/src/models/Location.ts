export interface Province {
  id: number;
  name: string;
  code: string;
  createdAt: Date | null;
}

export interface Canton {
  id: number;
  provinceId: number;
  name: string;
  code: string;
  createdAt: Date | null;
}

export interface District {
  id: number;
  provinceId: number;
  cantonId: number;
  name: string;
  code: string;
  createdAt: Date | null;
}
