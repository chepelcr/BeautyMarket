import { useQuery } from "@tanstack/react-query";
import { dataApi } from "@/services/dataApi";
import { Icon } from "./Icon";
import { Select } from "./Input";
import type { LocationData } from "@/types/location";

interface LocationSelectProps {
  value: LocationData;
  onChange: (loc: LocationData) => void;
}

export function LocationSelect({ value, onChange }: LocationSelectProps) {
  const stateId = value.state_id ?? null;
  const countyId = value.county_id ?? null;
  const districtId = value.district_id ?? null;

  const { data: states = [], isLoading: statesLoading } = useQuery({
    queryKey: ["loc-states"],
    queryFn: dataApi.getStates,
    staleTime: 10 * 60 * 1000,
  });

  const { data: counties = [], isLoading: countiesLoading } = useQuery({
    queryKey: ["loc-counties", stateId],
    queryFn: () => dataApi.getCounties(stateId!),
    enabled: stateId != null && stateId > 0,
    staleTime: 10 * 60 * 1000,
  });

  const { data: districts = [], isLoading: districtsLoading } = useQuery({
    queryKey: ["loc-districts", stateId, countyId],
    queryFn: () => dataApi.getDistricts(stateId!, countyId!),
    enabled: stateId != null && stateId > 0 && countyId != null && countyId > 0,
    staleTime: 10 * 60 * 1000,
  });

  const { data: neighborhoods = [], isLoading: nbLoading } = useQuery({
    queryKey: ["loc-neighborhoods", stateId, countyId, districtId],
    queryFn: () => dataApi.getNeighborhoods(stateId!, countyId!, districtId!),
    enabled: stateId != null && stateId > 0 && countyId != null && countyId > 0 && districtId != null && districtId > 0,
    staleTime: 10 * 60 * 1000,
  });

  const handleState = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value ? parseInt(e.target.value) : null;
    onChange({ state_id: id, county_id: null, district_id: null, neighborhood_id: null, address: value.address });
  };

  const handleCounty = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value ? parseInt(e.target.value) : null;
    onChange({ ...value, county_id: id, district_id: null, neighborhood_id: null });
  };

  const handleDistrict = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value ? parseInt(e.target.value) : null;
    onChange({ ...value, district_id: id, neighborhood_id: null });
  };

  const handleNeighborhood = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value ? parseInt(e.target.value) : null;
    onChange({ ...value, neighborhood_id: id });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 4 }}>
        <div className="icon-pill" style={{ width: 26, height: 26, background: "hsl(var(--muted))" }}>
          <Icon name="mapPin" size={12} style={{ color: "hsl(var(--muted-foreground))" } as any} />
        </div>
        <span className="t-label">Ubicación</span>
        <span className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>(opcional)</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Province */}
        <div>
          <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Provincia</label>
          <Select
            value={stateId?.toString() ?? ""}
            onChange={handleState}
            disabled={statesLoading}
          >
            <option value="">{statesLoading ? "Cargando…" : "Seleccionar…"}</option>
            {states.sort((a, b) => a.state_id - b.state_id).map((s) => (
              <option key={s.state_id} value={s.state_id}>{s.state_name}</option>
            ))}
          </Select>
        </div>

        {/* Canton */}
        <div>
          <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Cantón</label>
          <Select
            value={countyId?.toString() ?? ""}
            onChange={handleCounty}
            disabled={!stateId || countiesLoading}
          >
            <option value="">{countiesLoading ? "Cargando…" : "Seleccionar…"}</option>
            {counties.map((c) => (
              <option key={c.county_id} value={c.county_id}>{c.county_name}</option>
            ))}
          </Select>
        </div>

        {/* District */}
        <div>
          <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Distrito</label>
          <Select
            value={districtId?.toString() ?? ""}
            onChange={handleDistrict}
            disabled={!countyId || districtsLoading}
          >
            <option value="">{districtsLoading ? "Cargando…" : "Seleccionar…"}</option>
            {districts.map((d) => (
              <option key={d.district_id} value={d.district_id}>{d.district_name}</option>
            ))}
          </Select>
        </div>

        {/* Neighborhood */}
        <div>
          <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Barrio</label>
          <Select
            value={value.neighborhood_id?.toString() ?? ""}
            onChange={handleNeighborhood}
            disabled={!districtId || nbLoading}
          >
            <option value="">{nbLoading ? "Cargando…" : "Seleccionar…"}</option>
            {neighborhoods.map((n) => (
              <option key={n.neighborhood_id} value={n.neighborhood_id}>{n.neighborhood_name}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Otras señas</label>
        <textarea
          className="input"
          rows={2}
          value={value.address ?? ""}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
          placeholder="Sector norte, fila 3, frente a la entrada principal"
          style={{ width: "100%", resize: "vertical", fontFamily: "var(--font-sans)", fontSize: 14 }}
        />
      </div>
    </div>
  );
}
