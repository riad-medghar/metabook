import React, { useState, useRef, useEffect } from "react";
import { motion } from 'framer-motion';
import R from "../assets/R.jpeg";
import { useNavigate } from "react-router-dom";
import useFeaturedBooks from "../hooks/useFeaturedBooks"; // Replace useBook with useFeaturedBooks
import { useTranslation } from 'react-i18next';
import { ArrowRight, ChevronRight, ChevronLeft, BookOpen } from 'lucide-react';
import pb from "../lib/pocketbase"; // Make sure to import your PocketBase instance

// Enhanced animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const bookCardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  },
  hover: {
    scale: 1.05,
    rotateY: 5,
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2), 0 10px 10px -5px rgba(0,0,0,0.1)",
    transition: {
      duration: 0.3
    }
  }
};

// Update your getImageUrl function
const getImageUrl = (book) => {
  if (!book || !book.id) return null;
  
  try {
    // First try direct URL access if available
    if (book.imageUrl) {
      return book.imageUrl;
    }
    
    // Then try PocketBase file URLs with authentication
    if (book.image) {
      // Get the token from PocketBase
      const token = pb.authStore.token;
      
      // Construct URL with authentication
      return `${pb.baseUrl}/api/files/${book.collectionId || 'books'}/${book.id}/${book.image}?token=${token}`;
    }
    
    // If no image field, return null
    return null;
  } catch (err) {
    console.error("Error getting image URL:", err);
    return null;
  }
};

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { featuredBooks: books, error, loading } = useFeaturedBooks(); // Use the new hook
  const navigate = useNavigate();
  const { t } = useTranslation();
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);  // New state for pausing
  
  const handleBookClick = (book) => {
    navigate(`/book/${book.id}`);
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const isResettingScroll = useRef(false);
  const scrollDirection = useRef(1); // 1 = right, -1 = left

  // Create a single, more robust useEffect for scrolling
  useEffect(() => {
    if (!books?.length || loading) return;
    
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    
    // Use requestAnimationFrame for smoother animation
    let animationId;
    const scrollSpeed = 1; // pixels per frame - adjust as needed
    
    const scroll = () => {
      if (isPaused || isResettingScroll.current) {
        animationId = requestAnimationFrame(scroll);
        return;
      }
      
      // Get container dimensions
      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
      
      // Move in current direction
      scrollContainer.scrollLeft += scrollSpeed * scrollDirection.current;
      
      // Check if we should change direction
      if (scrollContainer.scrollLeft >= maxScroll - 5) {
        // Reached right end - reverse direction
        scrollDirection.current = -1;
      } else if (scrollContainer.scrollLeft <= 5) {
        // Reached left end - reverse direction
        scrollDirection.current = 1;
      }
      
      animationId = requestAnimationFrame(scroll);
    };
    
    // Start the animation
    animationId = requestAnimationFrame(scroll);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [books, loading, isPaused]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-b from-white to-gray-50"
    >
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16 px-4 sm:px-6 lg:px-8 rounded-b-[3rem] shadow-sm">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            variants={itemVariants}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 mb-4 tracking-tight">
              {t('home.welcome', 'Welcome to')} <span className="text-blue-600">MetaBook</span>
            </h1>
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto"
              variants={itemVariants}
            >
              {t('home.slogan', 'Your one stop shop for all your book needs')}
            </motion.p>
            <motion.button
              className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium 
                flex items-center gap-2 mx-auto shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/catalog')}
            >
              {t('home.exploreCatalog', 'Explore Our Books')}
              <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* About Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row gap-12 mb-8">
          <motion.div 
            variants={itemVariants}
            className="w-full sm:w-1/2 space-y-6"
          >
            <div className="inline-block bg-blue-50 rounded-full px-4 py-1.5 text-blue-700 font-medium text-sm mb-2">
              {t('home.aboutUs', 'About Us')}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-800">
              {t('home.aboutTitle', 'About Our Enterprise')}
            </h2>
            <motion.div 
              className="space-y-5 text-gray-600 leading-relaxed"
              variants={itemVariants}
            >
              <p className="text-lg">
                {t('home.aboutText1', 'MetaBook is dedicated to providing the best selection of books for all your needs. We pride ourselves on our excellent customer service and our commitment to quality. Whether you\'re looking for the latest bestseller or a rare classic, we have something for everyone.')}
              </p>
              <p className="text-lg">
                {t('home.aboutText2', 'Partnering with us means gaining access to a vast collection of books, competitive pricing, and a team that is passionate about helping you find exactly what you need. Join us and experience the MetaBook difference.')}
              </p>
            </motion.div>
            <motion.img 
              src={R} 
              alt={t('home.bookImage', 'Book')}
              className="w-full rounded-2xl shadow-lg sm:hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
          <motion.div 
            variants={itemVariants}
            className="hidden sm:block w-1/2"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative h-full overflow-hidden rounded-2xl shadow-xl">
              <div className="absolute inset-0 bg-blue-900/10 z-10"></div>
              <img 
                src={R} 
                alt={t('home.storeImage', 'Bookstore')} 
                className="w-full h-full object-cover object-center rounded-2xl" 
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Book Gallery Section */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-16 px-4 sm:px-6 lg:px-8 rounded-t-[3rem]">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="space-y-10"
            variants={itemVariants}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 flex items-center gap-3">
                <BookOpen className="text-blue-600" size={32} />
                {t('home.ourBooks', 'Our Books')}
              </h2>
              <button 
                onClick={() => navigate('/catalog')}
                className="text-blue-600 font-medium flex items-center gap-1 hover:text-blue-800 transition-colors"
              >
                {t('common.viewAll', 'View All')}
                <ChevronRight size={18} />
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center">
                {error}
              </div>
            ) : books && books.length > 0 ? (
              <div className="relative"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <div className="overflow-x-auto scrollbar-hide py-4" ref={scrollRef}>
                  <div className="flex gap-6 pb-4 pl-4">
                    {books.map((book, index) => (
                      <motion.div 
                        key={`${book.id}-${index}`}
                        className="flex-none cursor-pointer relative group"
                        onClick={() => handleBookClick(book)}
                        variants={bookCardVariants}
                        whileHover="hover"
                        custom={index}
                        transition={{ delay: index * 0.05 }}
                      >
                        <motion.div className="h-80 w-56 relative">
                          <motion.img 
                            src={getImageUrl(book) || "/assets/book-placeholder.png"}
                            alt={book.name}
                            className="h-full w-full object-cover rounded-xl shadow-lg"
                            layoutId={`book-${book.id}`}
                            onError={(e) => {
                              console.log("Image failed to load:", e.target.src); // DEBUG
                              // Use a data URI that's guaranteed to work
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='320' viewBox='0 0 240 320'%3E%3Crect width='240' height='320' fill='%23f3f4f6'/%3E%3Ctext x='120' y='160' font-family='Arial' font-size='16' text-anchor='middle' fill='%236b7280'%3ENo Cover%3C/text%3E%3C/svg%3E";
                            }}
                          />
                          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <h3 className="text-white font-medium line-clamp-2">{book.name}</h3>
                            <p className="text-gray-300 text-sm">{book.author}</p>
                          </div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Scroll buttons */}
                <div className="hidden sm:block">
                  <button 
                    onClick={scrollLeft} 
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-white p-3 rounded-full shadow-lg z-10 hover:bg-gray-100"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="text-gray-700" />
                  </button>
                  <button 
                    onClick={scrollRight} 
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 bg-white p-3 rounded-full shadow-lg z-10 hover:bg-gray-100"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="text-gray-700" />
                  </button>
                </div>

                <style>
                  {`
                    .scrollbar-hide::-webkit-scrollbar {
                      display: none;
                    }
                    .scrollbar-hide {
                      -ms-overflow-style: none;
                      scrollbar-width: none;
                    }
                  `}
                </style>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl text-center shadow-sm">
                <p className="text-gray-500">{t('home.noBooks', 'No books available at the moment')}</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Features/Benefits Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          className="text-center mb-12"
          variants={itemVariants}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            {t('home.whyChooseUs', 'Why Choose MetaBook')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('home.chooseUsDesc', 'We offer the best book shopping experience with our wide selection and excellent service')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {[
            {
              title: t('home.feature1Title', 'Vast Selection'),
              desc: t('home.feature1Desc', 'Thousands of books across all genres and interests')
            },
            {
              title: t('home.feature2Title', 'Expert Recommendations'),
              desc: t('home.feature2Desc', 'Get personalized suggestions from our book experts')
            },
            {
              title: t('home.feature3Title', 'Fast Delivery'),
              desc: t('home.feature3Desc', 'Books delivered to your doorstep in record time')
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4 mx-auto">
                {index + 1}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Home;