import { dataApiClient } from '../services/data-api';
import type { CabysItem, CabysSearchResponse } from '../services/data-api';

export function useHacienda() {
  const searchCabys = async (
    iso_code: string, 
    query: string, 
    page: number = 1,
    size: number = 20,
    productTypeId?: number
  ): Promise<CabysSearchResponse> => {
    try {
      const result = await dataApiClient.searchCabys({ 
        iso_code, 
        search: query, 
        page,
        size,
        type: productTypeId 
      });
      return result;
    } catch (error) {
      console.error('Error searching CABYS:', error);
      return { total: 0, page: 1, size: 20, count: 0, items: [] };
    }
  };

  const searchCabysByName = async (iso_code: string, query: string, limit: number = 20): Promise<CabysItem[]> => {
    try {
      const result = await searchCabys(iso_code, query, 1, limit);
      return result.items;
    } catch (error) {
      console.error('Error searching CABYS:', error);
      return [];
    }
  };

  const getCabysByCode = async (iso_code: string, code: string): Promise<CabysItem | null> => {
    try {
      const result = await searchCabys(iso_code, code, 1, 1);
      return result.items[0] || null;
    } catch (error) {
      console.error('Error getting CABYS:', error);
      return null;
    }
  };

  return {
    searchCabys,
    searchCabysByName,
    getCabysByCode,
  };
}
