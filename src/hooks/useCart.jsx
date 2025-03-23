import { useState, useEffect } from 'react';
import pb from '../lib/pocketbase';
import { getOrCreateCartId } from '../services/cartIdentifier';

const useCart = () => {
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cartId] = useState(getOrCreateCartId());
    const [cartRecordId, setCartRecordId] = useState(null);
    const [notification, setNotification] = useState(null);

    const checkout = async (customerInfo) => {
        try {
            setLoading(true);
            setError(null);
            if (!cartRecordId) {
                throw new Error('No active cart found');
            }

            // Extract only customer information, ensuring cart data is not duplicated
            const { cart: customerCart, total: customerTotal, ...customerData } = customerInfo;
            
            const updatedCart = await pb.collection('Cart').update(cartRecordId, {
                customerInfo: customerData, // Only store customer data, not the entire cart again
                status: 'pending',
                active: false,
                orderDate: new Date().toISOString(),
                ordre: {
                    items: cart,
                    total: total, 
                    updated: new Date().toISOString()
                }
            });
            
            // Rest of function remains the same...
            setCart([]);
            setTotal(0);
            setCartRecordId(null);

            return {
                id: updatedCart.id,
                orderDate: updatedCart.orderDate,
                total: updatedCart.ordre.total,
                status: updatedCart.status
            };
        } catch (err) {
            setError('Failed to checkout');
            console.error('Error checking out:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = (cartItems) => {
        if (!Array.isArray(cartItems)) return 0;
        const newTotal = cartItems.reduce((sum, item) => 
            sum + (Number(item.price) * Number(item.quantity)), 0
        );
        setTotal(newTotal);
        return newTotal;
    };

    const cleanupAbandonedCarts = async () => {
        try {
            // Get all carts older than 24 hours
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);

            const records = await pb.collection('Cart').getList(1, 100, {
                filter: `created <= "${oneDayAgo.toISOString()}" && active = true`
            });

            if (records.items.length > 0) {
                const deletePromises = records.items.map(record => 
                    pb.collection('Cart').delete(record.id)
                );
                await Promise.all(deletePromises);
            }
        } catch (err) {
            console.error('Error cleaning up abandoned carts:', err);
        }
    };

    useEffect(() => {
        const loadCart = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Clean up old carts first
                await cleanupAbandonedCarts();
                
                const records = await pb.collection('Cart').getList(1, 1, {
                    filter: `cart_id = "${cartId}" && active = true`,
                    sort: '-created',
                });
       
                if (records.items.length > 0) {
                    const latestRecord = records.items[0];
                    setCartRecordId(latestRecord.id);
            
                    if (latestRecord.ordre && latestRecord.ordre.items) {
                        setCart(latestRecord.ordre.items);
                        calculateTotal(latestRecord.ordre.items);
                    }
                }
            } catch (err) {
                console.error('Error loading cart:', err);
                setError('Failed to load cart');
            } finally {
                setLoading(false);
            }
        };

        loadCart();
    }, [cartId]);

    // Add local storage persistence for better offline support
    useEffect(() => {
        if (cart.length > 0) {
            localStorage.setItem('cartItems', JSON.stringify(cart));
            localStorage.setItem('cartTotal', total);
        } else {
            localStorage.removeItem('cartItems');
            localStorage.removeItem('cartTotal');
        }
    }, [cart, total]);

    // Load from localStorage if backend fails
    useEffect(() => {
        if (error === 'Failed to load cart') {
            try {
                const savedCart = JSON.parse(localStorage.getItem('cartItems'));
                const savedTotal = parseFloat(localStorage.getItem('cartTotal') || '0');
                if (savedCart?.length > 0) {
                    setCart(savedCart);
                    setTotal(savedTotal);
                    setError('Using saved cart. You may need to refresh.');
                }
            } catch (err) {
                console.error('Error loading cart from localStorage:', err);
            }
        }
    }, [error]);

    const addToCart = async (book, quantity) => {
        try {
            setLoading(true);
            setError(null);

            if (!book?.id) {
                throw new Error('Invalid book data');
            }

            const existingItem = cart.find(item => item.book_id === book.id);
            let newCart;

            if (existingItem) {
                newCart = cart.map(item =>
                    item.book_id === book.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                const cartItem = {
                    book_id: book.id,
                    name: book.name,
                    price: Number(book.price),
                    quantity: Number(quantity),
                    imageUrl: book.imageUrl,
                    author: book.author,
                    genre: book.genre
                };
                newCart = [...cart, cartItem];
            }

            const newTotal = calculateTotal(newCart);

            const cartData = {
                ordre: {
                    items: newCart,
                    total: newTotal,
                    updated: new Date().toISOString()
                },
                total: newTotal,
                lastAccessed: new Date().toISOString()
            };

            if (cartRecordId) {
                await pb.collection('Cart').update(cartRecordId, cartData);
            } else {
                const newCartRecord = await pb.collection('Cart').create({
                    ...cartData,
                    cart_id: cartId,
                    active: true
                });
                setCartRecordId(newCartRecord.id);
            }

            setCart(newCart);
            setTotal(newTotal);
            
            setNotification({
                type: 'success',
                message: `Added ${book.name} to your cart`
            });
            
            setTimeout(() => setNotification(null), 3000);
        } catch (err) {
            setError('Failed to add item to cart');
            console.error('Error adding to cart:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (book_id) => {
        try {
            setLoading(true);
            setError(null);

            const newCart = cart.filter(item => item.book_id !== book_id);
            const newTotal = calculateTotal(newCart);

            if (cartRecordId) {
                await pb.collection('Cart').update(cartRecordId, {
                    ordre: {
                        items: newCart,
                        total: newTotal,
                        updated: new Date().toISOString()
                    },
                    total: newTotal,
                    lastAccessed: new Date().toISOString()
                });
                
                setCart(newCart);
                setTotal(newTotal);
            }
        } catch (err) {
            setError('Failed to remove item from cart');
            console.error('Error removing from cart:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const clearCart = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get all cart records for this cart_id
            const records = await pb.collection('Cart').getList(1, 50, {
                filter: `cart_id = "${cartId}"`,
            });

            // Delete all existing cart records
            if (records.items.length > 0) {
                const deletePromises = records.items.map(record => 
                    pb.collection('Cart').delete(record.id)
                );
                await Promise.all(deletePromises);
            }

            // Create new empty cart
            const newCartData = {
                cart_id: cartId,
                ordre: {
                    items: [],
                    total: 0,
                    updated: new Date().toISOString()
                },
                active: true,
                total: 0,
                updated: new Date().toISOString()
            };

            const newCart = await pb.collection('Cart').create(newCartData);
            setCartRecordId(newCart.id);
            setCart([]);
            setTotal(0);
            
        } catch (err) {
            setError('Failed to clear cart');
            console.error('Error clearing cart:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };  

    const updateQuantity = async (bookId, newQuantity) => {
        try {
            setLoading(true);
            setError(null);
            
            if (!cartRecordId) {
                throw new Error('No active cart found');
            }
            
            // Update local state first for better UI responsiveness
            const updatedCart = cart.map(item => 
                item.book_id === bookId 
                    ? { ...item, quantity: newQuantity } 
                    : item
            );
            
            setCart(updatedCart);
            
            // Calculate new total
            const newTotal = calculateTotal(updatedCart);
            
            // Update backend
            await pb.collection('Cart').update(cartRecordId, {
                ordre: {
                    items: updatedCart,
                    total: newTotal,
                    updated: new Date().toISOString()
                },
                total: newTotal,
                lastAccessed: new Date().toISOString()
            });
            
            return { success: true };
        } catch (error) {
            // Revert local state if update fails
            setError('Failed to update quantity');
            console.error('Error updating quantity:', error);
            
            // Reload cart from backend
            try {
                const record = await pb.collection('Cart').getOne(cartRecordId);
                if (record.ordre && record.ordre.items) {
                    setCart(record.ordre.items);
                    calculateTotal(record.ordre.items);
                }
            } catch (err) {
                console.error('Error reloading cart data:', err);
            }
            
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        cart,
        total,
        loading,
        error,
        addToCart,
        removeFromCart,
        clearCart,
        checkout,
        updateQuantity,
        setCart,
        setError,
        calculateTotal,
        notification,
        clearNotification: () => setNotification(null)
    };
};

export default useCart;