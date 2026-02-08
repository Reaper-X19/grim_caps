import { ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import useCartStore from '../../store/cartStore'

export default function CartIcon() {
  const totalItems = useCartStore(state => state.getTotalItems())

  return (
    <Link
      to="/cart"
      className="relative p-2 hover:bg-gray-800/50 rounded-lg transition-colors group"
      aria-label="Shopping Cart"
    >
      <ShoppingCart className="w-6 h-6 text-gray-300 group-hover:text-grim-accent transition-colors" />
      
      {/* Badge */}
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-grim-accent text-black text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
          {totalItems > 9 ? '9+' : totalItems}
        </span>
      )}
    </Link>
  )
}
