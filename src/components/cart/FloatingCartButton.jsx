import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useCart from '../../hooks/useCart';

const FloatingCartButton = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { cart } = useCart();
    
    // Get current language
    const isRTL = i18n.language === 'ar';
    
    // Fix the calculation based on your actual cart structure
    const totalItems = Array.isArray(cart) 
        ? cart.reduce((total, item) => total + (item.quantity || 1), 0) 
        : cart?.items?.reduce((total, item) => total + (item.quantity || 1), 0) || 0;
    
    
    // Only show button if cart has items
    if (totalItems === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                className={`fixed bottom-6 ${isRTL ? 'left-6' : 'right-6'} md:hidden z-[9999]`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20 
                }}
            >
                <motion.button
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white 
                             flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] 
                             border-2 border-blue-400 border-opacity-20"
                    whileHover={{ 
                        scale: 1.05,
                        boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/cart')}
                    aria-label="View Cart"
                >
                    <ShoppingCart size={26} strokeWidth={2.5} />
                    <motion.div 
                        className={`absolute -top-2 ${isRTL ? '-left-1' : '-right-1'} bg-gradient-to-r from-red-500 to-pink-500 
                                text-white text-xs min-w-5 h-5 rounded-full flex items-center 
                                justify-center font-bold px-1.5 border border-white`}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {totalItems}
                    </motion.div>
                </motion.button>

                {/* Optional pulse effect */}
                <motion.div
                    className="absolute inset-0 rounded-full bg-blue-400"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.7, 0, 0.7]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "loop"
                    }}
                    style={{ zIndex: -1 }}
                />
            </motion.div>
        </AnimatePresence>
    );
};

export default FloatingCartButton;