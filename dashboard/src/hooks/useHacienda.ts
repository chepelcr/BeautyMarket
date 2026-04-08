import { dataApiClient } from '../services/data-api';
import type { CabysItem } from '../services/data-api';

export function useHacienda() {
  const searchCabysByName = async (iso_code: string, query: string, limit: number = 20): Promise<CabysItem[]> => {
    try {
      const result = await dataApiClient.searchCabys({ iso_code, search: query, size: limit });
      return result.items;
    } catch (error) {
      console.error('Error searching CABYS:', error);
      return [];
    }
  };

  const getCabysByCode = async (iso_code: string, code: string): Promise<CabysItem | null> => {
    try {
      const result = await dataApiClient.searchCabys({ iso_code, search: code, size: 1 });
      return result.items[0] || null;
    } catch (error) {
      console.error('Error getting CABYS:', error);
      return null;
    }
  };

  return {
    searchCabysByName,
    getCabysByCode,
  };
}
