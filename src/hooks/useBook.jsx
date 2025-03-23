import { useState, useEffect } from "react";
import pb from "../lib/pocketbase";

function useBook ()  {
    const [books, setBooks] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
     const normalizeGenre = (genre) => {
        if(typeof genre !== 'string' || !genre.trim()) {

            return 'Uncategorized';
        }
        return genre.trim().charAt(0).toUpperCase() + genre.trim().slice(1).toLowerCase();
    };

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const response = await pb.collection('Books').getList(1, 50, {
                sort: '-created',
            });

            if (!response?.items) {
                throw new Error('Invalid response format');
            }

            const booksWithImages = response.items.map((book) => ({
                ...book,
                imageUrl: book.image ? pb.files.getURL(book, book.image) : null,
            }));

            setBooks(booksWithImages);
            setError(null);
        } catch (error) {
            console.error('Error fetching books:', error);
            setError('Failed to load books. Please try again later.');
            setBooks([]); // Reset books on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);
    
    return { books, error, loading, fetchBooks };
}

export default useBook;