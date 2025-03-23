import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import pb from "../../lib/pocketbase";
import { useTranslation } from "react-i18next";
import { Upload, FileText, ChevronRight, AlertCircle } from 'lucide-react'; // Import icons

const Order = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        phone: "",
        address: "",
        email: "",
        bookFile: null,
        quantity: "",
        description: "",
        status: "pending"
    });
    
    const validateField = (name, value) => {
        let error = null;   
        switch (name) {
            case 'name':
                if (!value?.trim()) error = t('order.errors.nameRequired', 'Name is required');
                else if (value.length < 2) error = t('order.errors.nameLength', 'Name must be at least 2 characters');
                break;
            case 'surname':
                if (!value?.trim()) error = t('order.errors.surnameRequired', 'Surname is required');
                else if (value.length < 2) error = t('order.errors.surnameLength', 'Surname must be at least 2 characters');
                break;
            case 'phone':
                if (!value?.trim()) error = t('order.errors.phoneRequired', 'Phone is required');
                else if (!/^\d{10}$/.test(value)) error = t('order.errors.phoneFormat', 'Phone must be 10 digits');
                break;
            case 'address':
                if (!value?.trim()) error = t('order.errors.addressRequired', 'Address is required');
                else if (value.length < 4) error = t('order.errors.addressLength', 'Address must be at least 4 characters');
                break;
            case 'bookFile':
                if (!value) error = t('order.errors.cvRequired', 'CV file is required');
                else if (value.type !== 'application/pdf') error = t('order.errors.cvFormat', 'CV file must be a PDF');
                break;
            case 'email':
                if (!value?.trim()) error = t('order.errors.emailRequired', 'Email is required');
                else if (!/^\S+@\S+\.\S+$/.test(value)) error = t('order.errors.emailInvalid', 'Email is invalid');
                break;
            case 'quantity':
                if (!value?.trim()) error = t('order.errors.quantityRequired', 'Quantity is required');
                else if (parseInt(value) < 1) error = t('order.errors.quantityMin', 'Quantity must be at least 1');
                break;
            default:
                break;
        }
        return error;
    };
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        const error = validateField(name, value);
        setFieldErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files.length > 0) {
            if (name === 'bookFile' && files[0].type !== 'application/pdf') {
                setFieldErrors(prev => ({ ...prev, [name]: t('order.errors.cvFormat', 'CV file must be a PDF') }));
                e.target.value = '';
                return;
            }

            setFormData(prev => ({ ...prev, [name]: files[0] }));
            setFieldErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const newErrors = {};
        let hasErrors = false;
        
        Object.keys(formData).forEach(field => {
            if (field !== 'description' && field !== 'status') {
                const error = validateField(field, formData[field]);
                if (error) {
                    newErrors[field] = error;
                    hasErrors = true;
                }
            }
        });
        
        if (hasErrors) {
            setFieldErrors(newErrors);
            return;
        }
        
        setLoading(true);
        setError(null);

        try {
            const allData = new FormData();
            
            // Add all text fields
            allData.append('name', formData.name);
            allData.append('surname', formData.surname);
            allData.append('phone', formData.phone);
            allData.append('email', formData.email);
            allData.append('address', formData.address);
            allData.append('quantity', formData.quantity);
            allData.append('description', formData.description || '');
            allData.append('status', 'pending');
            
            // Add file fields
            allData.append('bookFile', formData.bookFile);
            // Send an empty file or null for coverFile to keep backend compatibility
            allData.append('coverFile', new File([""], "empty.jpg", { type: "image/jpeg" }));

            const createdRecord = await pb.collection('Orders').create(allData);

            // Reset form
            setFormData({
                name: "",
                surname: "",
                phone: "",
                address: "",
                email: "",
                bookFile: null,
                coverFile: null,
                quantity: "",
                description: "",
                status: "pending"
            });
            setFieldErrors({});

            // Reset file inputs
            const fileInputs = document.querySelectorAll('input[type="file"]');
            fileInputs.forEach(input => input.value = '');

            // Navigate to confirmation
            navigate('/order-confirmation', { 
                state: { 
                    orderId: createdRecord.id,
                    orderDetails: {
                        name: `${createdRecord.name} ${createdRecord.surname}`,
                        email: createdRecord.email,
                        status: createdRecord.status,
                        created: createdRecord.created,
                        quantity: createdRecord.quantity
                    }
                } 
            });

        } catch (err) {
            console.error('Error submitting order:', err);
            
            if (err.data?.data) {
                const errorMessages = Object.entries(err.data.data)
                    .map(([field, message]) => `${field}: ${message}`)
                    .join(', ');
                
                setError(`${t('order.errors.validation', 'Validation error')}: ${errorMessages}`);
                return;
            }
            
            if (err.message?.includes('413') || err.status === 413) {
                setError(t('order.errors.fileSize', 'Files are too large. Please use smaller files or compress them.'));
            } else if (err.message?.includes('401') || err.status === 401) {
                setError(t('order.errors.auth', 'Authentication error. Please try again or contact support.'));
            } else {
                setError(err.message || t('order.errors.general', 'Failed to submit order. Please try again.'));
            }
        } finally {
            setLoading(false);
        }
    };

    const renderFieldError = (fieldName) => {
        if (fieldErrors[fieldName]) {
            return (
                <div className="flex items-center text-red-500 text-sm mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                    <span>{fieldErrors[fieldName]}</span>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-gradient-to-b from-gray-50 to-blue-50 min-h-screen">
            <div className="max-w-4xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-3 tracking-tight">
                        {t('order.title', 'Order Your Application')}
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                        {t('order.description', 'We are a publishing house specializing in print-on-demand books. Let us bring your story to life with professional printing and binding.')}
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                            <FileText className="w-5 h-5" />
                        </div>
                        {t('order.detailsTitle', 'Order Details')}
                    </h2>
                    
                    {error && (
                        <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start">
                            <AlertCircle className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-7">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('order.name', 'Name')} <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={formData.name}
                                    className={`w-full border ${fieldErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'} p-3.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                                    onChange={handleChange} 
                                    required 
                                />
                                {renderFieldError('name')}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('order.surname', 'Surname')} <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    name="surname"
                                    value={formData.surname}
                                    className={`w-full border ${fieldErrors.surname ? 'border-red-500 bg-red-50' : 'border-gray-300'} p-3.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                                    onChange={handleChange} 
                                    required 
                                />
                                {renderFieldError('surname')}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('order.phone', 'Phone')} <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="tel" 
                                    name="phone" 
                                    value={formData.phone}
                                    className={`w-full border ${fieldErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'} p-3.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                                    onChange={handleChange} 
                                    required 
                                />
                                {renderFieldError('phone')}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('order.email', 'Email')} <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email}
                                    className={`w-full border ${fieldErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'} p-3.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                                    onChange={handleChange} 
                                    required 
                                />
                                {renderFieldError('email')}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('order.address', 'Address')} <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                name="address"
                                value={formData.address} 
                                className={`w-full border ${fieldErrors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'} p-3.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                                onChange={handleChange} 
                                required 
                            />
                            {renderFieldError('address')}
                        </div>

                        <div className="p-6 rounded-xl bg-gray-50 border border-gray-100 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('order.cvFile', 'CV File (PDF)')} <span className="text-red-500">*</span>
                                    </label>
                                    <div className={`relative border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center ${fieldErrors.bookFile ? 'border-red-400 bg-red-50' : formData.bookFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400'} transition-colors`}>
                                        <input 
                                            type="file" 
                                            id="bookFile"
                                            name="bookFile" 
                                            accept=".pdf"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            onChange={handleFileChange} 
                                            required 
                                        />
                                        <FileText className={`w-8 h-8 mb-2 ${formData.bookFile ? 'text-green-500' : fieldErrors.bookFile ? 'text-red-500' : 'text-blue-500'}`} />
                                        <span className="font-medium text-sm">
                                            {formData.bookFile ? formData.bookFile.name : t('order.cvFile', 'CV (PDF)')}
                                        </span>
                                        <span className="text-xs text-gray-500 mt-1">
                                            {formData.bookFile ? `${(formData.bookFile.size / (1024 * 1024)).toFixed(2)} MB` : t('common.clickToUpload', 'Click to upload')}
                                        </span>
                                    </div>
                                    {renderFieldError('bookFile')}
                                </div>
                            
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('order.quantity', 'Quantity')} <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="number" 
                                name="quantity" 
                                min="1"
                                value={formData.quantity}
                                className={`w-full md:w-1/3 border ${fieldErrors.quantity ? 'border-red-500 bg-red-50' : 'border-gray-300'} p-3.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                                onChange={handleChange} 
                                required 
                            />
                            {renderFieldError('quantity')}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('order.instructions', 'Special Instructions')}
                            </label>
                            <textarea 
                                name="description" 
                                rows="4"
                                value={formData.description}
                                className="w-full border border-gray-300 p-3.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                onChange={handleChange}
                                placeholder={t('order.instructionsPlaceholder', 'Any special requirements or notes for your order...')}
                            ></textarea>
                        </div>

                        <div className="pt-8">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
                                         text-white px-8 py-4 rounded-xl shadow-md hover:shadow-lg
                                         font-bold text-lg flex items-center justify-center gap-3
                                         transition-all transform hover:-translate-y-0.5
                                         disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        {t('order.submitting', 'Submitting...')}
                                    </>
                                ) : (
                                    <>
                                        {t('order.submit', 'Submit Order')}
                                        <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Order;
