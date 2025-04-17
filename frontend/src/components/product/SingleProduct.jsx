import React, { useState, useContext, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { ToyStore } from "../context/ContextApi";
import RelatedProducts from "./RelatedProducts";
import { ArrowRight, ArrowLeft, Play } from 'lucide-react';
import axios from "axios";
import ReviewsList from "./ReviewList";

const formatStringToList = (str) => {
  if (!str || typeof str !== "string") return [];
  return str
    .split(",") // Split by commas
    .map((item) => item.trim()) // Trim spaces around each item
    ?.filter((item) => item.length > 0) // Remove any empty items
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1)); // Capitalize each item
};

const ImageCarousel = ({
  images,
  currentIndex,
  onNext,
  onPrev,
  productName,
}) => (
  <div className="relative w-full h-96 mb-8 p-10">
    <motion.img
      key={currentIndex}
      src={images[currentIndex]}
      alt={`${productName} - Image ${currentIndex + 1}`}
      className="w-full h-full object-contain rounded-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    />
    {images.length > 1 && (
      <>
        <div className="absolute inset-0 flex items-center justify-between p-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-white/80 p-2 rounded-full shadow-lg hover:bg-white"
            onClick={onPrev}
          >
            ←
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-white/80 p-2 rounded-full shadow-lg hover:bg-white"
            onClick={onNext}
          >
            →
          </motion.button>
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                idx === currentIndex ? "bg-blue-500" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </>
    )}
  </div>
);

