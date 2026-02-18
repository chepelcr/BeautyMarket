import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateClientData } from "@/models";

interface ClientFormProps {
  onSubmit: (data: CreateClientData) => void;
  initialData?: Partial<CreateClientData>;
  isLoading?: boolean;
}

export function ClientForm({ onSubmit, initialData, isLoading }: ClientFormProps) {
  const form = useForm<CreateClientData>({
    defaultValues: {
      clientName: initialData?.clientName || "",
      clientGln: initialData?.clientGln || "",
      identification: {
        type: initialData?.identification?.type || 1,
        code: initialData?.identification?.code || "01",
        number: initialData?.identification?.number || "",
      },
      businessName: initialData?.businessName || "",
      nationality: initialData?.nationality || "CR",
      phone: {
        countryCode: initialData?.phone?.countryCode || "506",
        areaCode: initialData?.phone?.areaCode || "506",
        number: initialData?.phone?.number || "",
        description: initialData?.phone?.description || "PERSONAL",
      },
      residence: {
        stateId: initialData?.residence?.stateId || 1,
        countyId: initialData?.residence?.countyId || 1,
        districtId: initialData?.residence?.districtId || 1,
        address: initialData?.residence?.address || "",
      },
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="clientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="clientGln"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GLN</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="identification.code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID Type</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="identification.number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phone.number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="residence.address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <textarea
                  className="w-full p-2 border rounded-md bg-background text-foreground"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Saving..." : "Save Client"}
        </Button>
      </form>
    </Form>
  );
}
