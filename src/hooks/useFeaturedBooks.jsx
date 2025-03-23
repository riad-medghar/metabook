import { useState, useEffect } from 'react';
import pb from '../lib/pocketbase';

// Use a named function declaration instead of an anonymous function expression
function useFeaturedBooks() {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeaturedBooks = async () => {
    try {
      setLoading(true);
      
      // Fetch only books marked as featured by admin
      const result = await pb.collection('books').getList(1, 50, {
        filter: 'featured = true',
        sort: '-created'
      });
      
      // Just use the featured books, even if the array is empty
      setFeaturedBooks(result.items);
      
    } catch (err) {
      console.error('Error fetching featured books:', err);
      setError('Failed to load featured books. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedBooks();
  }, []);

  // Add a refresh function to allow manual refreshing
  const refreshFeaturedBooks = () => {
    setLoading(true);
    setError(null);
    fetchFeaturedBooks();
  };

  return { featuredBooks, loading, error, refreshFeaturedBooks };
}

// Export the named function directly
export default useFeaturedBooks;