const ProductInfo = ({ label, items }) => (
  <div className="space-y-2">
    <h3 className="text-xl font-semibold text-gray-800">{label}</h3>
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-center space-x-2">
          <span className="text-blue-500">•</span>
          <span className="text-gray-600">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const PriceTag = ({ price, discount }) => {
  const Discount = discount || 0;

  // Ensure price and discount are numbers
  const numericPrice = Number(price);
  const numericDiscount = Number(Discount);

  // Calculate discounted price
  const discountedPrice = numericPrice - (numericPrice * numericDiscount) / 100;

  return (
    <div className="flex items-center gap-3 ">
      <span className="text-2xl font-bold text-blue-600">
        ₹ {discountedPrice.toFixed(2)}
      </span>
      {numericDiscount > 0 && (
        <>
          <span className="text-lg text-gray-400 line-through">
            ${numericPrice}
          </span>
          <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded">
            {numericDiscount}% OFF
          </span>
        </>
      )}
    </div>
  );
};





const SingleProduct = () => {
  const {
    sidebarState,
    closeSidebar,
    addToCart,
    setSingleProduct,
    setShowPayment,
    setSignIn,
    cartItems,
    setCartClicked
  } = useContext(ToyStore);

  const product = sidebarState.product;


  const [cartMessage, setCartMessage] = useState("");
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingFilter, setRatingFilter] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [newImages, setNewImages] = useState([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [isRated, setIsRated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState("");


  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  var isInCart = false;

  const selectedProduct = product?.colors?.find(
    (c) => c.color === selectedColor
  ) || product?.colors?.[0] || null;

   if(selectedProduct)console.log(`selected product : ${selectedProduct.color}`);
  
  if (product && selectedProduct && selectedProduct.color) {
    const selectedColorIndex = product.colors.findIndex(
      (color) => color.color === selectedProduct.color
    );
    isInCart = cartItems.some((item) => item.productId === product._id && item.selectedColorIndex === selectedColorIndex)
  }


  useEffect(() => {
    if (product?.selectedColor) {
      setSelectedColor(product.selectedColor);
    } else if (product?.colors?.length > 0) {
      setSelectedColor(product.colors[0].color);
    } else {
      setSelectedColor("");
    }
  }, [product]);
  useEffect(() => {
    if (!sidebarState.isOpen || !product) return;
  
    const fetchIsRated = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const users = storedUser ? JSON.parse(storedUser) : null;
        const res = await axios.get(`${import.meta.env.VITE_API}/api/review/reviews/${encodeURIComponent(product.name)}`);
        console.log(res.data.reviews)
    
        const data = res.data;
        if (users) {
          const userHasReviewed = data.reviews?.some((review) => review.userEmail === users.email);
          console.log("User has reviewed:", userHasReviewed);
          setIsRated(userHasReviewed); 
        } else {
          setIsRated(false);
        }
      } catch (error) {
        console.log(`Error Fetching isRated: ${error}`);
      }
    };
  
    fetchIsRated();
  }, [product, sidebarState.isOpen]); 
  
  useEffect(() => {
    if (!sidebarState.isOpen || !product) return;
  
    const fetchReviews = async () => {
      try {
        const baseUrl = `${import.meta.env.VITE_API}/api/review`;
        const url = ratingFilter
          ? `${baseUrl}/reviews/${encodeURIComponent(product.name)}?ratingFilter=${ratingFilter}`
          : `${baseUrl}/reviews/${encodeURIComponent(product.name)}`;
  
        console.log("Fetching reviews from:", url);
  
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
          },
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
  
        const data = await response.json();
        console.log("Received data:", data);
  
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.totalReviews || 0);
  
      } catch (error) {
        console.error("Error fetching reviews:", error.message);
        setReviews([]);
        setAverageRating(0);
        setTotalReviews(0);
        toast.warning("Failed to load reviews. Please check your network or try again later. Details: " + error.message);
      }
    };
  
    fetchReviews();
  }, [product, sidebarState.isOpen, ratingFilter]); 
  

  if (!sidebarState.isOpen || !product) return null;

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev < selectedProduct.images.length - 1 ? prev + 1 : 0
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : selectedProduct.images.length - 1
    );
  };


  const handleAddToCart = () => {
    if (!selectedProduct || !product) return;
  
    const selectedColorIndex = product.colors.findIndex(
      (color) => color.color === selectedProduct.color
    );
  
    const cartProduct = {
      productId: product._id,
      name: product.name,
      price: product.price,
      color: selectedProduct.color, 
      images: selectedProduct.images,
      ageGroup: product.ageGroup,
      bestSellers: product.bestSellers,
      benefits: product.benefits, 
      createdAt: product.createdAt,
      description: product.description,
      features: product.features,
      discount: product.discount,
      newArrivals: product.newArrivals,
      quantity: product.quantity, 
      updatedAt: product.updatedAt,
    };
  
    
    addToCart(cartProduct, selectedColorIndex);
  
    setCartMessage("Item added to cart!");
    setTimeout(() => setCartMessage(""), 3000);
  };
  

  const handleCartClicked = () => {
    closeSidebar()
    setCartClicked((prev) => !prev);
  };

  const handleBuyNow = () => {
    
    const selectedColorIndex = product.colors.findIndex(
      (color) => color.color === selectedProduct.color
    );
  
    const cartProduct = {
      productId: product._id,
      name: product.name,
      price: product.price,
      color: selectedProduct.color, 
      images: selectedProduct.images,
      ageGroup: product.ageGroup,
      bestSellers: product.bestSellers,
      benefits: product.benefits, 
      createdAt: product.createdAt,
      description: product.description,
      features: product.features,
      discount: product.discount,
      newArrivals: product.newArrivals,
      quantity: product.quantity, 
      updatedAt: product.updatedAt,
    };
   
    setSingleProduct(cartProduct);
    closeSidebar();
    setShowPayment(true);
  };

  const handleRateProduct = () => {
    const checkUser = localStorage.getItem("user");
    console.log("User data:", checkUser);
    if (!checkUser) {
      closeSidebar();
      setSignIn(true);
    } else {
      setShowReviewForm(true);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; 
    setIsSubmitting(true);

    if (!newRating || !newComment) {
      toast.warning("Please provide both rating and comment");
      setIsSubmitting(false);
      return;
    }
    if (newImages.length > 3) {
      toast.warning("Maximum 3 images allowed");
      setIsSubmitting(false);
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.email) {
        toast.warning("Please sign in to submit a review");
        setSignIn(true);
        setIsSubmitting(false);
        return;
      }

      if (!product || !product.name) {
        toast.warning("Product information is missing. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const imageBase64 = await Promise.all(
        newImages.map((file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
        )
      );

      const reviewData = {
        productName: product.name,
        userEmail: user.email,
        rating: newRating,
        comment: newComment,
        images: imageBase64,
      };

      console.log("Sending data as JSON:", reviewData);

      const response = await fetch(`${import.meta.env.VITE_API}/api/review/addreview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        setNewRating(0);
        setNewComment("");
        setNewImages([]);
        setShowReviewForm(false);
        toast.success("Review submitted successfully!");
        const baseUrl = `${import.meta.env.VITE_API}/api/review`;
        const fetchUrl = `${baseUrl}/reviews/${encodeURIComponent(product.name)}`;
        
        const fetchResponse = await fetch(fetchUrl, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!fetchResponse.ok) throw new Error("Failed to fetch updated reviews");
        const fetchData = await fetchResponse.json();
        setReviews(fetchData.reviews || []);
        setAverageRating(fetchData.averageRating || 0);
        setTotalReviews(fetchData.totalReviews || 0);
        const userHasReviewed = fetchData.reviews?.some((review) => review.userEmail === user.email);
        setIsRated(userHasReviewed);
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        toast.warning(errorData.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.warning("Error submitting review: " + error.message);
    }finally{
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = files.length + newImages.length;

    if (totalImages > 3) {
      ("Maximum 3 images allowed");
      return;
    }

    setNewImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageClick = (clickedReview, clickedIndex) => {

    const allImagesWithReview = reviews
      .filter((review) => review.images && review.images.length > 0) 
      .flatMap((review) =>
        review.images.map((image) => ({
          imageUrl: image,
          userName: getUsernameFromEmail(review.userEmail),
          comment: review.comment,
          rating: review.rating,
          createdAt: review.createdAt,
        }))
      );
  
    const initialIndex = allImagesWithReview.findIndex(
      (img) =>
        img.imageUrl === clickedReview.images[clickedIndex] &&
        img.userName === getUsernameFromEmail(clickedReview.userEmail)
    );
  
    setModalImages(allImagesWithReview);
    setModalImageIndex(initialIndex);
    setShowImageModal(true);
  };

  const handlePrevImageInModal = () => {
    setModalImageIndex((prevIndex) => (prevIndex === 0 ? modalImages.length - 1 : prevIndex - 1));
  };
  
  const handleNextImageInModal = () => {
    setModalImageIndex((prevIndex) => (prevIndex === modalImages.length - 1 ? 0 : prevIndex + 1));
  }; 

  const closeImageModal = () => {
    setShowImageModal(false);
    setModalImages([]);
    setModalImageIndex(0);
  };

  const features = formatStringToList(product?.features);
  const benefits = formatStringToList(product?.benefits);
  const itemsIncluded = formatStringToList(product?.itemsIncluded);

  const StarRating = ({ rating, interactive = false, onRatingChange }) => {
    const stars = Array(5)
      .fill(0)
      .map((_, index) => (
        <svg
          key={index}
          className={`w-6 h-6 cursor-${interactive ? "pointer" : "default"} ${
            index < rating ? "fill-yellow-400" : "fill-gray-300"
          }`}
          onClick={interactive ? () => onRatingChange(index + 1) : null}
          viewBox="0 0 24 24"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ));
    return <div className="flex">{stars}</div>;
  };

  const getUsernameFromEmail = (email) => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    return user.username || email.split("@")[0]; 
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 120 }}
      className="fixed top-0 right-0 overflow-hidden w-full md:w-9/12 lg:w-7/12 h-full bg-white shadow-2xl z-50 overflow-y-auto scrollbar-none"
    >

        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm p-4 border-b">
          <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-4 right-4 w-10 h-10 text-bold flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              onClick={closeSidebar}
            >
              ✕
            </motion.button>
        </div>

        <div className="p-6 pt-16 space-y-8">
        {(selectedProduct.images?.length > 0 || selectedProduct.video) && (
          <div className="relative flex flex-col items-center">
            <div className="w-full">
              {/* Combined Media Section */}
              {(() => {
                // Build media items array
                const mediaItems = [];
                if (selectedProduct.images?.length > 0) {
                  mediaItems.push(
                    ...selectedProduct.images.map((image, index) => ({
                      type: "image",
                      src: image,
                      alt: `${selectedProduct.name} - Image ${index + 1}`,
                    }))
                  );
                }
                if (selectedProduct.video) {
                  mediaItems.splice(1, 0, {
                    type: "video",
                    src: selectedProduct.video,
                  }); // Video after first image
                }

                if (mediaItems.length === 0) return null;

                
                const currentMedia = mediaItems[currentImageIndex % mediaItems.length];

                return (
                  <div className="relative w-full">
                    {/* Main Media Display */}
                    <div className="w-full h-96 flex justify-center items-center transition-all duration-300">
                      {currentMedia.type === "image" ? (
                        <img
                          src={currentMedia.src}
                          alt={currentMedia.alt}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <video controls className="w-full h-full rounded-lg">
                          <source src={currentMedia.src} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>

                    {/* Navigation Buttons */}
                    {mediaItems.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setCurrentImageIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
                          }
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                        >
                          <ArrowLeft />
                        </button>
                        <button
                          onClick={() =>
                            setCurrentImageIndex((prev) => (prev + 1) % mediaItems.length)
                          }
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                        >
                          <ArrowRight />
                        </button>
                      </>
                    )}

                    {/* Thumbnails (optional, for debugging) */}
                    {mediaItems.length > 1 && (
                      <div className="flex justify-center mt-4 space-x-2 overflow-x-auto">
                        {mediaItems.map((media, index) => (
                          <div
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-16 h-16 flex-shrink-0 cursor-pointer rounded-md overflow-hidden border-2 ${
                              index === currentImageIndex ? "border-blue-500" : "border-gray-300"
                            }`}
                          >
                            {media.type === "image" ? (
                              <img
                                src={media.src}
                                alt={media.alt}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-xs text-gray-600">Video</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}


          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-800">{product.name}</h2>
            </div>

            <div className="text-2xl font-semibold text-gray-800">
            ₹ {product.price}
              {product.discount && (
                <span className="text-red-600 ml-2 text-lg">
                  (-{product.discount}%)
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-700">Age Group:</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {product.ageGroup}
              </span>
            </div>

          <p className="text-gray-600 leading-relaxed">{product?.description}</p>
            <div className="flex gap-2">
              <p className="text-xl font-semibold text-gray-800">Colors:</p>
                <div className="flex gap-2">
                {product?.colors?.map((colorObj, index) => (
                  <div
                    key={index}
                    className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                      selectedColor === colorObj.color ? "border-black" : "border-white"
                    }`}
                    style={{ backgroundColor: colorObj.color }}
                    title={colorObj.color}
                    onClick={() => setSelectedColor(colorObj.color)}
                  ></div>
                ))}
              </div>
            </div>

            {/* Product Information */}

            <div className="space-y-6">
              {product?.itemsIncluded && (
                <p className="font-semibold">What's Included: {product.itemsIncluded}</p>
              )}
              {product?.features && (
                <p className="font-semibold">Features: {product.features}</p>
              )}
              {product?.benefits && (
                <p className="font-semibold">Benefits: {product.benefits}</p>
              )}
            </div>
           

            {/* Action Buttons */}
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                onClick={handleBuyNow}
              >
                Buy Now
              </motion.button>

              {isInCart ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  onClick={handleCartClicked}
                >
                  View in Cart
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </motion.button>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
             
             <div className="flex flex-wrap items-center gap-2">

                <h3 className="ml-2 text-2xl font-bold text-gray-800">Customer Reviews</h3>

                <div className="flex items-center gap-1">
                  <StarRating rating={Math.round(averageRating)} />
                  <span className="text-gray-600">
                    {averageRating.toFixed(1)} / 5 ({totalReviews} reviews)
                  </span>
                </div>
                {!isRated && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-green-600 text-white ml-2 px-4 py-2 rounded-lg font-semibold 
                              hover:bg-green-700 transition-colors 
                              text-center sm:w-auto"
                    onClick={handleRateProduct}
                  >
                    Rate Product
                  </motion.button>
                )}
              </div>       
        </div>  

        <AnimatePresence>
            {showReviewForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 p-4 bg-gray-50 rounded-lg"
              >
                <h4 className="text-lg font-semibold">Add Your Review</h4>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Rating:</label>
                    <StarRating
                      rating={newRating}
                      interactive={true}
                      onRatingChange={setNewRating}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Comment:</label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      rows="3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Images (max 3):</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full"
                    />
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {newImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className= {isSubmitting ? "bg-gray-600 text-white font-sans px-4 py-2 rounded-lg hover:bg-gray-700" :
                        "bg-blue-600 text-white font-sans px-4 py-2 rounded-lg hover:bg-blue-700"
                      }
                    >
                     {isSubmitting ? "Uploading..." : "Upload Review"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
        </AnimatePresence>

        <div className="ml-3 mt-3 flex gap-2 flex-wrap">
          <button
            className={`px-3 py-1 rounded-full ${
              !ratingFilter ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setRatingFilter(null)}
          >
            All
          </button>
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              className={`px-3 py-1 rounded-full ${
                ratingFilter === star ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
              onClick={ ()=> { setRatingFilter(star); }}
            >
              {star} Star{star !== 1 ? "s" : ""}
            </button>
          ))}
        </div>

        <div className="ml-3 mt-3 mb-3 space-y-4 max-h-96 overflow-y-auto scrollbar-none">
          {reviews.length > 0 ? (
            <ReviewsList
              reviews={reviews}
              ratingFilter={ratingFilter}
              handleImageClick={handleImageClick}
              getUsernameFromEmail={getUsernameFromEmail}
            />
          ) : (
            <p className="text-gray-500">No reviews match the current filter</p>
          )}
        </div>

        <AnimatePresence>
          {showImageModal && modalImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
              onClick={closeImageModal}
            >
              <div
                className="relative flex flex-col w-[90%] sm:w-[700px] max-h-[90vh] sm:h-[450px] rounded-lg overflow-hidden bg-white shadow-lg sm:flex-row"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Image Section */}
                <div className="relative w-full h-56 sm:h-full sm:w-2/3 flex items-center justify-center bg-black">
                  <button
                    onClick={handlePrevImageInModal}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-lg bg-black/60 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/80 transition-colors z-10"
                  >
                    <ArrowLeft />
                  </button>

                  <img
                    src={modalImages[modalImageIndex].imageUrl}
                    alt="Enlarged Review"
                    className="w-full h-full object-contain p-2 sm:p-4"
                  />

                  <button
                    onClick={handleNextImageInModal}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-lg bg-black/60 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/80 transition-colors z-10"
                  >
                    <ArrowRight />
                  </button>

                  <p className="absolute bottom-1 right-1 text-white bg-black/60 px-2 py-1 rounded text-xs sm:bottom-2 sm:right-2 sm:text-sm">
                    {modalImageIndex + 1}/{modalImages.length}
                  </p>
                </div>

                {/* Review Section */}
                <div className="relative w-full min-h-[120px] sm:h-full sm:w-1/3 p-3 sm:p-4 flex flex-col bg-white ">
                  <button
                    className="absolute top-1 right-1 text-gray-500 hover:text-gray-700 text-lg z-10 sm:top-2 sm:right-2"
                    onClick={closeImageModal}
                  >
                    ✕
                  </button>

                  <div className="flex flex-col gap-2">
                    <h2 className="text-sm sm:text-lg font-semibold truncate">
                      {modalImages[modalImageIndex].userName}
                    </h2>
                    <div className="flex items-center gap-1">
                      <StarRating rating={modalImages[modalImageIndex].rating} />
                      <span className="text-xs sm:text-sm">
                        {modalImages[modalImageIndex].rating}/5
                      </span>
                    </div>
                    <div className="relative overflow-hidden">
                      <div className="overflow-y-auto max-h-[150px] sm:max-h-[200px] lg:max-h-[300px] scrollbar-none">
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                          {modalImages[modalImageIndex].comment}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-500 mt-2">
                      {new Date(modalImages[modalImageIndex].createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {cartMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
            >
              {cartMessage}
            </motion.div>
          )}
        </AnimatePresence>

    </motion.div>
  );
};


export default SingleProduct;