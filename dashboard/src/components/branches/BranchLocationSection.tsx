import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { dataApiClient } from "@/services/data-api";
import type { StateResponse, CountyResponse, DistrictResponse } from "@/services/data-api/dtos/locations";

const COSTA_RICA_CODE = '188';

interface BranchLocationSectionProps {
  formData: {
    state_id: number | null;
    county_id: number | null;
    district_id: number | null;
    neighborhood: string;
    address: string;
  };
  onChange: (data: any) => void;
}

export function BranchLocationSection({ formData, onChange }: BranchLocationSectionProps) {
  // Fetch states
  const { data: statesData, isLoading: statesLoading, error: statesError, refetch: refetchStates } = useQuery({
    queryKey: ['states', COSTA_RICA_CODE],
    queryFn: () => dataApiClient.getStates({ iso_code: COSTA_RICA_CODE }),
  });

  // Fetch counties when state is selected
  const { data: countiesData, isLoading: countiesLoading, error: countiesError, refetch: refetchCounties } = useQuery({
    queryKey: ['counties', COSTA_RICA_CODE, formData.state_id],
    queryFn: () => dataApiClient.getCounties({ 
      iso_code: COSTA_RICA_CODE, 
      state_id: formData.state_id! 
    }),
    enabled: !!formData.state_id && formData.state_id > 0,
  });

  // Fetch districts when county is selected
  const { data: districtsData, isLoading: districtsLoading, error: districtsError, refetch: refetchDistricts } = useQuery({
    queryKey: ['districts', COSTA_RICA_CODE, formData.state_id, formData.county_id],
    queryFn: () => dataApiClient.getDistricts({ 
      iso_code: COSTA_RICA_CODE, 
      state_id: formData.state_id!,
      county_id: formData.county_id!
    }),
    enabled: !!formData.state_id && formData.state_id > 0 && !!formData.county_id && formData.county_id > 0,
  });

  const handleStateChange = (value: string) => {
    const stateId = parseInt(value);
    onChange({ ...formData, state_id: stateId, county_id: null, district_id: null });
  };

  const handleCountyChange = (value: string) => {
    const countyId = parseInt(value);
    onChange({ ...formData, county_id: countyId, district_id: null });
  };

  const handleDistrictChange = (value: string) => {
    const districtId = parseInt(value);
    onChange({ ...formData, district_id: districtId });
  };

  const states: StateResponse[] = statesData?.data || [];
  const counties: CountyResponse[] = countiesData?.data || [];
  const districts: DistrictResponse[] = districtsData?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium mb-3">
        <MapPin className="h-4 w-4" />
        <span>Ubicación</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* State */}
        <div className="space-y-1.5">
          <Label>Provincia</Label>
          {statesError ? (
            <div className="space-y-2">
              <Select disabled>
                <SelectTrigger className="bg-muted">
                  <SelectValue placeholder="Error" />
                </SelectTrigger>
              </Select>
              <div className="text-sm text-destructive flex items-center gap-2">
                Error al cargar
                <Button 
                  type="button"
                  variant="link" 
                  size="sm" 
                  onClick={() => refetchStates()}
                  className="h-auto p-0"
                >
                  Reintentar
                </Button>
              </div>
            </div>
          ) : (
            <Select 
              onValueChange={handleStateChange} 
              value={formData.state_id != null ? formData.state_id.toString() : "0"}
              disabled={statesLoading}
            >
              <SelectTrigger className={statesLoading ? "bg-muted" : ""}>
                <SelectValue placeholder={statesLoading ? "Cargando..." : "Seleccionar"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Seleccionar provincia</SelectItem>
                {states.sort((a, b) => a.state_id - b.state_id).map((state) => (
                  <SelectItem key={state.state_id} value={state.state_id.toString()}>
                    {state.state_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* County */}
        <div className="space-y-1.5">
          <Label>Cantón</Label>
          {countiesError ? (
            <div className="space-y-2">
              <Select disabled>
                <SelectTrigger className="bg-muted">
                  <SelectValue placeholder="Error" />
                </SelectTrigger>
              </Select>
              <div className="text-sm text-destructive flex items-center gap-2">
                Error al cargar
                <Button 
                  type="button"
                  variant="link" 
                  size="sm" 
                  onClick={() => refetchCounties()}
                  className="h-auto p-0"
                >
                  Reintentar
                </Button>
              </div>
            </div>
          ) : (
            <Select 
              onValueChange={handleCountyChange} 
              value={formData.county_id != null ? formData.county_id.toString() : "0"} 
              disabled={!formData.state_id || formData.state_id === 0 || countiesLoading}
            >
              <SelectTrigger className={(countiesLoading || !formData.state_id || formData.state_id === 0) ? "bg-muted" : ""}>
                <SelectValue placeholder={countiesLoading ? "Cargando..." : "Seleccionar"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Seleccionar cantón</SelectItem>
                {counties.map((county) => (
                  <SelectItem key={county.county_id} value={county.county_id.toString()}>
                    {county.county_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* District */}
        <div className="space-y-1.5">
          <Label>Distrito</Label>
          {districtsError ? (
            <div className="space-y-2">
              <Select disabled>
                <SelectTrigger className="bg-muted">
                  <SelectValue placeholder="Error" />
                </SelectTrigger>
              </Select>
              <div className="text-sm text-destructive flex items-center gap-2">
                Error al cargar
                <Button 
                  type="button"
                  variant="link" 
                  size="sm" 
                  onClick={() => refetchDistricts()}
                  className="h-auto p-0"
                >
                  Reintentar
                </Button>
              </div>
            </div>
          ) : (
            <Select 
              onValueChange={handleDistrictChange} 
              value={formData.district_id != null ? formData.district_id.toString() : "0"} 
              disabled={!formData.county_id || formData.county_id === 0 || districtsLoading}
            >
              <SelectTrigger className={(districtsLoading || !formData.county_id || formData.county_id === 0) ? "bg-muted" : ""}>
                <SelectValue placeholder={districtsLoading ? "Cargando..." : "Seleccionar"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Seleccionar distrito</SelectItem>
                {districts.map((district) => (
                  <SelectItem key={district.district_id} value={district.district_id.toString()}>
                    {district.district_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Neighborhood (text input, not dropdown) */}
        <div className="space-y-1.5">
          <Label htmlFor="b-neighborhood">Barrio</Label>
          <input
            id="b-neighborhood"
            type="text"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.neighborhood}
            onChange={e => onChange({ ...formData, neighborhood: e.target.value })}
            placeholder="Barrio Escalante"
          />
        </div>
      </div>
      
      {/* Address */}
      <div className="space-y-1.5">
        <Label htmlFor="b-address">Otras señas</Label>
        <textarea
          id="b-address"
          className="w-full p-2 border rounded-md bg-background text-foreground text-sm"
          rows={2}
          value={formData.address}
          onChange={e => onChange({ ...formData, address: e.target.value })}
          placeholder="Sector norte, fila 3, frente a la entrada principal"
        />
      </div>
    </div>
  );
}
