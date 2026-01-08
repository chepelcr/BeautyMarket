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

  let message = `Hello! I would like to place an order:\n\n`;

  message += `*CUSTOMER INFORMATION:*\n`;
  message += `Name: ${customer.name}\n`;
  message += `Phone: ${customer.phone}\n\n`;

  message += `*PRODUCTS:*\n`;
  items.forEach(item => {
    message += `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
  });

  message += `\n*TOTAL: $${total.toFixed(2)}*\n\n`;

  message += `*DELIVERY:*\n`;
  message += `Method: ${getDeliveryMethodLabel(delivery.method)}\n`;
  message += `Province: ${delivery.provincia}\n`;
  message += `Canton: ${delivery.canton}\n`;
  message += `District: ${delivery.distrito}\n`;
  message += `Address: ${delivery.address}\n`;

  return message;
}

function getDeliveryMethodLabel(method: string): string {
  const labels = {
    correos: "Correos Costa Rica",
    "uber-flash": "Uber Flash",
    personal: "Personal Delivery"
  };
  return labels[method as keyof typeof labels] || method;
}
