import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VintageButton } from '../VintageButton';
import { useCartStore } from "@/store/cart";
import { generateWhatsAppMessage } from "@/lib/whatsapp";
import CheckoutAddress, {
  type AddressNames,
  type StructuredAddress,
} from "@/components/cart/checkout-address";

const EMPTY_ADDRESS: StructuredAddress = {
  state_id: null,
  county_id: null,
  district_id: null,
  neighborhood_id: null,
  address: "",
};

const EMPTY_NAMES: AddressNames = {
  state_name: "",
  county_name: "",
  district_name: "",
  neighborhood_name: "",
};

export default function CheckoutModal() {
  const { showCheckout, setShowCheckout, items, total, clearCart } =
    useCartStore();

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    deliveryMethod: "",
  });
  const [address, setAddress] = useState<StructuredAddress>(EMPTY_ADDRESS);
  const [addressNames, setAddressNames] = useState<AddressNames>(EMPTY_NAMES);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const requiredFields = ["customerName", "customerPhone", "deliveryMethod"];

    const missingBasic = requiredFields.some(
      (field) => !formData[field as keyof typeof formData],
    );
    const missingAddress =
      address.state_id == null ||
      address.county_id == null ||
      address.district_id == null ||
      !address.address;

    if (missingBasic || missingAddress) {
      {
        alert("Por favor completa todos los campos");
        return;
      }
    }

    if (items.length === 0) {
      alert("No tienes productos en tu carrito");
      return;
    }

    // Generate WhatsApp message with location names
    const message = generateWhatsAppMessage({
      items,
      total,
      customer: {
        name: formData.customerName,
        phone: formData.customerPhone,
      },
      delivery: {
        provincia: addressNames.state_name,
        canton: addressNames.county_name,
        distrito: addressNames.district_name,
        barrio: addressNames.neighborhood_name,
        address: address.address,
        method: formData.deliveryMethod,
      },
    });

    const phone = "1234567890"; // Placeholder WhatsApp number

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");

    // Clear cart and close modal
    clearCart();
    setShowCheckout(false);

    // Reset form
    setFormData({
      customerName: "",
      customerPhone: "",
      deliveryMethod: "",
    });
    setAddress(EMPTY_ADDRESS);
    setAddressNames(EMPTY_NAMES);

    alert("Tu pedido ha sido enviado por WhatsApp");
  };

  return (
    <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-burgundy-900">
            Finalizar Compra
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h5 className="font-serif font-medium text-burgundy-900 mb-4">
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
            <h5 className="font-serif font-medium text-burgundy-900 mb-4">
              Información de Entrega
            </h5>
            <CheckoutAddress
              value={address}
              onChange={setAddress}
              onNamesChange={setAddressNames}
            />
            <div className="mt-4">
              <Label htmlFor="deliveryMethod">Método de Entrega</Label>
              <Select
                value={formData.deliveryMethod}
                onValueChange={(value) => handleInputChange("deliveryMethod", value)}
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

          {/* Order Summary */}
          <div className="border-t-2 border-burgundy-900/20 pt-6">
            <div className="flex justify-between items-center text-lg font-serif font-semibold mb-4">
              <span className="text-burgundy-900">Total del Pedido:</span>
              <span className="text-burgundy-900">${total.toLocaleString()}</span>
            </div>
            <VintageButton
              type="submit"
              variant="primary"
              className="w-full bg-amber-700 hover:bg-amber-800 text-cream-50 flex items-center justify-center space-x-2"
            >
              <i className="fab fa-whatsapp"></i>
              <span>Enviar Pedido por WhatsApp</span>
            </VintageButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
