import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Form } from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { useOrdersApi } from "@/hooks/useOrdersApi";
import { useAuth } from "@/hooks/useAuth";
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
  

  
  const { data: identificationTypes } = useQuery({
    queryKey: ['identificationTypes', user?.id],
    queryFn: async () => {
      return await ordersApi.getIdentificationTypes();
    },
    enabled: !!user?.id,
  });
  
  const { data: countries } = useQuery({
    queryKey: ['countries', user?.id],
    queryFn: async () => {
      return await ordersApi.getCountries();
    },
    enabled: !!user?.id,
  });
  
  const { data: customerTypes } = useQuery({
    queryKey: ['customerTypes', user?.id],
    queryFn: async () => {
      return await ordersApi.getCustomerTypes();
    },
    enabled: !!user?.id,
  });
  
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
  const isFormValid = watchedCustomerType && watchedNationality && watchedIdNumber && watchedBusinessName && isValidEmail;
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
  
  const { data: states } = useQuery({
    queryKey: ['states', user?.id, watchedNationality],
    queryFn: async () => {
      return await ordersApi.getStates(watchedNationality);
    },
    enabled: !!user?.id && !!watchedNationality,
  });
  
  const { data: counties } = useQuery({
    queryKey: ['counties', user?.id, watchedNationality, watchedStateId],
    queryFn: async () => {
      return await ordersApi.getCounties(watchedNationality, watchedStateId);
    },
    enabled: !!user?.id && !!watchedNationality && !!watchedStateId,
  });
  
  // Reset dependent fields when parent changes
  const handleStateChange = (value: string) => {
    form.setValue("residence.stateId", parseInt(value));
    form.setValue("residence.countyId", 0);
    form.setValue("residence.districtId", 0);
  };
  
  const handleCountyChange = (value: string) => {
    form.setValue("residence.countyId", parseInt(value));
    form.setValue("residence.districtId", 0);
  };
  
  const { data: districts } = useQuery({
    queryKey: ['districts', user?.id, watchedNationality, watchedStateId, watchedCountyId],
    queryFn: async () => {
      return await ordersApi.getDistricts(watchedNationality, watchedStateId, watchedCountyId);
    },
    enabled: !!user?.id && !!watchedNationality && !!watchedStateId && !!watchedCountyId,
  });

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
