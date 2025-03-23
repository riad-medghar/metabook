import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // Add translation import

const CheckoutForm = ({ cart, total, onSubmit, onCancel }) => {
    const { t } = useTranslation(); // Initialize translation hook
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        notes: ''
    });
    
    // Add validation state
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const validateField = (name, value) => {
        let error = null;
        
        switch (name) {
            case 'fullName':
                if (!value?.trim()) {
                    error = t('checkout.errors.nameRequired', 'Full name is required');
                } else if (value.length < 3) {
                    error = t('checkout.errors.nameLength', 'Full name must be at least 3 characters');
                } else if (/^\d+$/.test(value)) {
                    error = t('checkout.errors.nameInvalid', 'Full name cannot contain only numbers');
                }
                break;
                
            case 'email':
                if (!value?.trim()) {
                    error = t('checkout.errors.emailRequired', 'Email is required');
                } else {
                    // Improved email validation:
                    // 1. Validates the structure (user@domain.tld)
                    // 2. Requires letters in the TLD (not just numbers)
                    // 3. Validates both domain and TLD have proper format
                    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
                    
                    if (!emailPattern.test(value)) {
                        error = t('checkout.errors.emailInvalid', 'Please enter a valid email address (e.g., example@domain.com)');
                    }
                }
                break;
                
            case 'phone':
                if (!value?.trim()) {
                    error = t('checkout.errors.phoneRequired', 'Phone number is required');
                } else {
                    // Specific phone validation that starts with 0 and has exactly 10 digits
                    const phonePattern = /^0\d{9}$/;
                    
                    if (!phonePattern.test(value)) {
                        error = t(
                            'checkout.errors.phoneInvalid', 
                            'Phone number must start with 0 and contain 10 digits (e.g., 0512345678)'
                        );
                    }
                }
                break;
                
            case 'address':
                if (!value?.trim()) {
                    error = t('checkout.errors.addressRequired', 'Address is required');
                } else if (value.length < 5) {
                    error = t('checkout.errors.addressLength', 'Address must be at least 5 characters');
                } else if (/^\d+$/.test(value)) {
                    error = t('checkout.errors.addressInvalid', 'Please enter a complete address, not just numbers');
                }
                break;
                
            case 'city':
                if (!value?.trim()) {
                    error = t('checkout.errors.cityRequired', 'City is required');
                } else if (value.length < 2) {
                    error = t('checkout.errors.cityLength', 'City name must be at least 2 characters');
                } else if (/^\d+$/.test(value)) {
                    error = t('checkout.errors.cityInvalid', 'City name cannot be just numbers');
                }
                break;
                
            case 'zipCode':
                // ZIP is now optional, so only validate if it's not empty
                if (value?.trim() && !/^\d{5}(-\d{4})?$/.test(value)) {
                    error = t('checkout.errors.zipInvalid', 'Please enter a valid ZIP code (12345 or 12345-6789)');
                }
                break;
                
            default:
                break;
        }
        
        return error;
    };
    
    const validateForm = () => {
        const newErrors = {};
        let isValid = true;
        
        // Validate all required fields
        Object.keys(formData).forEach(key => {
            // Skip validation for notes and zipCode (optional fields)
            if (key === 'notes' || key === 'zipCode') return;
            
            const error = validateField(key, formData[key]);
            if (error) {
                newErrors[key] = error;
                isValid = false;
            }
        });
        
        // Validate zipCode only if provided
        if (formData.zipCode?.trim()) {
            const zipError = validateField('zipCode', formData.zipCode);
            if (zipError) {
                newErrors.zipCode = zipError;
                isValid = false;
            }
        }
        
        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Touch all fields to show all validation errors (except optional fields)
        const touchedFields = {};
        Object.keys(formData).forEach(key => {
            if (key !== 'notes' && key !== 'zipCode') {
                touchedFields[key] = true;
            }
            
            // Touch zipCode only if provided
            if (key === 'zipCode' && formData.zipCode?.trim()) {
                touchedFields[key] = true;
            }
        });
        setTouched(touchedFields);
        
        // Validate form before submission
        if (validateForm()) {
            onSubmit({ ...formData, cart, total });
        } else {
            // Focus the first field with an error
            const firstErrorField = Object.keys(errors).find(key => errors[key]);
            if (firstErrorField) {
                document.querySelector(`[name="${firstErrorField}"]`)?.focus();
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleBlur = (e) => {
        const { name } = e.target;
        
        // Mark as touched
        setTouched(prev => ({ ...prev, [name]: true }));
        
        // Validate on blur
        const error = validateField(name, formData[name]);
        setErrors(prev => ({ ...prev, [name]: error }));
    };
    
    // Helper function to determine if a field should show an error
    const shouldShowError = (field) => touched[field] && errors[field];

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full my-8">
                <h2 className="text-2xl font-bold mb-4">{t('checkout.title', 'Checkout Information')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {t('checkout.fullName', 'Full Name')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                required
                                value={formData.fullName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                    shouldShowError('fullName') 
                                        ? 'border-red-500' 
                                        : 'border-gray-300'
                                }`}
                            />
                            {shouldShowError('fullName') && (
                                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {t('checkout.email', 'Email')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                    shouldShowError('email') 
                                        ? 'border-red-500' 
                                        : 'border-gray-300'
                                }`}
                            />
                            {shouldShowError('email') && (
                                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {t('checkout.phone', 'Phone')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="0512345678"
                                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                    shouldShowError('phone') 
                                        ? 'border-red-500' 
                                        : 'border-gray-300'
                                }`}
                            />
                            {shouldShowError('phone') && (
                                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-1">
                                {t('checkout.phoneHelp', 'Enter 10 digits starting with 0')}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {t('checkout.address', 'Address')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="address"
                                required
                                value={formData.address}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                    shouldShowError('address') 
                                        ? 'border-red-500' 
                                        : 'border-gray-300'
                                }`}
                            />
                            {shouldShowError('address') && (
                                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {t('checkout.city', 'City')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="city"
                                required
                                value={formData.city}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                    shouldShowError('city') 
                                        ? 'border-red-500' 
                                        : 'border-gray-300'
                                }`}
                            />
                            {shouldShowError('city') && (
                                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {t('checkout.zipCode', 'ZIP Code')} {/* Removed required asterisk */}
                            </label>
                            <input
                                type="text"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                    shouldShowError('zipCode') 
                                        ? 'border-red-500' 
                                        : 'border-gray-300'
                                }`}
                            />
                            {shouldShowError('zipCode') && (
                                <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-1">
                                {t('checkout.zipHelp', 'Optional - Format: 12345 or 12345-6789')}
                            </p>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            {t('checkout.notes', 'Notes (Optional)')}
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex justify-end space-x-4 rtl:space-x-reverse mt-6">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                        >
                            {t('common.cancel', 'Cancel')}
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                        >
                            {t('checkout.placeOrder', 'Place Order')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutForm;