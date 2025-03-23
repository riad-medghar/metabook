import { ShoppingBasket } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CartButton from './orders/cartButton';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const Nav = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { t } = useTranslation();
    
    // Close menu when clicking outside or on navigation
    useEffect(() => {
        const handleClickOutside = () => {
            if (menuOpen) setMenuOpen(false);
        };
        
        // Add timeout to prevent immediate closing when opening
        if (menuOpen) {
            setTimeout(() => {
                document.addEventListener('click', handleClickOutside);
            }, 100);
        }
        
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [menuOpen]);

    return (
        <div className="relative bg-white shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold">MetaBook</h1>
                    </div>
                    
                    {/* Desktop Navigation */}
                    <nav className="hidden md:block">
                        <ul className="flex space-x-8 rtl:space-x-reverse items-center">
                            <li>
                                <Link to="/" className="text-gray-700 hover:text-blue-700 transition-colors font-medium">
                                    {t('nav.home', 'Home')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/catalog" className="text-gray-700 hover:text-blue-700 transition-colors font-medium">
                                    {t('nav.catalog', 'Catalog')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/order" className="text-gray-700 hover:text-blue-700 transition-colors font-medium">
                                    {t('nav.order', 'Order')}
                                </Link>
                            </li>
                            <li>
                                <CartButton />
                            </li>
                            <li>
                                <LanguageSwitcher />
                            </li>
                        </ul>
                    </nav>
                    
                    {/* Mobile Menu Button */}
                    <div className="flex items-center space-x-4 rtl:space-x-reverse md:hidden">
                        <CartButton />
                        <LanguageSwitcher />
                        <button
                            className="text-gray-700 focus:outline-none"
                            onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpen(!menuOpen);
                            }}
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d={menuOpen 
                                        ? "M6 18L18 6M6 6l12 12" // X icon
                                        : "M4 6h16M4 12h16M4 18h16" // Hamburger icon
                                    }
                                ></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Mobile Navigation Menu */}
            {menuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg z-50">
                    <nav className="container mx-auto px-4 py-3">
                        <ul className="flex flex-col space-y-4">
                            <li>
                                <Link 
                                    to="/" 
                                    className="block py-2 text-gray-700 hover:text-blue-700 transition-colors font-medium"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {t('nav.home', 'Home')}
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/catalog" 
                                    className="block py-2 text-gray-700 hover:text-blue-700 transition-colors font-medium"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {t('nav.catalog', 'Catalog')}
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/order" 
                                    className="block py-2 text-gray-700 hover:text-blue-700 transition-colors font-medium"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {t('nav.order', 'Order')}
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}
        </div>
    );
}

export default Nav;
