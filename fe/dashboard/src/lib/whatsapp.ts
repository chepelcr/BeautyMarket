interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Customer {
  name: string;
  phone: string;
}

interface Delivery {
  provincia: string;
  canton: string;
  distrito: string;
  address: string;
  method: string;
}

interface OrderData {
  items: CartItem[];
  total: number;
  customer: Customer;
  delivery: Delivery;
}

export function generateWhatsAppMessage(data: OrderData): string {
  const { items, total, customer, delivery } = data;

  let message = `¡Hola! Me gustaría hacer un pedido:\n\n`;
  
  message += `*DATOS DEL CLIENTE:*\n`;
  message += `Nombre: ${customer.name}\n`;
  message += `Teléfono: ${customer.phone}\n\n`;
  
  message += `*PRODUCTOS:*\n`;
  items.forEach(item => {
    message += `• ${item.name} x${item.quantity} - ₡${(item.price * item.quantity).toLocaleString()}\n`;
  });
  
  message += `\n*TOTAL: ₡${total.toLocaleString()}*\n\n`;
  
  message += `*ENTREGA:*\n`;
  message += `Método: ${getDeliveryMethodLabel(delivery.method)}\n`;
  message += `Provincia: ${delivery.provincia}\n`;
  message += `Cantón: ${delivery.canton}\n`;
  message += `Distrito: ${delivery.distrito}\n`;
  message += `Dirección: ${delivery.address}\n`;
  
  return message;
}

function getDeliveryMethodLabel(method: string): string {
  const labels = {
    correos: "Correos Costa Rica",
    "uber-flash": "Uber Flash",
    personal: "Entrega Personal"
  };
  return labels[method as keyof typeof labels] || method;
}
