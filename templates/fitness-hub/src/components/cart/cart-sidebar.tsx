import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { X, Minus, Plus, Trash2 } from "lucide-react";

export default function CartSidebar() {
  const { items, isOpen, toggleCart, updateQuantity, removeFromCart, total } = useCartStore();

  const handleCheckout = () => {
    if (items.length === 0) {
      alert("Your cart is empty");
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
        <div className="p-6 border-b bg-red-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-gray-900">YOUR CART</h3>
            <Button variant="ghost" size="sm" onClick={toggleCart}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-300 text-4xl mb-4">🛒</div>
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
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
                  <div className={`w-16 h-16 bg-gradient-to-br from-red-100 to-orange-200 rounded-lg flex items-center justify-center ${item.imageUrl ? 'hidden' : ''}`}>
                    <span className="text-2xl">💪</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-gray-900 text-sm">{item.name}</h4>
                    <p className="text-red-600 font-black">${item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 p-0 border-2 border-gray-300"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-black">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 p-0 border-2 border-gray-300"
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
          <div className="p-6 border-t bg-gray-50">
            <div className="mb-4">
              <div className="flex justify-between items-center text-lg font-black">
                <span className="text-gray-900">TOTAL:</span>
                <span className="text-red-600 text-2xl">${total.toLocaleString()}</span>
              </div>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 h-auto font-black transition-colors flex items-center justify-center space-x-2"
            >
              <i className="fab fa-whatsapp"></i>
              <span>CHECKOUT VIA WHATSAPP</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
