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

  let message = `¡Hello! I would like to place an order:\n\n`;

  message += `*CUSTOMER DETAILS:*\n`;
  message += `Name: ${customer.name}\n`;
  message += `Phone: ${customer.phone}\n\n`;

  message += `*PRODUCTS:*\n`;
  items.forEach(item => {
    message += `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toLocaleString()}\n`;
  });

  message += `\n*TOTAL: $${total.toLocaleString()}*\n\n`;

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
    correos: "Costa Rica Post",
    "uber-flash": "Uber Flash",
    personal: "Personal Delivery"
  };
  return labels[method as keyof typeof labels] || method;
}
