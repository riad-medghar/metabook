import React, { useState } from 'react';
import { Plus, X, MoveUp, MoveDown, List } from 'lucide-react';
import { motion } from 'framer-motion';

const BookCatalogEditor = ({ catalog = [], onChange }) => {
  const [catalogItems, setCatalogItems] = useState(catalog || []);

  const addCatalogItem = () => {
    const newItems = [...catalogItems, { title: '', page: '' }];
    setCatalogItems(newItems);
    onChange(newItems);
  };

  const updateCatalogItem = (index, field, value) => {
    const updatedCatalog = [...catalogItems];
    updatedCatalog[index] = {
      ...updatedCatalog[index],
      [field]: value
    };
    setCatalogItems(updatedCatalog);
    onChange(updatedCatalog);
  };

  const removeCatalogItem = (index) => {
    const updatedCatalog = catalogItems.filter((_, i) => i !== index);
    setCatalogItems(updatedCatalog);
    onChange(updatedCatalog);
  };

  const moveItem = (index, direction) => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === catalogItems.length - 1)) {
      return;
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedCatalog = [...catalogItems];
    const temp = updatedCatalog[index];
    updatedCatalog[index] = updatedCatalog[newIndex];
    updatedCatalog[newIndex] = temp;
    
    setCatalogItems(updatedCatalog);
    onChange(updatedCatalog);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <List size={20} className="text-blue-600" />
          Book Catalog / Table of Contents
        </h3>
        <span className="text-sm text-gray-500">{catalogItems.length} items</span>
      </div>
      
      {catalogItems.length === 0 ? (
        <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-6 rounded-lg text-center">
          <p className="text-sm">No catalog items yet. Add chapters or sections to create a table of contents.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {catalogItems.map((item, index) => (
            <motion.div 
              key={index} 
              className="flex items-center gap-2 bg-white p-3 rounded-md shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col space-y-1">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button" 
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                >
                  <MoveUp size={16} />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button" 
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === catalogItems.length - 1}
                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                >
                  <MoveDown size={16} />
                </motion.button>
              </div>
              
              <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-3">
                  <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) => updateCatalogItem(index, 'title', e.target.value)}
                    placeholder="Chapter or section title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={item.page || ''}
                    onChange={(e) => updateCatalogItem(index, 'page', e.target.value)}
                    placeholder="Page #"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.1, backgroundColor: '#FEE2E2' }}
                whileTap={{ scale: 0.9 }}
                type="button" 
                onClick={() => removeCatalogItem(index)}
                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
              >
                <X size={16} />
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}
      
      <motion.button
        whileHover={{ scale: 1.01, borderColor: '#93C5FD' }}
        whileTap={{ scale: 0.99 }}
        type="button"
        onClick={addCatalogItem}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-md 
                 text-gray-600 hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50
                 flex items-center justify-center gap-2 transition-colors mt-4"
      >
        <Plus size={18} />
        Add Catalog Item
      </motion.button>
    </div>
  );
};

export default BookCatalogEditor;