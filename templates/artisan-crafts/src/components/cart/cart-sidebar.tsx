import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export default function CartSidebar() {
  const { items, isOpen, toggleCart, updateQuantity, removeFromCart, total } = useCartStore();

  const handleCheckout = () => {
    if (items.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }
    useCartStore.getState().setShowCheckout(true);
    toggleCart(); // Close cart sidebar
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 overflow-hidden ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="h-full flex flex-col">
        {/* Cart Header */}
        <div className="p-6 border-b bg-green-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Tu Carrito</h3>
            <Button variant="ghost" size="sm" onClick={toggleCart}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center ${item.imageUrl ? 'hidden' : ''}`}>
                    <span className="text-2xl">🏺</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{item.name}</h4>
                    <p className="text-primary font-semibold">${item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t bg-muted/50">
            <div className="mb-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span className="text-foreground">Total:</span>
                <span className="text-foreground">${total.toLocaleString()}</span>
              </div>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-3 px-4 h-auto font-medium transition-colors"
            >
              Continuar por WhatsApp
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
