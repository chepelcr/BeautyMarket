import { useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { Form } from "@/components/ui/form";

import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useAllIdentifications, useAllCustomerTypes, useAllCountries, useStates, useCounties, useDistricts, useNeighborhoods } from "@/hooks/useDataApi";
import { CustomerFormData } from "@/models";
import { PersonalDataSection } from "./sections/PersonalDataSection";
import { LocationSection } from "./sections/LocationSection";
import { ContactSection } from "./sections/ContactSection";
import { useState } from "react";
import { CUSTOMER_TYPES, IDENTIFICATION_CODES, COUNTRY_CODES } from "@/constants/customerTypes";

const applyIdMask = (value: string, code: string) => {
  const numbers = value.replace(/\D/g, '');
  
  // 01 - Cédula Física: 9 digits, format X-XXXX-XXXX
  if (code === IDENTIFICATION_CODES.CEDULA_FISICA) {
    if (numbers.length <= 1) return numbers;
    if (numbers.length <= 5) return numbers.replace(/(\d{1})(\d+)/, '$1-$2');
    return numbers.replace(/(\d{1})(\d{4})(\d+)/, '$1-$2-$3');
  }
  
  // 02 - Cédula Jurídica: 10 digits, format X-XXX-XXXXXX
  if (code === IDENTIFICATION_CODES.CEDULA_JURIDICA) {
    if (numbers.length <= 1) return numbers;
    if (numbers.length <= 4) return numbers.replace(/(\d{1})(\d+)/, '$1-$2');
    return numbers.replace(/(\d{1})(\d{3})(\d+)/, '$1-$2-$3');
  }
  
  // 03 - DIMEX: 11-12 digits, no formatting
  // 04 - NITE: 10 digits, no formatting
  // 05 - Pasaporte: Variable length, no formatting
  return numbers;
};



interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => void;
  initialData?: Partial<CustomerFormData>;
  form?: any;
  isEditing?: boolean;
  customerStatus?: number;
  onValidityChange?: (isValid: boolean) => void;
}

