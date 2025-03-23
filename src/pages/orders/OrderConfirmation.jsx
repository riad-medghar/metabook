import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion'; // For animations
import { CheckCircle, AlertCircle, ArrowRight, Package } from 'lucide-react'; // Icons

const OrderConfirmation = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const { orderId, orderDetails } = location.state || {};

    if (!orderId) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 border border-red-100"
                >
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                            <AlertCircle size={40} className="text-red-500" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        {t('orderConfirmation.invalid', 'Invalid Order Access')}
                    </h2>
                    <p className="text-gray-600 mb-8 text-lg">
                        {t('orderConfirmation.noInfo', 'No order information found. Please try placing your order again.')}
                    </p>
                    <Link 
                        to="/cart" 
                        className="inline-flex items-center justify-center w-full bg-blue-600 text-white px-6 py-3.5 rounded-lg 
                                 hover:bg-blue-700 transition-all duration-300 font-medium text-lg
                                 shadow-md hover:shadow-lg"
                    >
                        {t('orderConfirmation.returnToCart', 'Return to Cart')}
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 flex items-center justify-center px-4 py-12">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-lg w-full bg-white rounded-xl shadow-xl p-8 border border-green-100"
            >
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center">
                        <CheckCircle size={48} className="text-green-500" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    {t('orderConfirmation.success', 'Order Submitted Successfully!')}
                </h2>
                <div className="text-gray-600 mb-8">
                    <p className="text-lg mb-6">
                        {t('orderConfirmation.thankYou', 'Thank you for your order. We will review your submission and contact you shortly.')}
                    </p>
                    
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center justify-center space-x-2 mb-8">
                        <Package className="text-blue-500 flex-shrink-0" />
                        <span className="font-medium text-gray-700">
                            {t('orderConfirmation.orderId', 'Order ID')}: 
                        </span>
                        <code className="font-mono bg-white px-2 py-1 rounded text-blue-700 font-semibold">
                            {orderId}
                        </code>
                    </div>

                    {orderDetails && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="rounded-xl border border-gray-200 overflow-hidden"
                        >
                            <div className="bg-gray-50 p-4 border-b border-gray-200">
                                <h3 className="font-bold text-lg text-gray-800">
                                    {t('orderConfirmation.summary', 'Order Summary')}
                                </h3>
                            </div>
                            
                            <div className="p-4 space-y-3">
                                {orderDetails.created && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{t('orderConfirmation.date', 'Date')}:</span>
                                        <span className="font-medium">{new Date(orderDetails.created).toLocaleDateString()}</span>
                                    </div>
                                )}
                                
                                {orderDetails.name && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{t('orderConfirmation.customer', 'Customer')}:</span>
                                        <span className="font-medium">{orderDetails.name}</span>
                                    </div>
                                )}
                                
                                {orderDetails.email && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{t('orderConfirmation.email', 'Email')}:</span>
                                        <span className="font-medium text-gray-800">{orderDetails.email}</span>
                                    </div>
                                )}
                                
                                {orderDetails.quantity && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{t('common.quantity', 'Quantity')}:</span>
                                        <span className="font-medium">{orderDetails.quantity}</span>
                                    </div>
                                )}
                                
                                {orderDetails.status && (
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                        <span className="text-gray-600">{t('orderConfirmation.status', 'Status')}:</span>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            {t(`orderStatus.${orderDetails.status}`, orderDetails.status)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="flex justify-center"
                >
                    <Link 
                        to="/catalog" 
                        className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 
                                text-white px-8 py-3.5 rounded-lg hover:from-blue-600 hover:to-blue-700 
                                transition-all duration-300 font-medium text-lg gap-2 shadow-md hover:shadow-lg
                                transform hover:-translate-y-0.5"
                    >
                        {t('orderConfirmation.continueShopping', 'Continue Shopping')}
                        <ArrowRight size={20} />
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default OrderConfirmation;