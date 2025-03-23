import React, { useState, useEffect } from 'react';
import { Search, Trash2, RefreshCw, ShoppingBag, AlertCircle, CheckCircle, Clock, Filter, ChevronDown , X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import cartOrdersService from '../../services/cartOrdersService';

function CartOrdersManagement() {
    // State management
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);
    
    // Filter and sort state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date-desc');
    const [showFilters, setShowFilters] = useState(false);

    // Load orders on component mount
    useEffect(() => {
        loadOrders();
    }, []);

    // Function to load orders
    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await cartOrdersService.fetchOrders();
            setOrders(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    // Function to handle order status update
    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            setUpdating(true);
            await cartOrdersService.updateOrderStatus(orderId, newStatus);
            await loadOrders(); // Refresh the orders list
        } catch (err) {
            setError(err.message || 'Failed to update order status');
        } finally {
            setUpdating(false);
        }
    };

    // Function to handle order deletion
    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to delete this order?')) {
            return;
        }

        try {
            setUpdating(true);
            await cartOrdersService.deleteOrder(orderId);
            await loadOrders(); // Refresh the orders list
        } catch (err) {
            setError(err.message || 'Failed to delete order');
        } finally {
            setUpdating(false);
        }
    };

    // Filter and sort orders based on user selections
    const getFilteredAndSortedOrders = () => {
        return orders
            .filter(order => {
                const searchMatches = 
                    order.customerInfo?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    order.customerInfo?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    order.id.toLowerCase().includes(searchQuery.toLowerCase());

                const statusMatches = statusFilter === 'all' || order.status === statusFilter;

                if (!dateFilter || dateFilter === 'all') return searchMatches && statusMatches;

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
                    case 'total-asc':
                        return (a.ordre?.total || 0) - (b.ordre?.total || 0);
                    case 'total-desc':
                        return (b.ordre?.total || 0) - (a.ordre?.total || 0);
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
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // Get status badge styling
    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle size={12} className="mr-1" />
                        Completed
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock size={12} className="mr-1" />
                        Pending
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {status || 'Unknown'}
                    </span>
                );
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
                    onClick={loadOrders}
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
            {/* Header section with dashboard-like design */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <div className="flex items-center">
                        <ShoppingBag size={24} className="text-blue-600 mr-3" />
                        <h1 className="text-2xl font-bold text-gray-900">Cart Orders Management</h1>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={loadOrders}
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
                            placeholder="Search by customer name, email or order ID..."
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
                                        <option value="completed">Completed</option>
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
                                        <option value="total-desc">Highest Total</option>
                                        <option value="total-asc">Lowest Total</option>
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

            {/* Empty state */}
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
                // Orders list with animation
                <div className="space-y-6">
                    {filteredOrders.map((order) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`bg-white shadow-md rounded-xl overflow-hidden border
                                ${order.status === 'completed' ? 'border-l-4 border-green-500' : 'border-l-4 border-yellow-500'}`}
                        >
                            {/* Order header */}
                            <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                    <div className="text-xs text-gray-500">ORDER ID</div>
                                    <div className="font-mono text-sm text-gray-700 font-medium">{order.id}</div>
                                    <div className="text-gray-300">|</div>
                                    <div className="text-xs text-gray-500">PLACED ON</div>
                                    <div className="text-sm text-gray-700">{formatDate(order.created)}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {getStatusBadge(order.status)}
                                    <button
                                        onClick={() => handleDeleteOrder(order.id)}
                                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md 
                                                transition-colors disabled:opacity-50"
                                        disabled={updating}
                                        aria-label="Delete order"
                                        title="Delete order"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Order details */}
                                    <div>
                                        <h3 className="font-bold text-lg mb-4 flex items-center">
                                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs mr-2">1</span>
                                            Order Details
                                        </h3>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <div className="flex justify-between mb-3">
                                                <span className="text-gray-600">Order Status:</span>
                                                <div>
                                                    <select
                                                        value={order.status || 'pending'}
                                                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                        className={`text-sm rounded-lg border px-2 py-1
                                                                  ${order.status === 'completed' 
                                                                    ? 'bg-green-50 border-green-200 text-green-800' 
                                                                    : 'bg-yellow-50 border-yellow-200 text-yellow-800'}
                                                                  focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm
                                                                  transition-all disabled:opacity-75`}
                                                        disabled={updating}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="completed">Completed</option>
                                                    </select>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="flex flex-col border-t border-gray-200 pt-2 mb-2">
                                                    <span className="text-gray-500 text-xs">Subtotal</span>
                                                    <span className="font-medium">${order.ordre?.total || order.total}</span>
                                                </div>
                                                <div className="flex flex-col border-t border-gray-200 pt-2 mb-2">
                                                    <span className="text-gray-500 text-xs">Items</span>
                                                    <span className="font-medium">{order.ordre?.items?.length || 0}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="border-t border-gray-200 pt-2 mt-2">
                                                <div className="flex justify-between items-center text-lg">
                                                    <span className="font-medium">Total</span>
                                                    <span className="font-bold text-blue-700">${order.ordre?.total || order.total}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customer Information */}
                                    {order.customerInfo && (
                                        <div>
                                            <h3 className="font-bold text-lg mb-4 flex items-center">
                                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs mr-2">2</span>
                                                Customer Information
                                            </h3>
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Contact</p>
                                                        <p className="text-sm font-medium mb-1">{order.customerInfo.fullName}</p>
                                                        <p className="text-sm text-gray-600 mb-1">{order.customerInfo.email}</p>
                                                        <p className="text-sm text-gray-600">{order.customerInfo.phone}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Shipping Address</p>
                                                        <p className="text-sm">{order.customerInfo.address}</p>
                                                        <p className="text-sm">{order.customerInfo.city}, {order.customerInfo.zipCode}</p>
                                                    </div>
                                                </div>
                                                {order.customerInfo.notes && (
                                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Notes</p>
                                                        <p className="text-sm text-gray-700 italic">{order.customerInfo.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Order items */}
                                {order.ordre?.items && order.ordre.items.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="font-bold text-lg mb-4 flex items-center">
                                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs mr-2">3</span>
                                            Order Items
                                        </h3>
                                        <div className="overflow-x-auto bg-gray-50 rounded-lg border border-gray-200">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Book</th>
                                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Price</th>
                                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {order.ordre.items.map((item, index) => (
                                                        <tr key={index} className="border-t hover:bg-gray-100 transition-colors">
                                                            <td className="px-4 py-3.5 text-sm font-medium">{item.name}</td>
                                                            <td className="px-4 py-3.5 text-sm text-right">{item.quantity}</td>
                                                            <td className="px-4 py-3.5 text-sm text-right">${item.price}</td>
                                                            <td className="px-4 py-3.5 text-sm font-medium text-right text-blue-700">
                                                                ${(item.quantity * item.price).toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-gray-50 border-t border-gray-200">
                                                        <td colSpan="3" className="px-4 py-3 text-right text-sm font-medium">Total</td>
                                                        <td className="px-4 py-3 text-right text-blue-700 font-bold">
                                                            ${order.ordre.total}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CartOrdersManagement;