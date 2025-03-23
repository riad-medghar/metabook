import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Settings, ChevronDown, ChevronUp, BookOpen, X, Tag, DollarSign, Grid, List } from 'lucide-react';
import useBook from '../hooks/useBook';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import FloatingCartButton from '../components/cart/FloatingCartButton';

// Enhanced animation variants
const filterPanelVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
};

const bookCardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
        opacity: 1, 
        scale: 1,
        transition: { duration: 0.4, ease: "easeOut" }
    },
    hover: {
        scale: 1.03,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        transition: { duration: 0.2 }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.2 }
    }
};

// Update the genre normalization helper
const normalizeGenre = (genre) => {
    if (!genre) return [];
    if (Array.isArray(genre)) {
        return genre.map(g => g.trim());
    }
    return [genre.trim()];
};

const Catalog = () => {
    const { t } = useTranslation();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
    const [maxBookPrice, setMaxBookPrice] = useState(1000);
    const [activeGenres, setActiveGenres] = useState([]);
    const [viewStyle, setViewStyle] = useState('grid');
    const navigate = useNavigate();
    const { books, error, loading } = useBook();

    // Extract unique genres from books
    useEffect(() => {
        if (!books || books.length === 0) return;

        const genreSet = new Set();
        books.forEach(book => {
            if (book.genre) {
                const genres = Array.isArray(book.genre) ? book.genre : [book.genre];
                genres.forEach(g => {
                    if (typeof g === 'string' && g.trim()) {
                        genreSet.add(g.trim());
                    }
                });
            }
        });

        const sortedGenres = Array.from(genreSet)
            .map(genre => genre.charAt(0).toUpperCase() + genre.slice(1).toLowerCase())
            .sort();

        setActiveGenres(sortedGenres);
    }, [books]);

    // Calculate max price when books are loaded
    useEffect(() => {
        if (books && books.length > 0) {
            const prices = books.map(book => Number(book.price) || 0);
            const highestPrice = Math.max(...prices);
            const roundedMax = Math.ceil(highestPrice / 100) * 100;
            setMaxBookPrice(roundedMax);
            setPriceRange(prev => ({ ...prev, max: roundedMax }));
        }
    }, [books]);

    // Toggle genre filter
    const toggleGenre = (genre) => {
        setSelectedGenres(prev => {
            const isSelected = prev.includes(genre);
            return isSelected ? prev.filter(g => g !== genre) : [...prev, genre];
        });
    };

    // Filtered books based on search, genre, and price
    const filteredBooks = useMemo(() => {
        if (!books) return [];
        
        return books.filter(book => {
            const bookName = book.name?.toLowerCase() || '';
            const bookAuthor = book.author?.toLowerCase() || '';
            const searchLower = searchQuery.toLowerCase();
            
            const matchesSearch = 
                bookName.includes(searchLower) ||
                bookAuthor.includes(searchLower);
            
            const bookGenres = normalizeGenre(book.genre);
            const matchesGenre = 
                selectedGenres.length === 0 || 
                selectedGenres.some(selected => 
                    bookGenres.some(bookGenre => 
                        bookGenre.toLowerCase() === selected.toLowerCase()
                    )
                );
            
            const bookPrice = Number(book.price) || 0;
            const matchesPrice = 
                bookPrice >= priceRange.min && 
                bookPrice <= priceRange.max;
            
            return matchesSearch && matchesGenre && matchesPrice;
        });
    }, [books, searchQuery, selectedGenres, priceRange]);

    const handleBookClick = (book) => {
        navigate(`/book/${book.id}`);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            {/* Page Header */}
            <FloatingCartButton/>
            <motion.h1 
                className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {t('catalog.title', 'Book Catalog')}
            </motion.h1>

            {/* Search and Filter Bar */}
            <motion.div 
                className="mb-8 bg-white rounded-xl shadow-md p-5 backdrop-blur"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <motion.div 
                        className="flex-1 relative"
                        initial={false}
                        whileHover={{ scale: 1.01 }}
                    >
                        <motion.input
                            type="text"
                            placeholder={t('common.search', 'Search books...')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-700"
                            whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)" }}
                        />
                        <motion.span 
                            className="absolute left-4 top-3.5 text-gray-400"
                            whileHover={{ scale: 1.1 }}
                        >
                            <Search size={20} />
                        </motion.span>
                    </motion.div>
                    
                    <div className="flex gap-3">
                        <div className="flex bg-gray-100 rounded-lg overflow-hidden">
                            <motion.button
                                onClick={() => setViewStyle('grid')}
                                className={`flex items-center justify-center w-12 h-12 ${viewStyle === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
                                whileHover={{ backgroundColor: viewStyle === 'grid' ? '#3b82f6' : '#e5e7eb' }}
                                whileTap={{ scale: 0.95 }}
                                title={t('common.gridView', 'Grid View')}
                            >
                                <Grid size={18} />
                            </motion.button>
                            <motion.button
                                onClick={() => setViewStyle('list')}
                                className={`flex items-center justify-center w-12 h-12 ${viewStyle === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
                                whileHover={{ backgroundColor: viewStyle === 'list' ? '#3b82f6' : '#e5e7eb' }}
                                whileTap={{ scale: 0.95 }}
                                title={t('common.listView', 'List View')}
                            >
                                <List size={18} />
                            </motion.button>
                        </div>
                        
                        <motion.button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-5 py-3 ${isFilterOpen ? 'bg-indigo-600' : 'bg-blue-500'} text-white rounded-lg hover:shadow-lg transition-all`}
                            whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isFilterOpen ? <X size={18} /> : <Settings size={18} />}
                            <span className="font-medium">{t('common.filters', 'Filters')}</span>
                            {isFilterOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </motion.button>
                    </div>
                </div>

                {/* Filter Panel */}
                <AnimatePresence>
                    {isFilterOpen && (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={filterPanelVariants}
                            className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-4 space-y-6"
                        >
                            <div>
                                <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                                    <Tag size={18} className="mr-2 text-blue-500" />
                                    {t('catalog.genres', 'Genres')}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {activeGenres.map(genre => (
                                        <motion.button
                                            key={genre}
                                            onClick={() => toggleGenre(genre)}
                                            className={`px-3 py-2 rounded-full transition-all ${
                                                selectedGenres.includes(genre)
                                                    ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md'
                                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {genre}
                                            {selectedGenres.includes(genre) && 
                                                <span className="ml-2 font-bold">✕</span>
                                            }
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                                    <DollarSign size={18} className="mr-2 text-blue-500" />
                                    {t('catalog.priceRange', 'Price Range')}
                                </h3>
                                <div className="flex flex-col gap-3">
                                    <div className="flex gap-4 items-center">
                                        <input
                                            type="range"
                                            min="0"
                                            max={maxBookPrice}
                                            value={priceRange.max}
                                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))} 
                                            className="flex-1 h-2 appearance-none rounded-lg bg-gray-300 accent-blue-500"
                                        />
                                        <span className="text-gray-700 font-medium min-w-16 bg-white px-3 py-1 rounded-lg border shadow-sm text-center">
                                            0 - {priceRange.max} {t('common.currency', 'DZD')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <motion.button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedGenres([]);
                                        setPriceRange({ min: 0, max: maxBookPrice });
                                    }}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium flex items-center gap-2"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <X size={16} />
                                    {t('catalog.resetFilters', 'Reset Filters')}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Results Counter */}
            {!loading && !error && (
                <motion.div 
                    className=" text-gray-600   rounded-lg "
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="flex items-center ">
                       
                        {selectedGenres.length > 0 && (
                            <span> {t('catalog.inGenres', 'in genres')}: 
                                {selectedGenres.map((genre, i) => (
                                    <span key={genre} className="font-medium text-blue-600 mx-1">
                                        {i > 0 ? ', ' : ''}{genre}
                                    </span>
                                ))}
                            </span>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Book Grid */}
            {error ? (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-center p-12 bg-white rounded-lg shadow-md"
                >
                    <span className="text-xl">😕 {error}</span>
                </motion.div>
            ) : loading ? (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col justify-center items-center p-20"
                >
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-medium">{t('common.loading', 'Loading books...')}</p>
                </motion.div>
            ) : (
                <motion.div 
                    className={`grid gap-6 ${
                        viewStyle === 'grid' 
                            ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                            : 'grid-cols-1'
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <AnimatePresence>
                        {filteredBooks.map((book, index) => (
                            <motion.div 
                                key={book.id}
                                layout
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                whileHover="hover"
                                variants={bookCardVariants}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleBookClick(book)}
                                className={`
                                    bg-white rounded-xl shadow-md overflow-hidden cursor-pointer
                                    border border-gray-100 hover:border-blue-300
                                    ${viewStyle === 'list' ? 'flex' : ''}
                                `}
                            >
                                <motion.div 
                                    className={`relative ${viewStyle === 'list' ? 'w-1/3' : 'w-full'}`}
                                    whileHover={{ filter: 'brightness(1.05)' }}
                                >
                                    <motion.img
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.3 }}
                                        src={book.imageUrl}
                                        alt={book.name}
                                        className="w-full h-40 sm:h-52 md:h-60 lg:h-64 object-cover"
                                    />
                                    
                                    <motion.div 
                                        className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-bold shadow-md"
                                        whileHover={{ scale: 1.1 }}
                                    >
                                        <span className="text-blue-600">
                                            {book.price} {t('common.currency', 'DZD')}
                                        </span>
                                    </motion.div>
                                </motion.div>
                                
                                <div className={`p-4 ${viewStyle === 'list' ? 'w-2/3' : ''}`}>
                                    <motion.h3 
                                        className="text-base sm:text-lg font-bold mb-1.5 text-gray-800"
                                        whileHover={{ color: '#3b82f6' }}
                                    >
                                        {book.name}
                                    </motion.h3>
                                    <p className="text-sm text-gray-600 mb-3 italic">{t('book.author', {author: book.author}, 'by {{author}}')}</p>
                                    
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {normalizeGenre(book.genre).map(g => (
                                            <span 
                                                key={g} 
                                                className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100"
                                            >
                                                {g}
                                            </span>
                                        ))}
                                    </div>
                                    
                                    {viewStyle === 'list' && (
                                        <p className="text-sm text-gray-500 mt-2 mb-4 line-clamp-2">
                                            {book.description || t('catalog.exploreBook', 'Explore this book to discover more.')}
                                        </p>
                                    )}
                                    
                                    <motion.button 
                                        className="mt-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
                                        whileHover={{ scale: 1.05, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                                    >
                                        {t('common.viewDetails', 'View Details')}
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
            
            {/* No results message */}
            {!loading && !error && filteredBooks.length === 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center p-12 bg-white rounded-xl shadow-md mt-8"
                >
                    <div className="text-gray-400 text-5xl mb-4">🔍</div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-800">{t('catalog.noBooks', 'No books found')}</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">{t('catalog.adjustFilters', 'Try adjusting your filters or search query')}</p>
                    <motion.button
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedGenres([]);
                            setPriceRange({ min: 0, max: maxBookPrice });
                        }}
                        className="px-6 py-2.5 rounded-lg font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors shadow-md"
                        whileHover={{ scale: 1.05, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                    >
                        {t('catalog.resetFilters', 'Reset Filters')}
                    </motion.button>
                </motion.div>
           
            )}
        </div>
    );
};

export default Catalog;