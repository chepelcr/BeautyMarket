import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";

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
        <div className="p-6 border-b bg-pink-light">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif font-semibold text-gray-900">Tu Carrito</h3>
            <Button variant="ghost" size="sm" onClick={toggleCart}>
              <i className="fas fa-times"></i>
            </Button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-shopping-bag text-gray-300 text-4xl mb-4"></i>
              <p className="text-gray-500">Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
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
                  <div className={`w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg flex items-center justify-center ${item.imageUrl ? 'hidden' : ''}`}>
                    <span className="text-2xl">🍓</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-pink-primary font-semibold">₡{item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 p-0"
                    >
                      <i className="fas fa-minus text-xs"></i>
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 p-0"
                    >
                      <i className="fas fa-plus text-xs"></i>
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <i className="fas fa-trash"></i>
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
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span>₡{total.toLocaleString()}</span>
              </div>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 h-auto font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <i className="fab fa-whatsapp"></i>
              <span>Continuar por WhatsApp</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
