import { User, Mail, Phone, MapPin, Calendar, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Customer, Client } from '@/models';

interface CustomerProfileProps {
  customer: Customer | Client;
  onEdit: () => void;
}

export function CustomerProfile({ customer, onEdit }: CustomerProfileProps) {
  const { t } = useLanguage();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Handle both Customer and Client types
  const isClient = 'clientName' in customer;
  
  const fullName = isClient 
    ? (customer as Client).businessName || (customer as Client).clientName || t('customers.noName')
    : [customer.firstName, customer.lastName].filter(Boolean).join(' ') || t('customers.noName');

  const email = isClient ? (customer as Client).email : customer.email;
  
  // Handle phone - can be string (Customer) or object (Client)
  const phoneDisplay = isClient && (customer as Client).phone && typeof (customer as Client).phone === 'object'
    ? (customer as Client).phone?.number
    : typeof customer.phone === 'string' 
    ? customer.phone 
    : null;

  const fullAddress = customer.address
    ? [
        customer.address.street,
        customer.address.city,
        customer.address.state,
        customer.address.zipCode,
        customer.address.country,
      ]
        .filter(Boolean)
        .join(', ')
    : isClient && (customer as Client).residence
    ? (customer as Client).residence?.address
    : null;

  const createdAt = 'createdAt' in customer ? customer.createdAt : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t('customers.details.profile')}
          </CardTitle>
          <Button onClick={onEdit} variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            {t('common.edit')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-1">
            {t('customers.details.fullName')}
          </div>
          <div className="font-medium text-lg">{fullName}</div>
        </div>

        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <a
            href={`mailto:${email}`}
            className="text-sm hover:underline"
          >
            {email}
          </a>
        </div>

        {phoneDisplay && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a
              href={`tel:${phoneDisplay}`}
              className="text-sm hover:underline"
            >
              {phoneDisplay}
            </a>
          </div>
        )}

        {fullAddress && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-sm">{fullAddress}</div>
          </div>
        )}

        {createdAt && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                {t('customers.details.memberSince')} {formatDate(createdAt)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
