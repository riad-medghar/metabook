import pb from '../lib/pocketbase';
import { getOrCreateCartId} from './cartIdentifier';

export const createCart = async () => {
  try {
    const cartId = getOrCreateCartId();
    const cart = await pb.collection('Cart').create({
      cart_id: cartId,
      ordre: {
        items: [],
        total: 0,
        active: true
      }
    });
    localStorage.setItem('cartId', cart.id);
    return cart;
  } catch (error) {
    console.error('Error creating cart:', error);
    throw error;
  }
};

export const getOrCreateCart = async () => {
  const cartId = localStorage.getItem('cartId');
  
  if (cartId) {
    try {
      const cart = await pb.collection('Cart').getOne(cartId);
      return cart;
    } catch (error) {
      localStorage.removeItem('cartId');
      return createCart();
    }
  }
  
  return createCart();
};

export const addToCart = async (book, quantity = 1) => {
  try {
    const cart = await getOrCreateCart();
    const cartItems = cart.ordre?.items || [];
    
    const existingItemIndex = cartItems.findIndex(item => item.book_id === book.id);
    
    if (existingItemIndex > -1) {
      cartItems[existingItemIndex].quantity += quantity;
    } else {
      cartItems.push({
        book_id: book.id,
        name: book.name,
        price: Number(book.price),
        quantity: Number(quantity),
        imageUrl: book.image ? pb.files.getURL(book, book.image) : null,
        author: book.author,
        genre: book.genre
      });
    }
    
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return pb.collection('Cart').update(cart.id, {
      ordre: {
        items: cartItems,
        total,
        updated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};