import React, { useState } from "react";
import { Plus, Edit, Trash2, Search, BookOpen, AlertCircle, Loader2, Library, X, BookMarked, RefreshCw, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BookFormModal from "./bookFormModal";
import pb from "../../lib/pocketbase";
import useBook from "../../hooks/useBook";

// Example admin book list item component
const BookListItem = ({ book, onUpdate }) => {
    const [isFeatured, setIsFeatured] = useState(book.featured || false);

    const handleFeaturedToggle = async () => {
        try {
            const newFeaturedValue = !isFeatured;
            setIsFeatured(newFeaturedValue);

            // Update the book in the database
            await pb.collection('books').update(book.id, {
                featured: newFeaturedValue
            });

            // Notify parent component if needed
            if (onUpdate) {
                onUpdate(book.id, { featured: newFeaturedValue });
            }
        } catch (err) {
            console.error('Error updating featured status:', err);
            // Revert UI state if update fails
            setIsFeatured(isFeatured);
            alert('Failed to update book status');
        }
    };

    return (
        <div className="flex items-center justify-between p-4 border-b">
            <div>
                <h3 className="font-medium">{book.name}</h3>
                <p className="text-sm text-gray-600">{book.author}</p>
            </div>

            <div className="flex items-center space-x-4">
                {/* Featured toggle */}
                <div className="flex items-center">
                    <span className="text-sm mr-2">Featured</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isFeatured}
                            onChange={handleFeaturedToggle}
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 peer-focus:ring-blue-300 peer-focus:ring-2 transition-colors"></div>
                        <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </label>
                </div>

                {/* Other actions */}
                <button className="text-blue-600 hover:underline">Edit</button>
                <button className="text-red-600 hover:underline">Delete</button>
            </div>
        </div>
    );
};

