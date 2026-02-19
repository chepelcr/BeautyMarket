const HACIENDA_API_BASE = import.meta.env.VITE_HACIENDA_API_URL || 'https://api.hacienda.go.cr';

interface CabysResult {
  codigo: string;
  descripcion: string;
  categorias: string[];
  impuesto: number;
  uri: string;
  estado: string;
}

interface CabysSearchResponse {
  total: number;
  cantidad: number;
  cabys: CabysResult[];
}

export function useHacienda() {
  const searchCabysByName = async (query: string, limit: number = 20): Promise<CabysResult[]> => {
    try {
      const response = await fetch(`${HACIENDA_API_BASE}/fe/cabys?q=${encodeURIComponent(query)}&top=${limit}`);
      if (!response.ok) throw new Error('Failed to search CABYS');
      const data: CabysSearchResponse = await response.json();
      return data.cabys || [];
    } catch (error) {
      console.error('Error searching CABYS:', error);
      return [];
    }
  };

  const getCabysByCode = async (code: string): Promise<CabysResult | null> => {
    try {
      const response = await fetch(`${HACIENDA_API_BASE}/fe/cabys?codigo=${code}`);
      if (!response.ok) throw new Error('Failed to get CABYS');
      const data: CabysResult[] = await response.json();
      return data[0] || null;
    } catch (error) {
      console.error('Error getting CABYS:', error);
      return null;
    }
  };

  return {
    searchCabysByName,
    getCabysByCode
  };
}
