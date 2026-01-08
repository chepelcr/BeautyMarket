import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCartStore } from "@/store/cart";
import { generateWhatsAppMessage } from "@/lib/whatsapp";
import { useToast } from "@/hooks/use-toast";
import {
  getProvinces,
  getCantonsByProvinceCode,
  getDistrictsByCantonCode,
  getProvinceByCode,
  getCantonByCode,
  getDistrictByCode,
  type Canton,
  type District,
} from "@/data/locations";

export default function CheckoutModal() {
  const { showCheckout, setShowCheckout, items, total, clearCart } =
    useCartStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    provincia: "",
    canton: "",
    distrito: "",
    address: "",
    deliveryMethod: "",
  });

  // Get location data from client-side source
  const provinces = getProvinces();
  const [cantons, setCantons] = useState<Canton[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  // Update cantons when province changes
  useEffect(() => {
    if (formData.provincia) {
      const newCantons = getCantonsByProvinceCode(formData.provincia);
      setCantons(newCantons);
    } else {
      setCantons([]);
    }
    setFormData((prev) => ({ ...prev, canton: "", distrito: "" }));
    setDistricts([]);
  }, [formData.provincia]);

  // Update districts when canton changes
  useEffect(() => {
    if (formData.provincia && formData.canton) {
      const newDistricts = getDistrictsByCantonCode(
        formData.provincia,
        formData.canton,
      );
      setDistricts(newDistricts);
    } else {
      setDistricts([]);
    }
    setFormData((prev) => ({ ...prev, distrito: "" }));
  }, [formData.canton]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const requiredFields = [
      "customerName",
      "customerPhone",
      "provincia",
      "canton",
      "distrito",
      "address",
      "deliveryMethod",
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        toast({
          title: "Campos requeridos",
          description: "Por favor completa todos los campos",
          variant: "destructive",
        });
        return;
      }
    }

    if (items.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "No tienes productos en tu carrito",
        variant: "destructive",
      });
      return;
    }

    // Generate WhatsApp message with location names
    const province = getProvinceByCode(formData.provincia);
    const canton = getCantonByCode(formData.provincia, formData.canton);
    const district = getDistrictByCode(
      formData.provincia,
      formData.canton,
      formData.distrito,
    );

    const message = generateWhatsAppMessage({
      items,
      total,
      customer: {
        name: formData.customerName,
        phone: formData.customerPhone,
      },
      delivery: {
        provincia: province?.name || formData.provincia,
        canton: canton?.name || formData.canton,
        distrito: district?.name || formData.distrito,
        address: formData.address,
        method: formData.deliveryMethod,
      },
    });

    const phone = "72676745";

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");

    // Clear cart and close modal
    clearCart();
    setShowCheckout(false);

    // Reset form
    setFormData({
      customerName: "",
      customerPhone: "",
      provincia: "",
      canton: "",
      distrito: "",
      address: "",
      deliveryMethod: "",
    });

    toast({
      title: "Pedido enviado",
      description: "Tu pedido ha sido enviado por WhatsApp",
    });
  };

  return (
    <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Finalizar Compra
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h5 className="font-medium text-gray-900 mb-4">
              Información Personal
            </h5>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Nombre Completo</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) =>
                    handleInputChange("customerName", e.target.value)
                  }
                  placeholder="Tu nombre completo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Teléfono</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    handleInputChange("customerPhone", e.target.value)
                  }
                  placeholder="8888-8888"
                  required
                />
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div>
            <h5 className="font-medium text-gray-900 mb-4">
              Información de Entrega
            </h5>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="provincia">Provincia</Label>
                <Select
                  value={formData.provincia}
                  onValueChange={(value) =>
                    handleInputChange("provincia", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona provincia" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces?.map((provincia) => (
                      <SelectItem key={provincia.code} value={provincia.code}>
                        {provincia.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="canton">Cantón</Label>
                <Select
                  value={formData.canton}
                  onValueChange={(value) => handleInputChange("canton", value)}
                  disabled={!formData.provincia}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona cantón" />
                  </SelectTrigger>
                  <SelectContent>
                    {cantons?.map((canton) => (
                      <SelectItem key={canton.code} value={canton.code}>
                        {canton.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="distrito">Distrito</Label>
                <Select
                  value={formData.distrito}
                  onValueChange={(value) =>
                    handleInputChange("distrito", value)
                  }
                  disabled={!formData.canton}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona distrito" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts?.map((distrito) => (
                      <SelectItem key={distrito.code} value={distrito.code}>
                        {distrito.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="deliveryMethod">Método de Entrega</Label>
                <Select
                  value={formData.deliveryMethod}
                  onValueChange={(value) =>
                    handleInputChange("deliveryMethod", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="correos">Correos Costa Rica</SelectItem>
                    <SelectItem value="uber-flash">Uber Flash</SelectItem>
                    <SelectItem value="personal">Entrega Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="address">Dirección Completa</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Ingresa tu dirección completa..."
                rows={3}
                required
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center text-lg font-semibold mb-4">
              <span>Total del Pedido:</span>
              <span>₡{total.toLocaleString()}</span>
            </div>
            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-6 h-auto font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span>Enviar Pedido por WhatsApp</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
