import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  formatLocationString,
  type Province,
  type Canton,
  type District 
} from "@/data/locations";

export default function CheckoutModal() {
  const { showCheckout, setShowCheckout, items, total, clearCart } = useCartStore();
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
    setFormData(prev => ({ ...prev, canton: "", distrito: "" }));
    setDistricts([]);
  }, [formData.provincia]);

  // Update districts when canton changes
  useEffect(() => {
    if (formData.provincia && formData.canton) {
      const newDistricts = getDistrictsByCantonCode(formData.provincia, formData.canton);
      setDistricts(newDistricts);
    } else {
      setDistricts([]);
    }
    setFormData(prev => ({ ...prev, distrito: "" }));
  }, [formData.canton]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      "deliveryMethod"
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
    const district = getDistrictByCode(formData.provincia, formData.canton, formData.distrito);

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

    const whatsappUrl = `https://wa.me/50673676745?text=${encodeURIComponent(message)}`;
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

  const getDeliveryMethodLabel = (method: string) => {
    const labels = {
      correos: "Correos Costa Rica",
      "uber-flash": "Uber Flash",
      personal: "Entrega Personal"
    };
    return labels[method as keyof typeof labels] || method;
  };

  return (
    <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Finalizar Compra</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h5 className="font-medium text-gray-900 mb-4">Información Personal</h5>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Nombre Completo</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange("customerName", e.target.value)}
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
                  onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                  placeholder="8888-8888"
                  required
                />
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div>
            <h5 className="font-medium text-gray-900 mb-4">Información de Entrega</h5>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="provincia">Provincia</Label>
                <Select value={formData.provincia} onValueChange={(value) => handleInputChange("provincia", value)}>
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
                  onValueChange={(value) => handleInputChange("distrito", value)}
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
                <Select value={formData.deliveryMethod} onValueChange={(value) => handleInputChange("deliveryMethod", value)}>
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
              <i className="fab fa-whatsapp"></i>
              <span>Enviar Pedido por WhatsApp</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
