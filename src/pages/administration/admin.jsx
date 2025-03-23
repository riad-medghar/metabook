import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import pb from '../../lib/pocketbase';
import BooksManagement from "./BooksManagement";
import OrdersManagement from "./OrdersManagement";
import CartOrdersManagement from "./CartOrdersManagement";
import { BookOpen, ShoppingBag, Package, LogOut, LayoutDashboard } from 'lucide-react';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('books');
    const navigate = useNavigate();

    const handleLogout = () => {
        pb.authStore.clear();
        navigate('/admin/login');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'books':
                return <BooksManagement />;
            case 'orders':
                return <OrdersManagement />;
            case 'cart-orders':
                return <CartOrdersManagement />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Dashboard Header */}
                <div className="mb-8 bg-white rounded-xl shadow-md p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                        <div className="flex items-center">
                            <div className="bg-blue-600 text-white p-3 rounded-lg mr-4">
                                <LayoutDashboard size={24} />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                Admin Dashboard
                            </h1>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg hover:from-gray-800 hover:to-gray-900 shadow-sm transition-all duration-300"
                        >
                            <LogOut size={16} className="mr-2" />
                            Logout
                        </button>
                    </div>
                    
                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex flex-wrap gap-2 sm:gap-0">
                            <TabButton 
                                isActive={activeTab === 'books'}
                                onClick={() => setActiveTab('books')}
                                icon={<BookOpen size={18} />}
                                label="Books Management"
                            />
                            <TabButton 
                                isActive={activeTab === 'orders'}
                                onClick={() => setActiveTab('orders')}
                                icon={<Package size={18} />}
                                label="Orders Management"
                            />
                            <TabButton 
                                isActive={activeTab === 'cart-orders'}
                                onClick={() => setActiveTab('cart-orders')}
                                icon={<ShoppingBag size={18} />}
                                label="Cart Orders"
                            />
                        </nav>
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white p-6 rounded-xl shadow-md transition-all duration-500">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

// TabButton component for cleaner code
const TabButton = ({ isActive, onClick, icon, label }) => {
    return (
        <button
            onClick={onClick}
            className={`
                flex items-center whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm sm:text-base
                transition-all duration-300 mr-2 sm:mr-8
                ${isActive 
                    ? 'border-blue-500 text-blue-600 bg-blue-50 rounded-t-lg' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'}
            `}
        >
            <span className={`mr-2 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                {icon}
            </span>
            {label}
        </button>
    );
};

export default Admin;