const BooksManagement = () => {
    const { books, error, loading, fetchBooks } = useBook();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [featureLoading, setFeatureLoading] = useState(null);
    const [featuredFilter, setFeaturedFilter] = useState(false);

    const filteredBooks = books.filter(book => 
        (featuredFilter ? book.featured : true) && // Only show featured books if the filter is on
        (book.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         book.author.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleAddBook = async (formData) => {
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null) {
                    data.append(key, formData[key]);
                }
            });

            await pb.collection('Books').create(data);
            fetchBooks(); // Refresh books list
        } catch (error) {
            console.error('Error adding book:', error);
        }
    };

    const handleEditBook = async (formData) => {
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null) {
                    data.append(key, formData[key]);
                }
            });

            await pb.collection('Books').update(selectedBook.id, data);
            fetchBooks(); // Refresh books list
        } catch (error) {
            console.error('Error updating book:', error);
        }
    };

    const handleDeleteBook = async (bookId) => {
        if (window.confirm('Are you sure you want to delete this book?')) {
            try {
                setDeleteLoading(bookId);
                await pb.collection('Books').delete(bookId);
                fetchBooks(); // Refresh books list
            } catch (error) {
                console.error('Error deleting book:', error);
            } finally {
                setDeleteLoading(null);
            }
        }
    };

    const handleFeatureToggle = async (bookId, currentStatus) => {
        try {
            setFeatureLoading(bookId);
            const newStatus = !currentStatus;
            
            await pb.collection('Books').update(bookId, {
                featured: newStatus
            });
            
            // Update local state to reflect changes immediately
            fetchBooks();
        } catch (error) {
            console.error('Error toggling featured status:', error);
            alert('Failed to update featured status. Please try again.');
        } finally {
            setFeatureLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Enhanced header section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <div className="flex items-center">
                        <Library size={24} className="text-blue-600 mr-3" />
                        <h1 className="text-2xl font-bold text-gray-900">Books Management</h1>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => fetchBooks()}
                        className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </motion.button>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-80">
                        <input
                            type="text"
                            placeholder="Search by book title or author..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                        />
                        <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg 
                                hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow 
                                w-full sm:w-auto justify-center min-w-[160px]"
                    >
                        <Plus size={18} />
                        Add New Book
                    </motion.button>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setFeaturedFilter(!featuredFilter)}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                                featuredFilter 
                                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' 
                                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                        >
                            <Star size={16} className={featuredFilter ? "fill-yellow-500" : ""} />
                            Featured Only
                        </button>
                        
                        {featuredFilter && (
                            <button 
                                onClick={() => setFeaturedFilter(false)}
                                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                            >
                                <X size={14} />
                                Clear
                            </button>
                        )}
                    </div>
                    
                    {/* Your existing search input */}
                </div>

                {books.length > 0 && (
                    <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>
                            {filteredBooks.length === books.length
                                ? `Showing all ${books.length} books`
                                : `Found ${filteredBooks.length} of ${books.length} books`}
                            {searchQuery && <span> matching "{searchQuery}"</span>}
                        </span>
                    </div>
                )}
            </div>

            {/* Enhanced content section */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        key="loading"
                        className="flex flex-col justify-center items-center py-16 px-6 bg-white rounded-xl shadow-sm border border-gray-200"
                    >
                        <div className="relative">
                            <div className="h-16 w-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
                            <BookOpen size={24} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600" />
                        </div>
                        <p className="mt-4 text-gray-600 font-medium">Loading your library...</p>
                    </motion.div>
                ) : error ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        key="error"
                        className="flex flex-col items-center py-16 px-6 bg-red-50 rounded-xl border border-red-100 shadow-sm"
                    >
                        <div className="p-3 bg-white rounded-full shadow-md border border-red-100 mb-4">
                            <AlertCircle size={32} className="text-red-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-red-700 mb-2">We encountered an issue</h3>
                        <p className="text-red-600 text-center max-w-md mb-6">{error}</p>
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={fetchBooks}
                            className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2"
                        >
                            <RefreshCw size={16} />
                            Try Again
                        </motion.button>
                    </motion.div>
                ) : filteredBooks.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        key="empty"
                        className="flex flex-col items-center py-16 px-6 bg-white rounded-xl shadow-sm border border-gray-200"
                    >
                        <div className="p-4 bg-blue-50 rounded-full shadow-sm border border-blue-100 mb-4">
                            <BookMarked size={32} className="text-blue-600" />
                        </div>
                        {searchQuery ? (
                            <>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">No matching books found</h3>
                                <p className="text-gray-600 text-center max-w-md mb-6">
                                    We couldn't find any books matching "{searchQuery}"
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setSearchQuery('')}
                                    className="px-5 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
                                >
                                    <X size={16} />
                                    Clear Search
                                </motion.button>
                            </>
                        ) : (
                            <>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Your library is empty</h3>
                                <p className="text-gray-600 text-center max-w-md mb-6">
                                    Start building your collection by adding your first book
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg 
                                            hover:from-blue-700 hover:to-blue-800 transition-colors shadow-sm hover:shadow flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    Add Your First Book
                                </motion.button>
                            </>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        key="table"
                        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
                    >
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Book</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Author</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Genre</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Featured</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredBooks.map((book, index) => (
                                        <motion.tr
                                            key={book.id}
                                            className="hover:bg-blue-50 transition-colors"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2, delay: index * 0.05 }}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {/* Using the original image loading logic */}
                                                    <div className="h-14 w-12 rounded-md overflow-hidden shadow-sm border border-gray-200 flex-shrink-0 bg-gray-100">
                                                        <img
                                                            src={book.imageUrl || '/placeholder.png'}
                                                            alt={book.name}
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => {
                                                                e.target.src = '/placeholder.png';
                                                                e.target.classList.add('opacity-50');
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{book.name}</div>
                                                        {book.description && (
                                                            <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">{book.description}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-700">{book.author}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {book.genre && (
                                                    <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 inline-flex items-center">
                                                        {book.genre}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-900 font-medium">${parseFloat(book.price).toFixed(2)}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {parseInt(book.qte) < 10 ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                        Low Stock: {book.qte}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        In Stock: {book.qte}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleFeatureToggle(book.id, book.featured)}
                                                    disabled={featureLoading === book.id}
                                                    className={`p-2 rounded-full ${
                                                        book.featured 
                                                            ? 'bg-yellow-100 text-yellow-600' 
                                                            : 'bg-gray-100 text-gray-400'
                                                    } hover:bg-yellow-200 transition-colors`}
                                                    title={book.featured ? "Remove from featured" : "Add to featured"}
                                                >
                                                    {featureLoading === book.id ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        <Star size={18} className={book.featured ? "fill-yellow-500" : ""} />
                                                    )}
                                                </motion.button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex justify-end items-center space-x-3">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => {
                                                            setSelectedBook(book);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors shadow-sm"
                                                        aria-label={`Edit ${book.name}`}
                                                        title="Edit book"
                                                    >
                                                        <Edit size={16} />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleDeleteBook(book.id)}
                                                        disabled={deleteLoading === book.id}
                                                        className={`p-2 ${
                                                            deleteLoading === book.id
                                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                : 'bg-red-50 hover:bg-red-100 text-red-600'
                                                        } rounded-lg transition-colors shadow-sm`}
                                                        aria-label={`Delete ${book.name}`}
                                                        title="Delete book"
                                                    >
                                                        {deleteLoading === book.id ? (
                                                            <Loader2 size={16} className="animate-spin" />
                                                        ) : (
                                                            <Trash2 size={16} />
                                                        )}
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Enhanced footer with better layout */}
                        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 flex justify-between items-center">
                            <p className="text-sm text-gray-500">
                                Showing {filteredBooks.length} of {books.length} books
                            </p>
                            {searchQuery && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSearchQuery('')}
                                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                                >
                                    <X size={14} />
                                    Clear search
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <BookFormModal
                        onClose={() => setIsAddModalOpen(false)}
                        onSubmit={handleAddBook}
                        title="Add New Book"
                    />
                )}

                {isEditModalOpen && selectedBook && (
                    <BookFormModal
                        book={selectedBook}
                        onClose={() => {
                            setIsEditModalOpen(false);
                            setSelectedBook(null);
                        }}
                        onSubmit={handleEditBook}
                        title="Edit Book"
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default BooksManagement;