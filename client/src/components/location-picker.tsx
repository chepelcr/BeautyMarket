import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { 
  getProvinces, 
  getCantonsByProvinceCode, 
  getDistrictsByCantonCode,
  type Province,
  type Canton,
  type District 
} from "@/data/locations";

interface LocationPickerProps {
  control: Control<any>;
  provinceFieldName?: string;
  cantonFieldName?: string;
  districtFieldName?: string;
  onLocationChange?: (province: string, canton: string, district: string) => void;
  required?: boolean;
  disabled?: boolean;
}

export default function LocationPicker({
  control,
  provinceFieldName = "provincia",
  cantonFieldName = "canton",
  districtFieldName = "distrito",
  onLocationChange,
  required = true,
  disabled = false
}: LocationPickerProps) {
  const [provinces] = useState<Province[]>(getProvinces());
  const [cantons, setCantons] = useState<Canton[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedCanton, setSelectedCanton] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");

  const handleProvinceChange = (provinceCode: string) => {
    setSelectedProvince(provinceCode);
    setSelectedCanton("");
    setSelectedDistrict("");
    
    const newCantons = getCantonsByProvinceCode(provinceCode);
    setCantons(newCantons);
    setDistricts([]);
    
    if (onLocationChange) {
      onLocationChange(provinceCode, "", "");
    }
  };

  const handleCantonChange = (cantonCode: string) => {
    setSelectedCanton(cantonCode);
    setSelectedDistrict("");
    
    const newDistricts = getDistrictsByCantonCode(selectedProvince, cantonCode);
    setDistricts(newDistricts);
    
    if (onLocationChange) {
      onLocationChange(selectedProvince, cantonCode, "");
    }
  };

  const handleDistrictChange = (districtCode: string) => {
    setSelectedDistrict(districtCode);
    
    if (onLocationChange) {
      onLocationChange(selectedProvince, selectedCanton, districtCode);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Province Selector */}
      <FormField
        control={control}
        name={provinceFieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Provincia {required && <span className="text-red-500">*</span>}</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                handleProvinceChange(value);
              }}
              value={field.value}
              disabled={disabled}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar provincia" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {provinces.map((province) => (
                  <SelectItem key={province.code} value={province.code}>
                    {province.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Canton Selector */}
      <FormField
        control={control}
        name={cantonFieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cantón {required && <span className="text-red-500">*</span>}</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                handleCantonChange(value);
              }}
              value={field.value}
              disabled={disabled || !selectedProvince}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cantón" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {cantons.map((canton) => (
                  <SelectItem key={canton.code} value={canton.code}>
                    {canton.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* District Selector */}
      <FormField
        control={control}
        name={districtFieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Distrito {required && <span className="text-red-500">*</span>}</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                handleDistrictChange(value);
              }}
              value={field.value}
              disabled={disabled || !selectedCanton}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar distrito" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {districts.map((district) => (
                  <SelectItem key={district.code} value={district.code}>
                    {district.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

// Simplified version for basic use cases
interface SimpleLocationPickerProps {
  onLocationChange: (province: string, canton: string, district: string) => void;
  disabled?: boolean;
  className?: string;
}

export function SimpleLocationPicker({ 
  onLocationChange, 
  disabled = false, 
  className = "" 
}: SimpleLocationPickerProps) {
  const [provinces] = useState<Province[]>(getProvinces());
  const [cantons, setCantons] = useState<Canton[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedCanton, setSelectedCanton] = useState<string>("");

  const handleProvinceChange = (provinceCode: string) => {
    setSelectedProvince(provinceCode);
    setSelectedCanton("");
    
    const newCantons = getCantonsByProvinceCode(provinceCode);
    setCantons(newCantons);
    setDistricts([]);
    
    onLocationChange(provinceCode, "", "");
  };

  const handleCantonChange = (cantonCode: string) => {
    setSelectedCanton(cantonCode);
    
    const newDistricts = getDistrictsByCantonCode(selectedProvince, cantonCode);
    setDistricts(newDistricts);
    
    onLocationChange(selectedProvince, cantonCode, "");
  };

  const handleDistrictChange = (districtCode: string) => {
    onLocationChange(selectedProvince, selectedCanton, districtCode);
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      <Select
        onValueChange={handleProvinceChange}
        disabled={disabled}
        value={selectedProvince}
      >
        <SelectTrigger>
          <SelectValue placeholder="Provincia" />
        </SelectTrigger>
        <SelectContent>
          {provinces.map((province) => (
            <SelectItem key={province.code} value={province.code}>
              {province.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={handleCantonChange}
        disabled={disabled || !selectedProvince}
        value={selectedCanton}
      >
        <SelectTrigger>
          <SelectValue placeholder="Cantón" />
        </SelectTrigger>
        <SelectContent>
          {cantons.map((canton) => (
            <SelectItem key={canton.code} value={canton.code}>
              {canton.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={handleDistrictChange}
        disabled={disabled || !selectedCanton}
      >
        <SelectTrigger>
          <SelectValue placeholder="Distrito" />
        </SelectTrigger>
        <SelectContent>
          {districts.map((district) => (
            <SelectItem key={district.code} value={district.code}>
              {district.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}