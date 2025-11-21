import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useOrganization } from "@/hooks/useOrganization";
import { Skeleton } from "@/components/ui/skeleton";

interface OrganizationSettingsManagerProps {
  userId: string;
  organizationId: string;
}

interface OrganizationSettings {
  primaryColor?: string;
  secondaryColor?: string;
  currency?: string;
  timezone?: string;
  businessHours?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
}

export default function OrganizationSettingsManager({
  userId,
  organizationId,
}: OrganizationSettingsManagerProps) {
  const { toast } = useToast();
  const { useOrganizationById, updateOrganization, updateOrganizationSettings } = useOrganization();
  const { data: organization, isLoading } = useOrganizationById(userId, organizationId);

  // Basic info state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [customDomain, setCustomDomain] = useState("");

  // Settings state
  const [settings, setSettings] = useState<OrganizationSettings>({
    primaryColor: "#ec4899",
    secondaryColor: "#f472b6",
    currency: "CRC",
    timezone: "America/Costa_Rica",
    businessHours: "Lun-Vie: 9:00-18:00",
    contactEmail: "",
    contactPhone: "",
    address: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  // Load organization data
  useEffect(() => {
    if (organization) {
      setName(organization.name || "");
      setDescription(organization.description || "");
      setLogoUrl(organization.logoUrl || "");
      setSubdomain(organization.subdomain || "");
      setCustomDomain(organization.customDomain || "");

      if (organization.settings) {
        setSettings({
          primaryColor: organization.settings.primaryColor || "#ec4899",
          secondaryColor: organization.settings.secondaryColor || "#f472b6",
          currency: organization.settings.currency || "CRC",
          timezone: organization.settings.timezone || "America/Costa_Rica",
          businessHours: organization.settings.businessHours || "Lun-Vie: 9:00-18:00",
          contactEmail: organization.settings.contactEmail || "",
          contactPhone: organization.settings.contactPhone || "",
          address: organization.settings.address || "",
        });
      }
    }
  }, [organization]);

  const handleSaveBasicInfo = async () => {
    setIsSaving(true);
    try {
      await updateOrganization.mutateAsync({
        userId,
        id: organizationId,
        data: {
          name,
          description,
          logoUrl,
        },
      });
      toast({
        title: "Guardado",
        description: "La información básica ha sido actualizada.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la información.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateOrganizationSettings.mutateAsync({
        userId,
        id: organizationId,
        settings,
      });
      toast({
        title: "Guardado",
        description: "La configuración ha sido actualizada.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la configuración.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">
          Configuración de Organización
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Administra la información y configuración de tu mercado
        </p>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Información Básica</TabsTrigger>
          <TabsTrigger value="branding">Marca y Colores</TabsTrigger>
          <TabsTrigger value="contact">Contacto</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>
                Nombre, descripción y logo de tu organización
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Organización</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mi Tienda"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe tu negocio..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">URL del Logo</Label>
                <Input
                  id="logoUrl"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://ejemplo.com/logo.png"
                />
                {logoUrl && (
                  <div className="mt-2">
                    <img
                      src={logoUrl}
                      alt="Logo preview"
                      className="h-16 w-auto object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subdomain">Subdominio</Label>
                  <div className="flex items-center">
                    <Input
                      id="subdomain"
                      value={subdomain}
                      disabled
                      className="rounded-r-none"
                    />
                    <span className="bg-gray-100 dark:bg-gray-700 px-3 py-2 border border-l-0 rounded-r-md text-sm text-gray-500">
                      .jmarkets.jcampos.dev
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customDomain">Dominio Personalizado</Label>
                  <Input
                    id="customDomain"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="www.mitienda.com"
                    disabled
                  />
                  <p className="text-xs text-gray-500">
                    Contacta soporte para configurar un dominio personalizado
                  </p>
                </div>
              </div>

              <Button onClick={handleSaveBasicInfo} disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar Información"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Marca y Colores</CardTitle>
              <CardDescription>
                Personaliza los colores y la apariencia de tu tienda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Color Primario</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) =>
                        setSettings({ ...settings, primaryColor: e.target.value })
                      }
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) =>
                        setSettings({ ...settings, primaryColor: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Color Secundario</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) =>
                        setSettings({ ...settings, secondaryColor: e.target.value })
                      }
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.secondaryColor}
                      onChange={(e) =>
                        setSettings({ ...settings, secondaryColor: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Vista Previa de Colores</Label>
                <div className="flex gap-4">
                  <div
                    className="w-24 h-24 rounded-lg shadow-md"
                    style={{ backgroundColor: settings.primaryColor }}
                  />
                  <div
                    className="w-24 h-24 rounded-lg shadow-md"
                    style={{ backgroundColor: settings.secondaryColor }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <select
                    id="currency"
                    value={settings.currency}
                    onChange={(e) =>
                      setSettings({ ...settings, currency: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="CRC">CRC - Colón Costarricense</option>
                    <option value="USD">USD - Dólar Estadounidense</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Zona Horaria</Label>
                  <select
                    id="timezone"
                    value={settings.timezone}
                    onChange={(e) =>
                      setSettings({ ...settings, timezone: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="America/Costa_Rica">Costa Rica (GMT-6)</option>
                    <option value="America/New_York">New York (GMT-5/4)</option>
                    <option value="America/Los_Angeles">Los Angeles (GMT-8/7)</option>
                    <option value="Europe/Madrid">Madrid (GMT+1/2)</option>
                  </select>
                </div>
              </div>

              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar Configuración"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
              <CardDescription>
                Datos de contacto y horarios de atención
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email de Contacto</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, contactEmail: e.target.value })
                  }
                  placeholder="contacto@mitienda.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Teléfono</Label>
                <Input
                  id="contactPhone"
                  value={settings.contactPhone}
                  onChange={(e) =>
                    setSettings({ ...settings, contactPhone: e.target.value })
                  }
                  placeholder="+506 8888-8888"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Textarea
                  id="address"
                  value={settings.address}
                  onChange={(e) =>
                    setSettings({ ...settings, address: e.target.value })
                  }
                  placeholder="San José, Costa Rica"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessHours">Horario de Atención</Label>
                <Input
                  id="businessHours"
                  value={settings.businessHours}
                  onChange={(e) =>
                    setSettings({ ...settings, businessHours: e.target.value })
                  }
                  placeholder="Lun-Vie: 9:00-18:00, Sáb: 9:00-13:00"
                />
              </div>

              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar Contacto"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
