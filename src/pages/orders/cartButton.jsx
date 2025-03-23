import React, { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import useCart from "../../hooks/useCart"; 

const CartButton = () => {
  // Get cart from your hook
  const { cart } = useCart();
  const [prevCount, setPrevCount] = useState(0);
  
  // Calculate total items by summing all quantities
  const totalItems = cart?.reduce((total, item) => {
    return total + (item.quantity || 1);
  }, 0) || 0;
  
  // Add animation effect when count changes
  useEffect(() => {
    if (totalItems > prevCount) {
      const button = document.querySelector('.cart-button-icon');
      if (button) {
        button.classList.add('animate-bounce');
        setTimeout(() => {
          button.classList.remove('animate-bounce');
        }, 1000);
      }
    }
    setPrevCount(totalItems);
  }, [totalItems, prevCount]);
  
  return (
    <Link 
      to="/cart" 
      className="text-gray-900 hover:text-blue-700 transform hover:scale-110 flex items-center cursor-pointer text-xl relative"
    >
      <span className="mr-1">Cart</span>
      <div className="cart-button-icon relative">
        <ShoppingBag className="w-5 h-5 inline-block" />
        <AnimatePresence>
          {totalItems > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className="absolute -top-2 -right-2 w-5 h-5 text-xs font-bold flex items-center justify-center bg-blue-700 text-white rounded-full"
            >
              {totalItems}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </Link>
  );
};

export default CartButton;