export function CustomerForm({ onSubmit, initialData, form: externalForm, isEditing = false, customerStatus, onValidityChange }: CustomerFormProps) {
  const [hasBusinessNameFromApi, setHasBusinessNameFromApi] = useState(!!initialData?.business_name);
  const { user } = useAuth();
  const { useDefaultOrganization } = useOrganization();
  const { data: defaultOrg } = useDefaultOrganization(user?.id);
  
  // Get ISO code from organization's organization_country field, default to "188" (Costa Rica)
  // When organization changes, isoCode will update and React Query will automatically
  // refetch all reference data with the new ISO code (query keys include isoCode)
  const isoCode = useMemo(() => {
    // @ts-ignore - organization_country field will be added to Organization model
    return defaultOrg?.organization_country || "188";
  }, [defaultOrg]);

  // Fetch identification types (ID types for customers) from data API
  const { data: identificationTypes, isLoading: identificationTypesLoading, isError: identificationTypesError, refetch: refetchIdentificationTypes } = 
    useAllIdentifications({ iso_code: isoCode }, { enabled: !!user?.id });
  
  // Fetch customer types from data API
  const { data: customerTypes, isLoading: customerTypesLoading, isError: customerTypesError, refetch: refetchCustomerTypes } = 
    useAllCustomerTypes(undefined, { enabled: !!user?.id });
  
  // Fetch countries from data API
  const { data: countries, isLoading: countriesLoading, isError: countriesError, refetch: refetchCountries } = 
    useAllCountries(undefined, { enabled: !!user?.id });
  
  const form = externalForm || useForm<CustomerFormData>({
    defaultValues: {
      identification: {
        type: 1,
        code: IDENTIFICATION_CODES.CEDULA_FISICA,
        number: ""
      },
      nationality: COUNTRY_CODES.COSTA_RICA,
      email: "",
      business_name: "",
      client_name: "",
      client_gln: "",
      residence: {
        state_id: 0,
        county_id: 0,
        district_id: 0,
        neighborhood_id: 0,
        address: ""
      },
      phone: {
        country_code: COUNTRY_CODES.COSTA_RICA,
        area_code: COUNTRY_CODES.COSTA_RICA,
        number: "",
        description: "PERSONAL"
      },
      customer_type: CUSTOMER_TYPES.PERSONA,
      ...initialData,
    },
  });
  
  const watchedBusinessName = form.watch("business_name");
  const watchedNationality = form.watch("nationality");
  const watchedCustomerType = form.watch("customer_type");
  const watchedIdNumber = form.watch("identification.number");
  const watchedEmail = form.watch("email");
  const watchedStateId = form.watch("residence.state_id");
  const watchedCountyId = form.watch("residence.county_id");
  const watchedDistrictId = form.watch("residence.district_id");
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = watchedEmail && emailRegex.test(watchedEmail);
  
  // Check if critical reference data is loading
  const isCriticalDataLoading = identificationTypesLoading || customerTypesLoading || countriesLoading;
  
  // Check if critical reference data failed to load
  const hasCriticalDataError = identificationTypesError || customerTypesError || countriesError;
  
  const isFormValid = watchedCustomerType && watchedNationality && watchedIdNumber && watchedBusinessName && isValidEmail && !isCriticalDataLoading && !hasCriticalDataError;
  const shouldShowLocationAndContact = watchedBusinessName || watchedNationality !== COUNTRY_CODES.COSTA_RICA;
  
  const fieldErrors = {
    customerType: !watchedCustomerType,
    nationality: !watchedNationality,
    idNumber: !watchedIdNumber,
    businessName: !watchedBusinessName,
    email: !isValidEmail
  };
  
  // Notify parent of form validity changes
  useEffect(() => {
    onValidityChange?.(isFormValid);
  }, [isFormValid, onValidityChange]);
  
  // Auto-populate phone country code when nationality changes
  useEffect(() => {
    if (watchedNationality && countries) {
      const selectedCountry = countries.find((c: any) => c.iso_code === watchedNationality);
      if (selectedCountry) {
        form.setValue("phone.country_code", selectedCountry.iso_code);
      }
    }
  }, [watchedNationality, countries, form]);
  
  // Cascading location selector state management - clear child fields when parent changes
  useEffect(() => {
    // When nationality changes, clear all location fields
    form.setValue("residence.state_id", 0);
    form.setValue("residence.county_id", 0);
    form.setValue("residence.district_id", 0);
    form.setValue("residence.neighborhood_id", 0);
  }, [watchedNationality, form]);

  useEffect(() => {
    // When state changes, clear county and district
    if (watchedStateId) {
      form.setValue("residence.county_id", 0);
      form.setValue("residence.district_id", 0);
      form.setValue("residence.neighborhood_id", 0);
    }
  }, [watchedStateId, form]);

  useEffect(() => {
    // When county changes, clear district
    if (watchedCountyId) {
      form.setValue("residence.district_id", 0);
      form.setValue("residence.neighborhood_id", 0);
    }
  }, [watchedCountyId, form]);

  useEffect(() => {
    // When district changes, clear neighborhood
    if (watchedDistrictId) {
      form.setValue("residence.neighborhood_id", 0);
    }
  }, [watchedDistrictId, form]);
  
  // Fetch states from data API with conditional fetching
  const { data: states, isLoading: statesLoading, isError: statesError, refetch: refetchStates } = 
    useStates({ iso_code: isoCode }, { enabled: !!user?.id && !!watchedNationality });
  
  // Fetch counties from data API with conditional fetching
  const { data: counties, isLoading: countiesLoading, isError: countiesError, refetch: refetchCounties } = 
    useCounties(
      { iso_code: isoCode, state_id: watchedStateId }, 
      { enabled: !!user?.id && !!watchedNationality && !!watchedStateId && watchedStateId !== 0 }
    );
  
  // Fetch districts from data API with conditional fetching
  const { data: districts, isLoading: districtsLoading, isError: districtsError, refetch: refetchDistricts } = 
    useDistricts(
      { iso_code: isoCode, state_id: watchedStateId, county_id: watchedCountyId },
      { enabled: !!user?.id && !!watchedNationality && !!watchedStateId && watchedStateId !== 0 && !!watchedCountyId && watchedCountyId !== 0 }
    );
  
  // Fetch neighborhoods from data API with conditional fetching
  const { data: neighborhoods, isLoading: neighborhoodsLoading, isError: neighborhoodsError, refetch: refetchNeighborhoods } = 
    useNeighborhoods(
      { iso_code: isoCode, state_id: watchedStateId, county_id: watchedCountyId, district_id: watchedDistrictId },
      { enabled: !!user?.id && !!watchedNationality && !!watchedStateId && watchedStateId !== 0 && !!watchedCountyId && watchedCountyId !== 0 && !!watchedDistrictId && watchedDistrictId !== 0 }
    );
  
  // Reset dependent fields when parent changes (for LocationSection handlers)
  const handleStateChange = (value: string) => {
    form.setValue("residence.state_id", parseInt(value));
  };

  const handleCountyChange = (value: string) => {
    form.setValue("residence.county_id", parseInt(value));
  };

  const handleDistrictChange = (value: string) => {
    form.setValue("residence.district_id", parseInt(value));
  };
  
  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      // Set non-residence fields immediately
      form.reset({
        identification: {
          type: initialData.identification?.type || 1,
          code: initialData.identification?.code || "01",
          number: applyIdMask(initialData.identification?.number || "", initialData.identification?.code || "01")
        },
        nationality: initialData.nationality || COUNTRY_CODES.COSTA_RICA,
        email: initialData.email || "",
        business_name: initialData.business_name || "",
        client_name: initialData.client_name || "",
        client_gln: initialData.client_gln || "",
        residence: {
          state_id: 0,
          county_id: 0,
          district_id: 0,
          neighborhood_id: 0,
          address: initialData.residence?.address || ""
        },
        phone: {
          country_code: initialData.phone?.country_code || COUNTRY_CODES.COSTA_RICA,
          number: initialData.phone?.number || ""
        },
        customer_type: initialData.customer_type || CUSTOMER_TYPES.PERSONA
      });
    }
  }, [initialData, form]);

  // Set state when states are loaded
  useEffect(() => {
    if (initialData?.residence?.state_id && states && states.find((s: any) => s.state_id === initialData.residence?.state_id)) {
      form.setValue("residence.state_id", initialData.residence.state_id);
    }
  }, [initialData, states, form]);

  // Set county when counties are loaded
  useEffect(() => {
    if (initialData?.residence?.county_id && counties && counties.find((c: any) => c.county_id === initialData.residence?.county_id)) {
      form.setValue("residence.county_id", initialData.residence.county_id);
    }
  }, [initialData, counties, form]);

  // Set district when districts are loaded
  useEffect(() => {
    if (initialData?.residence?.district_id && districts && districts.find((d: any) => d.district_id === initialData.residence?.district_id)) {
      form.setValue("residence.district_id", initialData.residence.district_id);
    }
  }, [initialData, districts, form]);

  // Set neighborhood when neighborhoods are loaded
  useEffect(() => {
    if (initialData?.residence?.neighborhood_id && neighborhoods && neighborhoods.find((n: any) => n.neighborhood_id === initialData.residence?.neighborhood_id)) {
      form.setValue("residence.neighborhood_id", initialData.residence.neighborhood_id);
    }
  }, [initialData, neighborhoods, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <PersonalDataSection
          form={form}
          customerTypes={customerTypes ?? []}
          countries={countries ?? []}
          identificationTypes={identificationTypes ?? []}
          isEditing={isEditing}
          customerStatus={customerStatus}
          fieldErrors={fieldErrors}
          onBusinessNameFromApi={setHasBusinessNameFromApi}
          identificationTypesLoading={identificationTypesLoading}
          identificationTypesError={identificationTypesError}
          refetchIdentificationTypes={refetchIdentificationTypes}
          customerTypesLoading={customerTypesLoading}
          customerTypesError={customerTypesError}
          refetchCustomerTypes={refetchCustomerTypes}
          countriesLoading={countriesLoading}
          countriesError={countriesError}
          refetchCountries={refetchCountries}
        />

        <LocationSection
          form={form}
          states={states ?? []}
          counties={counties ?? []}
          districts={districts ?? []}
          neighborhoods={neighborhoods ?? []}
          watchedStateId={watchedStateId}
          watchedCountyId={watchedCountyId}
          watchedDistrictId={watchedDistrictId}
          handleStateChange={handleStateChange}
          handleCountyChange={handleCountyChange}
          handleDistrictChange={handleDistrictChange}
          disabled={!shouldShowLocationAndContact || (watchedNationality === "188" && !hasBusinessNameFromApi && !isEditing)}
          statesLoading={statesLoading}
          statesError={statesError}
          refetchStates={refetchStates}
          countiesLoading={countiesLoading}
          countiesError={countiesError}
          refetchCounties={refetchCounties}
          districtsLoading={districtsLoading}
          districtsError={districtsError}
          refetchDistricts={refetchDistricts}
          neighborhoodsLoading={neighborhoodsLoading}
          neighborhoodsError={neighborhoodsError}
          refetchNeighborhoods={refetchNeighborhoods}
        />

        <ContactSection
          form={form}
          countries={countries ?? []}
          fieldErrors={fieldErrors}
          disabled={!shouldShowLocationAndContact || (watchedNationality === "188" && !hasBusinessNameFromApi && !isEditing)}
        />
      </form>
    </Form>
  );
}
