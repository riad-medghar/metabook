import React, { useState, useEffect } from 'react';
import { Download, Search, Filter, Trash2, RefreshCw, Book, FileText, ShoppingBag, AlertCircle, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import pb from '../../lib/pocketbase';

const OrdersManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date-desc');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setUpdating(true);
            const records = await pb.collection('Orders').getFullList({
                sort: '-created',
            });
            setOrders(records);
            setError(null);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Failed to load orders');
            setLoading(false);
        } finally {
            setUpdating(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            setUpdating(true);
            await pb.collection('Orders').update(orderId, {
                status: newStatus,
                updated: new Date().toISOString()
            });
            await fetchOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status');
            setUpdating(false);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            try {
                setUpdating(true);
                await pb.collection('Orders').delete(orderId);
                await fetchOrders();
            } catch (error) {
                console.error('Error deleting order:', error);
                alert('Failed to delete order');
                setUpdating(false);
            }
        }
    };

    const downloadFile = (order, fileField) => {
        const fileUrl = pb.files.getURL(order, order[fileField]);
        window.open(fileUrl, '_blank');
    };

    const getFilteredAndSortedOrders = () => {
        return orders
            .filter(order => {
                // Search filter
                const searchMatches = 
                    (order.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    order.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    order.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    order.id.toLowerCase().includes(searchQuery.toLowerCase()));

                // Status filter
                const statusMatches = statusFilter === 'all' || order.status === statusFilter;

                // Date filter
                if (dateFilter === 'all') return searchMatches && statusMatches;

                const orderDate = new Date(order.created);
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);

                switch(dateFilter) {
                    case 'today':
                        return searchMatches && statusMatches && 
                            orderDate.toDateString() === today.toDateString();
                    case 'yesterday':
                        return searchMatches && statusMatches && 
                            orderDate.toDateString() === yesterday.toDateString();
                    case 'week':
                        const weekAgo = new Date(today.setDate(today.getDate() - 7));
                        return searchMatches && statusMatches && orderDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
                        return searchMatches && statusMatches && orderDate >= monthAgo;
                    default:
                        return searchMatches && statusMatches;
                }
            })
            .sort((a, b) => {
                switch(sortBy) {
                    case 'date-asc':
                        return new Date(a.created) - new Date(b.created);
                    case 'date-desc':
                        return new Date(b.created) - new Date(a.created);
                    default:
                        return 0;
                }
            });
    };

    // Format date nicely
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { 
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date);
    };

    // Get status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
            case 'confirmed':
                return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Confirmed</span>;
            case 'processing':
                return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">Processing</span>;
            case 'completed':
                return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Completed</span>;
            case 'cancelled':
                return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Cancelled</span>;
            default:
                return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    // Render loading state
    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 p-8">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600 font-medium">Loading orders...</p>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="p-8 bg-red-50 text-red-600 rounded-xl border border-red-100 shadow-sm flex flex-col items-center">
                <AlertCircle size={40} className="mb-3" />
                <p className="font-medium text-center mb-4">{error}</p>
                <button 
                    onClick={fetchOrders}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm"
                >
                    Retry
                </button>
            </div>
        );
    }

    const filteredOrders = getFilteredAndSortedOrders();

    return (
        <div className="space-y-6">
            {/* Header section with dashboard design */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <div className="flex items-center">
                        <ShoppingBag size={24} className="text-blue-600 mr-3" />
                        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={fetchOrders}
                        className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg 
                                hover:from-blue-700 hover:to-blue-800 transition-colors shadow-sm 
                                flex items-center gap-2 disabled:opacity-50 min-w-[140px] justify-center"
                        disabled={updating}
                    >
                        <RefreshCw size={16} className={updating ? "animate-spin" : ""} />
                        {updating ? 'Refreshing...' : 'Refresh Orders'}
                    </motion.button>
                </div>

                {/* Search bar and filter toggle */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Search by name, email, status or order ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg 
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 
                                    focus:border-blue-500 transition-all shadow-sm"
                        />
                        <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-2.5 border rounded-lg flex items-center gap-2 transition-colors
                                    ${showFilters 
                                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    >
                        <Filter size={16} />
                        Filters
                        <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Filter controls */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pt-2 border-t border-gray-100">
                                {/* Status filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                                                focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                transition-all shadow-sm bg-white"
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="processing">Processing</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>

                                {/* Date filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
                                    <select
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                                                focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                transition-all shadow-sm bg-white"
                                    >
                                        <option value="all">All Time</option>
                                        <option value="today">Today</option>
                                        <option value="yesterday">Yesterday</option>
                                        <option value="week">Last 7 Days</option>
                                        <option value="month">Last 30 Days</option>
                                    </select>
                                </div>

                                {/* Sort options */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                                                focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                transition-all shadow-sm bg-white"
                                    >
                                        <option value="date-desc">Newest First</option>
                                        <option value="date-asc">Oldest First</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results count */}
                <div className="text-sm text-gray-500 pt-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Found <span className="font-medium">{filteredOrders.length}</span> orders
                    {statusFilter !== 'all' && (
                        <> with status <span className="font-medium">{statusFilter}</span></>
                    )}
                    {searchQuery && (
                        <> matching "<span className="font-medium">{searchQuery}</span>"</>
                    )}
                </div>
            </div>

            {/* Orders Table */}
            {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-4">
                        <ShoppingBag size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
                    <p className="text-gray-500 mb-4">
                        {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                            ? "Try adjusting your filters to find what you're looking for."
                            : "There are no orders in the system yet."}
                    </p>
                    {(searchQuery || statusFilter !== 'all' || dateFilter !== 'all') && (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setStatusFilter('all');
                                setDateFilter('all');
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Files</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order, index) => (
                                    <motion.tr 
                                        key={order.id} 
                                        className="hover:bg-gray-50"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2, delay: index * 0.05 }}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{order.name} {order.surname}</div>
                                            <div className="text-sm text-gray-500 truncate max-w-[200px]">{order.address}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{order.email}</div>
                                            <div className="text-sm text-gray-500">{order.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-3">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => downloadFile(order, 'bookFile')}
                                                    className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1.5 text-sm border border-blue-200 bg-blue-50 px-3 py-1 rounded-lg"
                                                    title="Download Book File"
                                                >
                                                    <Book size={14} />
                                                    Book
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => downloadFile(order, 'coverFile')}
                                                    className="text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-1.5 text-sm border border-purple-200 bg-purple-50 px-3 py-1 rounded-lg"
                                                    title="Download Cover File"
                                                >
                                                    <FileText size={14} />
                                                    Cover
                                                </motion.button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{order.quantity}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={order.status || 'pending'}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                className={`text-sm rounded-full px-3 py-1 font-medium border-0 focus:ring-2 focus:ring-offset-1 focus:outline-none
                                                    ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 focus:ring-yellow-400' : 
                                                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-800 focus:ring-blue-400' :
                                                      order.status === 'processing' ? 'bg-purple-100 text-purple-800 focus:ring-purple-400' :
                                                      order.status === 'completed' ? 'bg-green-100 text-green-800 focus:ring-green-400' :
                                                      'bg-red-100 text-red-800 focus:ring-red-400'}`}
                                                disabled={updating}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="processing">Processing</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {formatDate(order.created)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleDeleteOrder(order.id)}
                                                className="text-red-600 hover:text-red-900 transition-colors p-1.5 hover:bg-red-50 rounded-full"
                                                title="Delete Order"
                                                disabled={updating}
                                            >
                                                <Trash2 size={16} />
                                            </motion.button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination placeholder - can be implemented if needed */}
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            {/* Mobile pagination controls would go here */}
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{filteredOrders.length}</span> orders
                                </p>
                            </div>
                            {/* Desktop pagination controls would go here */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersManagement;