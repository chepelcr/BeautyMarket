import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Client } from '@/models';
import { Building2, Phone, MapPin, Hash } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ClientCardProps {
  client: Client;
}

export function ClientCard({ client }: ClientCardProps) {
  const { t } = useLanguage();
  const [, navigate] = useLocation();

  return (
    <Card
      className="hover:shadow-md transition-all cursor-pointer hover:border-primary/50"
      onClick={() => navigate(`/admin/customers/${client.clientId}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{client.clientName}</CardTitle>
            {client.businessName && (
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Building2 className="h-3 w-3" />
                <span className="truncate">{client.businessName}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {client.clientGln && (
          <div className="flex items-center gap-2 text-sm">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono">{client.clientGln}</span>
          </div>
        )}

        {client.identification && (
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline" className="font-mono">
              {client.identification.code}-{client.identification.number}
            </Badge>
          </div>
        )}

        {client.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>+{client.phone.countryCode} {client.phone.number}</span>
          </div>
        )}

        {client.residence && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{client.residence.address}</span>
          </div>
        )}

        {client.nationality && (
          <div className="pt-2 border-t">
            <Badge variant="secondary">
              {client.nationality}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
