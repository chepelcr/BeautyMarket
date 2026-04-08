import { useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { Form } from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { useOrdersApi } from "@/hooks/useOrdersApi";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useAllDocumentTypes, useAllCustomerTypes, useAllCountries, useStates, useCounties, useDistricts } from "@/hooks/useDataApi";
import { CustomerFormData } from "@/models";
import { PersonalDataSection } from "./sections/PersonalDataSection";
import { LocationSection } from "./sections/LocationSection";
import { ContactSection } from "./sections/ContactSection";
import { useState } from "react";

const applyIdMask = (value: string, code: string) => {
  const numbers = value.replace(/\D/g, '');
  if (code === '01') {
    if (numbers.length <= 1) return numbers;
    if (numbers.length <= 5) return numbers.replace(/(\d{1})(\d+)/, '$1-$2');
    return numbers.replace(/(\d{1})(\d{4})(\d+)/, '$1-$2-$3');
  }
  if (code === '02') {
    if (numbers.length <= 1) return numbers;
    if (numbers.length <= 4) return numbers.replace(/(\d{1})(\d+)/, '$1-$2');
    return numbers.replace(/(\d{1})(\d{3})(\d+)/, '$1-$2-$3');
  }
  return numbers;
};



interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => void;
  initialData?: Partial<CustomerFormData>;
  form?: any;
  isEditing?: boolean;
  onValidityChange?: (isValid: boolean) => void;
}

export function CustomerForm({ onSubmit, initialData, form: externalForm, isEditing = false, onValidityChange }: CustomerFormProps) {
  const [hasBusinessNameFromApi, setHasBusinessNameFromApi] = useState(!!initialData?.businessName);
  const { user } = useAuth();
  const { api: ordersApi } = useOrdersApi();
  const { useDefaultOrganization } = useOrganization();
  const { data: defaultOrg } = useDefaultOrganization(user?.id);
  
  // Get ISO code from organization's organization_country field, default to "CR" (Costa Rica)
  // When organization changes, isoCode will update and React Query will automatically
  // refetch all reference data with the new ISO code (query keys include isoCode)
  const isoCode = useMemo(() => {
    // @ts-ignore - organization_country field will be added to Organization model
    return defaultOrg?.organization_country || "CR";
  }, [defaultOrg]);

  // Fetch document types (identification types) from data API
  const { data: identificationTypes, isLoading: identificationTypesLoading, isError: identificationTypesError, refetch: refetchIdentificationTypes } = 
    useAllDocumentTypes({ iso_code: isoCode }, { enabled: !!user?.id });
  
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
        code: "01",
        number: ""
      },
      nationality: "CR",
      email: "",
      businessName: "",
      clientName: "",
      clientGln: "",
      residence: {
        stateId: 0,
        countyId: 0,
        districtId: 0,
        address: ""
      },
      phone: {
        countryCode: "506",
        areaCode: "506",
        number: "",
        description: "PERSONAL"
      },
      customerType: 1,
      ...initialData,
    },
  });
  
  const watchedBusinessName = form.watch("businessName");
  const watchedNationality = form.watch("nationality");
  const watchedCustomerType = form.watch("customerType");
  const watchedIdNumber = form.watch("identification.number");
  const watchedEmail = form.watch("email");
  const watchedStateId = form.watch("residence.stateId");
  const watchedCountyId = form.watch("residence.countyId");
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = watchedEmail && emailRegex.test(watchedEmail);
  
  // Check if critical reference data is loading
  const isCriticalDataLoading = identificationTypesLoading || customerTypesLoading || countriesLoading;
  
  // Check if critical reference data failed to load
  const hasCriticalDataError = identificationTypesError || customerTypesError || countriesError;
  
  const isFormValid = watchedCustomerType && watchedNationality && watchedIdNumber && watchedBusinessName && isValidEmail && !isCriticalDataLoading && !hasCriticalDataError;
  const shouldShowLocationAndContact = watchedBusinessName || watchedNationality !== "188";
  
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
      const selectedCountry = countries.find((c: any) => c.isoCode === watchedNationality);
      if (selectedCountry) {
        form.setValue("phone.countryCode", selectedCountry.isoCode);
      }
    }
  }, [watchedNationality, countries, form]);
  
  // Cascading location selector state management - clear child fields when parent changes
  useEffect(() => {
    // When nationality changes, clear all location fields
    form.setValue("residence.stateId", 0);
    form.setValue("residence.countyId", 0);
    form.setValue("residence.districtId", 0);
  }, [watchedNationality, form]);
  
  useEffect(() => {
    // When state changes, clear county and district
    if (watchedStateId) {
      form.setValue("residence.countyId", 0);
      form.setValue("residence.districtId", 0);
    }
  }, [watchedStateId, form]);
  
  useEffect(() => {
    // When county changes, clear district
    if (watchedCountyId) {
      form.setValue("residence.districtId", 0);
    }
  }, [watchedCountyId, form]);
  
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
  
  // Reset dependent fields when parent changes (for LocationSection handlers)
  const handleStateChange = (value: string) => {
    form.setValue("residence.stateId", parseInt(value));
  };
  
  const handleCountyChange = (value: string) => {
    form.setValue("residence.countyId", parseInt(value));
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
        nationality: initialData.nationality || "188",
        email: initialData.email || "",
        businessName: initialData.businessName || "",
        clientName: initialData.clientName || "",
        clientGln: initialData.clientGln || "",
        residence: {
          stateId: 0,
          countyId: 0,
          districtId: 0,
          address: initialData.residence?.address || ""
        },
        phone: {
          countryCode: initialData.phone?.countryCode || "188",
          number: initialData.phone?.number || ""
        },
        customerType: initialData.customerType || 1
      });
    }
  }, [initialData, form]);

  // Set state when states are loaded
  useEffect(() => {
    if (initialData?.residence?.stateId && states && states.find((s: any) => s.stateId === initialData.residence?.stateId)) {
      form.setValue("residence.stateId", initialData.residence.stateId);
    }
  }, [initialData, states, form]);

  // Set county when counties are loaded
  useEffect(() => {
    if (initialData?.residence?.countyId && counties && counties.find((c: any) => c.countyId === initialData.residence?.countyId)) {
      form.setValue("residence.countyId", initialData.residence.countyId);
    }
  }, [initialData, counties, form]);

  // Set district when districts are loaded
  useEffect(() => {
    if (initialData?.residence?.districtId && districts && districts.find((d: any) => d.districtId === initialData.residence?.districtId)) {
      form.setValue("residence.districtId", initialData.residence.districtId);
    }
  }, [initialData, districts, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <PersonalDataSection
          form={form}
          customerTypes={customerTypes ?? []}
          countries={countries ?? []}
          identificationTypes={identificationTypes ?? []}
          isEditing={isEditing}
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
          states={states}
          counties={counties}
          districts={districts}
          watchedStateId={watchedStateId}
          watchedCountyId={watchedCountyId}
          handleStateChange={handleStateChange}
          handleCountyChange={handleCountyChange}
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
