import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Customer, CreateCustomerData } from "@/models";
import { useLanguage } from "@/contexts/LanguageContext";

const customerSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCustomerData) => Promise<void>;
  customer?: Customer;
  isSubmitting: boolean;
}

export function CustomerForm({ isOpen, onClose, onSubmit, customer, isSubmitting }: CustomerFormProps) {
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer ? {
      email: customer.email,
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      phone: customer.phone || "",
      street: customer.address?.street || "",
      city: customer.address?.city || "",
      state: customer.address?.state || "",
      zipCode: customer.address?.zipCode || "",
      country: customer.address?.country || "",
      notes: customer.notes || "",
    } : {},
  });

  const handleFormSubmit = async (data: CustomerFormData) => {
    const customerData: CreateCustomerData = {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      address: {
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
      },
      notes: data.notes,
    };

    await onSubmit(customerData);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {customer ? t('customers.editCustomer') : t('customers.addCustomer')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="email">{t('customers.email')} *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="customer@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="firstName">{t('customers.firstName')}</Label>
              <Input id="firstName" {...register("firstName")} />
            </div>

            <div>
              <Label htmlFor="lastName">{t('customers.lastName')}</Label>
              <Input id="lastName" {...register("lastName")} />
            </div>

            <div className="col-span-2">
              <Label htmlFor="phone">{t('customers.phone')}</Label>
              <Input id="phone" {...register("phone")} placeholder="+506 1234-5678" />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">{t('customers.address')}</h3>
            <div>
              <Label htmlFor="street">{t('customers.street')}</Label>
              <Input id="street" {...register("street")} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">{t('customers.city')}</Label>
                <Input id="city" {...register("city")} />
              </div>

              <div>
                <Label htmlFor="state">{t('customers.state')}</Label>
                <Input id="state" {...register("state")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zipCode">{t('customers.zipCode')}</Label>
                <Input id="zipCode" {...register("zipCode")} />
              </div>

              <div>
                <Label htmlFor="country">{t('customers.country')}</Label>
                <Input id="country" {...register("country")} placeholder="Costa Rica" />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">{t('customers.notes')}</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder={t('customers.notesPlaceholder')}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('common.saving') : customer ? t('common.save') : t('common.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
