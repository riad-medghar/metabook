import React, { useState, useEffect, use } from 'react';
import { X, BookOpen, Upload, Save, Plus, Trash2, FileJson } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import libraryBackground from '../../assets/library-background.jpg';
import { s } from 'framer-motion/client';

const BookFormModal = ({ book, onClose, onSubmit, title }) => {
    const [formData, setFormData] = useState({
        name: book?.name || '',
        author: book?.author || '',
        description: book?.description || '',
        // Fix for genre - ensure it's a string, not an array
        genre: Array.isArray(book?.genre) ? book?.genre[0] || '' : book?.genre || '',
        price: book?.price || '',
        qte: book?.qte || '',
        image: null,
        catalog: (() => {
            console.log('[BookFormModal] Processing initial catalog:', book?.catalog);
            
            // If catalog doesn't exist, return empty array
            if (!book?.catalog) return [];
            
            // If catalog is already an array, use it directly
            if (Array.isArray(book.catalog)) return book.catalog;
            
            // If catalog is a string, try to parse it
            if (typeof book.catalog === 'string') {
                try {
                    const parsed = JSON.parse(book.catalog);
                    return Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                    console.error('Failed to parse catalog JSON:', e);
                    return [];
                }
            }
            
            // If it's an object but not an array, return as single-item array
            if (typeof book.catalog === 'object' && book.catalog !== null) {
                return [book.catalog];
            }
            
            // Default to empty array
            return [];
        })()        
    });
    
    const [preview, setPreview] = useState(null);
    const [focused, setFocused] = useState(null);
    const [activeTab, setActiveTab] = useState('details');
    
    useEffect(() => {
        // Create URL preview for the image if available
        if (formData.image && typeof formData.image === 'object') {
            const objectUrl = URL.createObjectURL(formData.image);
            setPreview(objectUrl);
            
            // Clean up the URL when component unmounts
            return () => URL.revokeObjectURL(objectUrl);
        } else if (book?.imageUrl) {
            // If editing a book with an existing image URL
            setPreview(book.imageUrl);
        }
    }, [formData.image, book?.imageUrl]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    const handleFocus = (field) => {
        setFocused(field);
    };

    const handleBlur = () => {
        setFocused(null);
    };
    const addCatalogItem = () => {
        setFormData(prev => ({
            ...prev,
            catalog: [...(prev.catalog || []), {title: '', page: ''}]  // Changed from 'content' to 'page'
        }));
    };
    const updateCatalogItem = (index, field, value) => {
        const updatedCatalog = [...formData.catalog];
        updatedCatalog[index] = { ...updatedCatalog[index], [field]: value };
        setFormData(prev => ({
            ...prev,
            catalog: updatedCatalog
        }));
    };
    const removeCatalogItem = (index) => {
        setFormData(prev => ({
            ...prev,
            catalog: prev.catalog.filter((_, i) => i !== index)
        }));
    };


    //json text area for catalog
    const [jsonText, setJsonText] = useState('');
    const [jsonError, setJsonError] = useState(null);

    useEffect(() => {
        //initialize json text area with the current catalog
        if (formData.catalog) {
          try
          {
              setJsonText(JSON.stringify(formData.catalog, null, 2));
          }catch (e){
              setJsonError('Invalid JSON');
          }
        } 
    }, []);

    const handleJsonTextChange = (e) => {
        const text = e.target.value;
        setJsonText(text);
        //validate json
        try {
            const parsed = JSON.parse(text);
            if (!Array.isArray(parsed)) {
                setJsonError('Invalid JSON: Should be an array');
            } else {
                setJsonError('');
                setFormData(prev => ({
                    ...prev,
                    catalog: parsed
                }));
            }
        } catch (e) {
            setJsonError('Invalid JSON');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Create a copy to avoid mutating the original state
        const formDataToSubmit = { ...formData };
        
        // Convert the catalog array to a JSON string before submitting
        if (formDataToSubmit.catalog) {
            try {
                formDataToSubmit.catalog = JSON.stringify(formDataToSubmit.catalog);
                console.log('[BookFormModal] Submitting catalog as:', formDataToSubmit.catalog);
            } catch (error) {
                console.error('[BookFormModal] Error stringifying catalog:', error);
                formDataToSubmit.catalog = '[]'; // Fallback to empty array
            }
        } else {
            formDataToSubmit.catalog = '[]'; // Ensure it's a valid JSON string
        }
        
        onSubmit(formDataToSubmit);
        onClose();
    };

    // List of genres for the dropdown
    const genres = [
        "Adventure", "Mystery", "Science", "Fantasy", 
        "History", "Poetry", "Technology", "Romance"
    ];

    return (
        <AnimatePresence>
            <motion.div 
                className="fixed inset-0 flex items-center justify-center p-4 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Stylized background */}
                <div 
                    className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-30"
                    style={{ backgroundImage: `url(${libraryBackground})` }}
                ></div>
                
                {/* Modal content */}
                <motion.div 
                    className="bg-white rounded-xl max-w-xl w-full mx-auto my-4 shadow-2xl relative z-10 overflow-hidden"
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", damping: 25 }}
                >
                    {/* Header with gradient background */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white flex justify-between items-center">
                        <div className="flex items-center">
                            <BookOpen className="mr-3" size={22} />
                            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition-all duration-200"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    {/* Tab navigation */}
                    <div className="bg-gray-50 border-b border-gray-200">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`px-5 py-3 text-sm font-medium transition-colors ${
                                    activeTab === 'details' 
                                        ? 'border-b-2 border-blue-600 text-blue-700' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Book Details
                            </button>
                            <button
                                onClick={() => setActiveTab('catalog')}
                                className={`px-5 py-3 text-sm font-medium transition-colors flex items-center ${
                                    activeTab === 'catalog' 
                                        ? 'border-b-2 border-blue-600 text-blue-700' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Catalog / JSON
                                {Array.isArray(formData.catalog) && formData.catalog.length > 0 && (
                                    <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                                        {formData.catalog.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                    
                    {/* Form body with enhanced styling */}
                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Details tab*/}
                            {activeTab === 'details' && (
                                <>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Book Title</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            onFocus={() => handleFocus('name')}
                                            onBlur={handleBlur}
                                            className={`block w-full rounded-lg border ${focused === 'name' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'} 
                                                      shadow-sm py-2.5 px-3.5 text-gray-900 placeholder-gray-400
                                                      focus:outline-none transition-all duration-200`}
                                            placeholder="Enter book title"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Author</label>
                                        <input
                                            type="text"
                                            name="author"
                                            value={formData.author}
                                            onChange={handleChange}
                                            onFocus={() => handleFocus('author')}
                                            onBlur={handleBlur}
                                            className={`block w-full rounded-lg border ${focused === 'author' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'} 
                                                      shadow-sm py-2.5 px-3.5 text-gray-900 placeholder-gray-400
                                                      focus:outline-none transition-all duration-200`}
                                            placeholder="Enter author name"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        onFocus={() => handleFocus('description')}
                                        onBlur={handleBlur}
                                        rows={3}
                                        className={`block w-full rounded-lg border ${focused === 'description' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'} 
                                                  shadow-sm py-2.5 px-3.5 text-gray-900 placeholder-gray-400
                                                  focus:outline-none transition-all duration-200`}
                                        placeholder="Enter book description"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Genre</label>
                                        <select
                                            name="genre"
                                            value={formData.genre}
                                            onChange={handleChange}
                                            onFocus={() => handleFocus('genre')}
                                            onBlur={handleBlur}
                                            className={`block w-full rounded-lg border ${focused === 'genre' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'} 
                                                      shadow-sm py-2.5 px-3.5 text-gray-900
                                                      focus:outline-none transition-all duration-200 bg-white
                                                      appearance-none bg-select-arrow bg-no-repeat bg-right-1`}
                                            required
                                            style={{
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                                backgroundSize: '20px',
                                                backgroundPosition: 'right 0.5rem center'
                                            }}
                                        >
                                            <option value="">Select a genre</option>
                                            {genres.map(genre => (
                                                <option key={genre} value={genre}>{genre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Price</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                                                $
                                            </span>
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleChange}
                                                onFocus={() => handleFocus('price')}
                                                onBlur={handleBlur}
                                                className={`block w-full rounded-lg border ${focused === 'price' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'} 
                                                          shadow-sm py-2.5 pl-8 pr-3.5 text-gray-900 placeholder-gray-400
                                                          focus:outline-none transition-all duration-200`}
                                                placeholder="0.00"
                                                required
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity</label>
                                        <input
                                            type="number"
                                            name="qte"
                                            value={formData.qte}
                                            onChange={handleChange}
                                            onFocus={() => handleFocus('qte')}
                                            onBlur={handleBlur}
                                            className={`block w-full rounded-lg border ${focused === 'qte' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'} 
                                                      shadow-sm py-2.5 px-3.5 text-gray-900 placeholder-gray-400
                                                      focus:outline-none transition-all duration-200`}
                                            placeholder="0"
                                            required
                                            min="0"
                                        />
                                    </div>
                                </div>
                                
                                {/* Enhanced file upload with preview */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Book Cover</label>
                                    <div className="mt-1 flex items-center space-x-4">
                                        <div className="flex-1">
                                            <label className={`w-full flex items-center px-4 py-3 bg-white rounded-lg border-2 border-dashed 
                                                          ${focused === 'image' ? 'border-blue-400 bg-blue-50' : 'border-gray-300'} 
                                                          cursor-pointer hover:bg-gray-50 transition-all duration-200`}>
                                                <Upload size={18} className="text-gray-400 mr-2" />
                                                <span className="text-sm font-medium text-blue-600">Upload image</span>
                                                <input
                                                    type="file"
                                                    name="image"
                                                    onChange={handleChange}
                                                    onFocus={() => handleFocus('image')}
                                                    onBlur={handleBlur}
                                                    className="hidden"
                                                    accept="image/*"
                                                />
                                                <span className="ml-2 text-xs text-gray-500 truncate flex-1">
                                                    {formData.image ? formData.image.name : "No file selected"}
                                                </span>
                                            </label>
                                        </div>
                                        
                                        {/* Image preview */}
                                        {preview && (
                                            <div className="w-16 h-16 relative rounded-md overflow-hidden border border-gray-200">
                                                <img 
                                                    src={preview} 
                                                    alt="Book cover preview" 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                </>
                            )}
                                {/* Catalog tab */}
                                {activeTab === 'catalog' && (
                                    <div className="space-y-5">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-medium text-gray-800">Book Catalog</h3>
                                        <div className="flex space-x-2">
                                            <span className="text-sm text-gray-500">
                                                {Array.isArray(formData.catalog) ? formData.catalog.length : 0} items
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Form-based catalog editor */}
                                    <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-medium text-gray-700">Table of Contents</h4>
                                            <button
                                                type="button"
                                                onClick={addCatalogItem}
                                                className="py-1 px-3 bg-blue-50 text-blue-600 text-sm rounded-md 
                                                          hover:bg-blue-100 transition-colors flex items-center gap-1"
                                            >
                                                <Plus size={14} />
                                                Add Item
                                            </button>
                                        </div>
                                        
                                        {!Array.isArray(formData.catalog) || formData.catalog.length === 0 ? (
                                            <div className="py-8 text-center text-gray-500">
                                                <p>No catalog items yet.</p>
                                                <p className="text-sm">Add your first chapter or section.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {formData.catalog.map((item, index) => (
                                                    <div key={index} className="flex items-center gap-2 bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                                                        <div className="flex-grow grid grid-cols-4 gap-2">
                                                            <input
                                                                type="text"
                                                                value={item.title || ''}
                                                                onChange={(e) => updateCatalogItem(index, 'title', e.target.value)}
                                                                placeholder="Chapter/Section Title"
                                                                className="col-span-3 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={item.page || ''}
                                                                onChange={(e) => updateCatalogItem(index, 'page', e.target.value)}
                                                                placeholder="Page #"
                                                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeCatalogItem(index)}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Raw JSON editor */}
                                    <div className="border rounded-lg p-4 bg-gray-50">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center">
                                                <FileJson size={18} className="text-blue-600 mr-2" />
                                                <h4 className="font-medium text-gray-700">Raw JSON</h4>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    try {
                                                        setJsonText(JSON.stringify(formData.catalog || [], null, 2));
                                                        setJsonError('');
                                                    } catch (e) {
                                                        setJsonError('Unable to format JSON');
                                                    }
                                                }}
                                                className="py-1 px-3 bg-gray-100 text-gray-600 text-sm rounded-md hover:bg-gray-200"
                                            >
                                                Refresh
                                            </button>
                                        </div>
                                        
                                        <textarea
                                            value={jsonText}
                                            onChange={handleJsonTextChange}
                                            rows={6}
                                            className={`w-full font-mono text-sm p-3 border rounded-md ${jsonError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                            placeholder="Enter valid JSON array for catalog"
                                        />
                                        
                                        {jsonError && (
                                            <div className="mt-2 text-sm text-red-500">
                                                {jsonError}
                                            </div>
                                        )}
                                        
                                        <div className="mt-2 text-xs text-gray-500">
                                            <p>Example format: <code>[{"{"}"title":"Chapter 1", "page": "1"{"}"}]</code></p>
                                        </div>
                                    </div>
                                </div>
                            )}       
                            
                            {/* Action buttons with enhanced styling */}
                            <div className="flex justify-end gap-3 pt-3 mt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 
                                              rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 
                                              transition-all duration-200 flex items-center"
                                >
                                    <X size={16} className="mr-1.5" />
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 
                                              hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-sm hover:shadow 
                                              transition-all duration-200 flex items-center"
                                >
                                    <Save size={16} className="mr-1.5" />
                                    {book ? 'Update Book' : 'Add Book'}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default BookFormModal;