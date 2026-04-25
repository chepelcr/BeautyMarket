import { createClient } from "@/lib/api";

const DATA_API_BASE = import.meta.env.VITE_DATA_API_URL || "https://data-api.jcampos.dev";
const client = createClient(DATA_API_BASE);
const CR = "188";

export interface StateItem { state_id: number; state_name: string; }
export interface CountyItem { county_id: number; county_name: string; }
export interface DistrictItem { district_id: number; district_name: string; }
export interface NeighborhoodItem { neighborhood_id: number; neighborhood_name: string; }

export const dataApi = {
  getStates: () =>
    client.get<StateItem[]>(`/countries/${CR}/states`),
  getCounties: (stateId: number) =>
    client.get<CountyItem[]>(`/countries/${CR}/states/${stateId}/counties`),
  getDistricts: (stateId: number, countyId: number) =>
    client.get<DistrictItem[]>(`/countries/${CR}/states/${stateId}/counties/${countyId}/districts`),
  getNeighborhoods: (stateId: number, countyId: number, districtId: number) =>
    client.get<NeighborhoodItem[]>(`/countries/${CR}/states/${stateId}/counties/${countyId}/districts/${districtId}/neighborhoods`),
};
