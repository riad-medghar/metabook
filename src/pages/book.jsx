import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronUp, ChevronDown, ShoppingCart, BookOpen, AlertCircle, BookText, BookMarked } from 'lucide-react';
import useCart from '../hooks/useCart';
import pb from '../lib/pocketbase';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion'; // If available in your project

const BookDetails = () => {
  // Existing state
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart, loading: ld_cart } = useCart();
  const { t } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // New state for tab switching
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    if (!id) {
      setBook(null);
      setError(t('errors.noBookId', 'No book ID provided'));
      return;
    }

    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const fetchedBook = await pb.collection('Books').getOne(id);
        
        // Format book data - add catalog to the formatted book
        const formattedBook = {
          id: fetchedBook.id,
          name: fetchedBook.name,
          price: Number(fetchedBook.price),
          author: fetchedBook.author,
          genre: fetchedBook.genre,
          description: fetchedBook.description,
          catalog: fetchedBook.catalog || [], // Add catalog field (might be empty)
          qte: Number(fetchedBook.qte),
          imageUrl: fetchedBook.image ? pb.files.getURL(fetchedBook, fetchedBook.image) : null
        };

        setBook(formattedBook);
        setError(null);
      } catch (err) {
        console.error('Error fetching book details:', err);
        setError(t('errors.failedToLoad', 'Failed to load book details'));
        setBook(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id, t]);

  const handleAddToCart = async () => {
    if (!book) return;

    try {
      const bookToAdd = {
        id: book.id,
        name: book.name,
        price: Number(book.price),
        imageUrl: book.imageUrl,
        author: book.author,
        genre: book.genre,
        description: book.description
      };

      await addToCart(bookToAdd, quantity);
      
      // Replace alert with toast if available
      if (typeof toast !== 'undefined') {
        toast.success(t('cart.itemAdded', 'Item added to cart'));
      } else {
        alert(t('cart.itemAdded', 'Item added to cart'));
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      
      // Replace alert with toast if available
      if (typeof toast !== 'undefined') {
        toast.error(t('cart.addError', 'Failed to add item to cart. Please try again later.'));
      } else {
        alert(t('cart.addError', 'Failed to add item to cart. Please try again later.'));
      }
    }
  };

  const incrementQuantity = () => {
    if (book) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    setQuantity(prev => prev > 1 ? prev - 1 : 1);
  };
  
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if(!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const MotionDiv = typeof motion !== 'undefined' ? motion.div : 'div';

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex flex-col justify-center items-center bg-gray-50 px-4">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-blue-200 animate-spin"></div>
          <div className="absolute inset-3 rounded-full border-2 border-t-blue-400 border-blue-100 animate-spin-slow"></div>
        </div>
        <span className="mt-4 text-gray-600 font-medium">{t('common.loading', 'Loading...')}</span>
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

  if (!book) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex flex-col justify-center items-center bg-gray-50 px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="flex justify-center mb-4">
            <BookOpen size={48} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('book.notFound', 'Book not found')}</h2>
          <p className="text-gray-600">{t('book.notFoundDesc', 'We couldn\'t find the book you\'re looking for.')}</p>
        </div>
      </div>
    );
  }

  return (
    <MotionDiv 
      className="max-w-6xl mx-auto px-4 py-8 md:py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Book Image */}
          <div className="relative flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-blue-50">
            <div 
              className={`
                w-full aspect-[3/4] max-w-md mx-auto relative overflow-hidden rounded-lg
                transition-all duration-300 shadow-lg hover:shadow-xl
                ${imageLoaded ? 'opacity-100' : 'opacity-0'}
              `}
            >
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm"></div>
              <img
                src={book.imageUrl}
                alt={book.name}
                className="absolute inset-0 w-full h-full object-contain transition-transform duration-500 hover:scale-105"
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300';
                  setImageLoaded(true);
                }}
              />
            </div>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Book Details */}
          <div className="p-6 md:p-10 bg-white space-y-6">
            <div className="border-b border-gray-100 pb-6">
              <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-800">{book.name}</h1>
              <p className="text-lg text-gray-600 mb-4 italic">
                {t('book.author', {author: book.author}, 'by {{author}}')}
              </p>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(book.genre) ? book.genre.map((g, idx) => (
                  <span key={idx} className="inline-block bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium border border-blue-100">
                    {g}
                  </span>
                )) : (
                  <span className="inline-block bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium border border-blue-100">
                    {book.genre}
                  </span>
                )}
              </div>
            </div>

            {/* Tab switcher */}
            <div className="flex border-b border-gray-200">
              <button
                className={`px-4 py-2 font-medium flex items-center gap-2 ${
                  activeTab === 'description'
                    ? 'text-blue-600 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('description')}
              >
                <BookOpen size={18} />
                {t('book.description', 'Description')}
              </button>
              <button
                className={`px-4 py-2 font-medium flex items-center gap-2 ${
                  activeTab === 'catalog'
                    ? 'text-blue-600 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('catalog')}
              >
                <BookText size={18} />
                {t('book.catalog', 'Catalog')}
              </button>
            </div>

            {/* Description tab content */}
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed text-base">
                  {book.description || t('common.noDescription', 'No description available')}
                </p>
              </div>
            )}

            {/* Catalog tab content */}
            {activeTab === 'catalog' && (
              <div className="prose max-w-none">
                {book.catalog && book.catalog.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg text-gray-800">{t('book.tableOfContents', 'Table of Contents')}</h3>
                    <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      <ul className="space-y-2 list-disc pl-5">
                        {book.catalog.map((item, index) => (
                          <li key={index} className="text-gray-600">
                            {item.title} 
                            {item.page && <span className="text-gray-400 ml-2">({t('book.page', 'Page')} {item.page})</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <BookMarked className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>{t('book.noCatalog', 'No catalog information available for this book')}</p>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-gray-100 pt-6 space-y-5">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                {book.price} {t('common.currency', 'DZD')}
              </div>

              {book.qte < 1 && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {t('book.outOfStock', 'This book is currently out of stock')}
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <span className="font-medium text-gray-700">{t('common.quantity', 'Quantity')}:</span>
                <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={decrementQuantity}
                    className="p-2.5 hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                  <input type="number"
                    min='1'
                    value={quantity}
                    onChange={handleQuantityChange}
                    className='w-16 text-center border-0 focus:ring-0 focus:outline-none text-lg font-medium'
                  />
                  <button
                    onClick={incrementQuantity}
                    className="p-2.5 hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={ld_cart || !book || book.qte < 1}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium 
                  rounded-lg flex items-center justify-center gap-3 transition-all duration-300
                  shadow-md hover:shadow-lg transform hover:-translate-y-0.5
                  disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>
                  {ld_cart 
                    ? t('common.addingToCart', 'Adding to Cart...') 
                    : book.qte < 1 
                      ? t('common.outOfStock', 'Out of Stock') 
                      : t('common.addToCart', 'Add to Cart')}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
};

export default BookDetails;