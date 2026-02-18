import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { Save, Users, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  editingCustomer: any;
  isLoading: boolean;
}

export function CustomerModal({ isOpen, onClose, onSubmit, editingCustomer, isLoading }: CustomerModalProps) {
  const { t } = useLanguage();
  const [location] = useLocation();
  const [isFormValid, setIsFormValid] = React.useState(!!editingCustomer);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>{editingCustomer ? t('customers.edit') + ' ' + t('customers.customer') : t('customers.newCustomer')}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 min-h-0">
          {!editingCustomer && isOpen && location.includes('/edit/') ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <CustomerForm
              onSubmit={onSubmit}
              initialData={editingCustomer || undefined}
              isEditing={!!editingCustomer}
              onValidityChange={setIsFormValid}
            />
          )}
        </div>
        <DialogFooter className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isLoading || !isFormValid} onClick={() => {
            const form = document.querySelector('form');
            if (form) {
              const event = new Event('submit', { bubbles: true, cancelable: true });
              form.dispatchEvent(event);
            }
          }}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {editingCustomer ? t('common.update') : t('common.save')} {t('customers.customer')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}