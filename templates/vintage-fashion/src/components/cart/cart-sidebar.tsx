import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { VintageButton } from '../VintageButton';
import { useCartStore } from '@/store/cart';

export default function CartSidebar() {
  const { items, isOpen, toggleCart, updateQuantity, removeFromCart, total } = useCartStore();

  const handleCheckout = () => {
    if (items.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }
    useCartStore.getState().setShowCheckout(true);
    toggleCart();
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-card shadow-2xl transform transition-transform duration-300 ease-in-out z-50 overflow-hidden ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="h-full flex flex-col">
        {/* Cart Header */}
        <div className="p-6 border-b-2 border-burgundy-900/20 bg-amber-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif font-semibold text-burgundy-900">Tu Carrito</h3>
            <button
              onClick={toggleCart}
              className="p-2 text-burgundy-900 hover:text-mustard-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛍️</div>
              <p className="text-burgundy-900/70 font-body">Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 bg-cream-50 rounded-lg border-2 border-burgundy-900/10">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-16 h-16 bg-gradient-to-br from-burgundy-50 to-mustard-50 rounded-md flex items-center justify-center ${item.imageUrl ? 'hidden' : ''}`}>
                    <span className="text-2xl">👗</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif font-medium text-burgundy-900">{item.name}</h4>
                    <p className="text-burgundy-900 font-semibold">${item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center border-2 border-burgundy-900/30 rounded-md hover:border-burgundy-900 transition-colors"
                    >
                      <Minus size={14} className="text-burgundy-900" />
                    </button>
                    <span className="w-8 text-center font-serif font-medium text-burgundy-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center border-2 border-burgundy-900/30 rounded-md hover:border-burgundy-900 transition-colors"
                    >
                      <Plus size={14} className="text-burgundy-900" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-burgundy-900/50 hover:text-burgundy-900 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t-2 border-burgundy-900/20 bg-cream-50">
            <div className="mb-4">
              <div className="flex justify-between items-center text-lg font-serif font-semibold">
                <span className="text-burgundy-900">Total:</span>
                <span className="text-burgundy-900">${total.toLocaleString()}</span>
              </div>
            </div>
            <VintageButton
              onClick={handleCheckout}
              variant="primary"
              className="w-full bg-amber-700 hover:bg-amber-800 text-cream-50 flex items-center justify-center space-x-2"
            >
              <i className="fab fa-whatsapp"></i>
              <span>Continuar por WhatsApp</span>
            </VintageButton>
          </div>
        )}
      </div>
    </div>
  );
}
