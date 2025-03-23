import React, { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingCart, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import useCart from '../../hooks/useCart';
import CheckoutForm from '../../components/CheckoutForm';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion'; // Import framer-motion

const Cart = () => {
    const { t } = useTranslation();
    const { 
        cart, 
        total, 
        loading, 
        error, 
        removeFromCart, 
        updateQuantity,
        clearCart,
        checkout
    } = useCart();
    
    const [showCheckout, setShowCheckout] = useState(false);
    const [orderStatus, setOrderStatus] = useState(null);
    const navigate = useNavigate();

    const handleQuantityChange = async (bookId, newQuantity) => {
        if (newQuantity < 1) return;
        
        try {
            await updateQuantity(bookId, newQuantity);
        } catch (error) {
            console.error('Failed to update quantity:', error);
        }
    };

    const handleCheckout = async (formData) => {
        try {
            const orderResult = await checkout({
                ...formData,
                items: cart,
                total: total
            });

            if (!orderResult?.id) {
                throw new Error('Invalid order response');
            }
            
            setOrderStatus('success');
            setShowCheckout(false);
            navigate('/order-confirmation', {
                state: {
                    orderId: orderResult.id,
                    orderDetails: {
                        orderDate: new Date().toISOString(),
                        total: total,
                        status: 'pending'
                    }
                }
            });
        } catch (err) {
            setOrderStatus('error');
            console.error('Error submitting order:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-200px)] flex flex-col justify-center items-center bg-gray-50">
                <div className="w-16 h-16 relative">
                    <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-blue-200 animate-spin"></div>
                    <div className="absolute inset-3 rounded-full border-2 border-t-blue-400 border-blue-100 animate-spin-slow"></div>
                </div>
                <span className="mt-4 text-gray-600 font-medium">{t('common.loading', 'Loading your cart...')}</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[calc(100vh-200px)] flex flex-col justify-center items-center bg-gray-50 px-4">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                    <div className="flex justify-center mb-4">
                        <AlertCircle size={48} className="text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('common.error', 'Error')}</h2>
                    <p className="text-red-500">{error}</p>
                </div>
            </div>
        );
    }

    if (!cart || cart.length === 0) {
        return (
            <div className="min-h-[calc(100vh-200px)] flex flex-col justify-center items-center bg-gray-50 px-4">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                            <ShoppingCart size={36} className="text-blue-500" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('cart.title', 'Your Cart')}</h2>
                    <p className="text-gray-500 mb-6">{t('cart.empty', 'Your cart is empty')}</p>
                    <button 
                        onClick={() => navigate('/catalog')}
                        className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                    >
                        {t('cart.browseCatalog', 'Browse Books')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            className="max-w-6xl mx-auto px-4 py-8 md:py-12 bg-gray-50 min-h-[calc(100vh-100px)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                        {t('cart.title', 'Your Cart')}
                    </h1>
                 
                </div>
                <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-800 flex items-center gap-2 font-medium"
                >
                    <Trash2 className="w-4 h-4" />
                    {t('cart.clear', 'Clear Cart')}
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                <div className="divide-y divide-gray-100">
                    <AnimatePresence>
                        {cart.map((item) => (
                            <motion.div
                                key={item.book_id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col sm:flex-row items-center p-5 hover:bg-blue-50/30 transition-colors"
                            >
                                {/* Image */}
                                <div className="relative mb-4 sm:mb-0">
                                    <div className="w-24 h-32 sm:w-20 sm:h-28 rounded-lg overflow-hidden shadow-md border border-gray-200 bg-white">
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/150x200?text=Book';
                                            }}
                                        />
                                    </div>
                                </div>
                                
                                {/* Item details */}
                                <div className="flex-1 px-4 text-center sm:text-left">
                                    <h3 className="text-lg font-medium text-gray-800 hover:text-blue-600 transition-colors">
                                        {item.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-1">{item.author}</p>
                                    <p className="text-gray-800 font-medium">
                                        {item.price} {t('common.currency', 'DZD')}
                                    </p>
                                </div>
                                
                                {/* Quantity controls */}
                                <div className="flex items-center mt-4 sm:mt-0">
                                    <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                                        <button
                                            onClick={() => {
                                                const newQuantity = item.quantity - 1;
                                                if (newQuantity >= 1) {
                                                    handleQuantityChange(item.book_id, newQuantity);
                                                }
                                            }}
                                            disabled={item.quantity <= 1}
                                            className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            type="button"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-10 text-center font-medium text-gray-800">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => {
                                                handleQuantityChange(item.book_id, item.quantity + 1);
                                            }}
                                            className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                            type="button"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Subtotal and remove */}
                                <div className="flex justify-between items-center mt-4 sm:mt-0 sm:ml-6 w-full sm:w-auto">
                                    <div className="font-semibold text-blue-600 mr-4">
                                        {(item.quantity * item.price).toFixed(2)} {t('common.currency', 'DZD')}
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.book_id)}
                                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                                        title={t('cart.removeItem', 'Remove from cart')}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Cart summary */}
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-gray-700">
                            <span className="text-lg font-medium">{t('cart.total', 'Total')}:</span>
                            <span className="text-2xl font-bold text-blue-600 ml-3">
                                {total.toFixed(2)} {t('common.currency', 'DZD')}
                            </span>
                        </div>
                        <motion.button
                            onClick={() => setShowCheckout(true)}
                            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                                text-white rounded-lg font-medium flex items-center gap-2 transition-all
                                shadow-md hover:shadow-lg"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={cart.length === 0}
                        >
                            {t('cart.proceed', 'Proceed to Checkout')}
                            <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    </div>
                </div>
                  
                {/* Order status messages */}
                <AnimatePresence>
                    {orderStatus === 'success' && (
                        <motion.div 
                            className="mt-4 p-4 bg-green-50 text-green-700 rounded-md flex items-center gap-3 shadow-sm"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            {t('orderConfirmation.success', 'Order placed successfully! We will contact you soon.')}
                        </motion.div>
                    )}
                    {orderStatus === 'error' && (
                        <motion.div 
                            className="mt-4 p-4 bg-red-50 text-red-700 rounded-md flex items-center gap-3 shadow-sm"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            {t('orderConfirmation.error', 'Failed to place order. Please try again.')}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Checkout form modal */}
            <AnimatePresence>
                {showCheckout && (
                    <CheckoutForm
                        cart={cart}
                        total={total}
                        onSubmit={handleCheckout}
                        onCancel={() => setShowCheckout(false)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Cart;